import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import bbox from '@turf/bbox';
import React, { useState } from 'react';
import api from '../../terra-front/modules/Api/services/api';
import { checkTokenValidity } from '../../terra-front/utils/jwt';
import FeatureProperties from '../../terra-front/modules/Map/FeatureProperties';
import LocationPicker from './LocationPicker';

const ReportingModule = ({
  open = false,
  onClose,
  layer,
  featureId = null,
  featureGeometry = null,
  fetchProperties = {},
}) => {
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const reportConfigs = layer?.report_configs || [];

  // Get the currently selected config
  const selectedConfig = reportConfigs[selectedConfigIndex] || reportConfigs[0];

  // Calculate bbox when featureGeometry changes using Turf
  const featureBbox = React.useMemo(() => {
    if (!featureGeometry) {
      return null;
    }

    try {
      // Use Turf's bbox function which returns [minLng, minLat, maxLng, maxLat]
      const bboxArray = bbox(featureGeometry);
      return {
        minLng: bboxArray[0],
        minLat: bboxArray[1],
        maxLng: bboxArray[2],
        maxLat: bboxArray[3],
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating bbox:', error);
      return null;
    }
  }, [featureGeometry]);

  const isAuthenticated = React.useMemo(() => {
    const token = global.localStorage.getItem('tf:auth:token');
    return token && checkTokenValidity(token);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const hasValidFetchProperties = fetchProperties?.id && fetchProperties?.url;

  if (!hasValidFetchProperties) {
    return null;
  }

  return (
    <FeatureProperties {...fetchProperties}>
      {featureProperties => {
        const extractFeatureIdFromFeature = featureData => {
          if (featureData?.id !== undefined) {
            return featureData.id;
          }
          return null;
        };

        const actualFeatureId = featureProperties
          ? extractFeatureIdFromFeature(featureProperties)
          : null;

        const submitReport = async submitData => {
          try {
            setIsSubmitting(true);
            setSubmitError(null);

            const formDataToSend = new FormData();

            // Add config, feature, and layer
            formDataToSend.append('config', selectedConfig?.id || reportConfigs[0]?.id);
            formDataToSend.append('feature', actualFeatureId || '');

            // Add geometry if location is selected
            if (location) {
              const geom = {
                type: 'Point',
                coordinates: [location.lng, location.lat],
              };
              formDataToSend.append('geom', JSON.stringify(geom));
            }

            // Prepare content array with proper structure
            const content = submitData.map(item => {
              if (item.sourceFieldId === 'freeComment') {
                return { free_comment: item.userComment };
              }
              return {
                sourceFieldId: item.sourceFieldId,
                value: item.fieldValue,
                label: item.label || '',
                content: item.userComment,
              };
            });

            formDataToSend.append('content', JSON.stringify(content));

            // Add images
            images.forEach(image => {
              formDataToSend.append('files', image.file);
            });

            // Use the existing API service that handles JWT and CSRF automatically
            const result = await api.request('geolayer/report/', {
              method: 'POST',
              body: formDataToSend,
            });

            // Reset form after successful submission
            setFormData({});
            images.forEach(img => URL.revokeObjectURL(img.preview));
            setImages([]);
            setLocation(null);

            if (onClose) {
              onClose();
            }

            return result;
          } catch (error) {
            setSubmitError(
              error.message || "Une erreur est survenue lors de l'envoi du signalement",
            );
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        };

        const handleFieldChange = (fieldId, value) => {
          setFormData(prev => ({
            ...prev,
            [fieldId]: value,
          }));
          if (validationErrors[fieldId]) {
            setValidationErrors(prev => ({
              ...prev,
              [fieldId]: null,
            }));
          }
        };

        const handleImageUpload = event => {
          const files = Array.from(event.target.files);
          const newImages = [...images];

          // Add new files up to a maximum of 3 total
          files.forEach(file => {
            if (newImages.length < 3) {
              newImages.push({
                file,
                preview: URL.createObjectURL(file),
                id: Date.now() + Math.random(), // Simple unique ID
              });
            }
          });

          setImages(newImages);
        };

        const removeImage = imageId => {
          setImages(prev => {
            const updated = prev.filter(img => img.id !== imageId);
            // Clean up object URLs to prevent memory leaks
            const removed = prev.find(img => img.id === imageId);
            if (removed) {
              URL.revokeObjectURL(removed.preview);
            }
            return updated;
          });
        };

        const handleSubmit = async () => {
          const errors = {};

          if (selectedConfig?.fields) {
            selectedConfig.fields.forEach(field => {
              if (field.required) {
                const value = formData[field.sourceFieldId];
                if (!value || !value.trim()) {
                  errors[field.sourceFieldId] = 'Ce champ est obligatoire';
                }
              }
            });
          }

          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
          }

          // Format data as array of objects for each field that has a comment
          const submitData = [];

          // Process field comments
          Object.entries(formData).forEach(([fieldId, comment]) => {
            if (comment && comment.trim() && fieldId !== 'freeComment') {
              // Find the field configuration in the selected config
              const field = selectedConfig?.fields.find(
                f => f.sourceFieldId.toString() === fieldId,
              );
              if (field) {
                submitData.push({
                  sourceFieldId: field.sourceFieldId,
                  fieldValue: field.value,
                  userComment: comment.trim(),
                  label: field.label,
                });
              }
            }
          });

          // Add free comment as a special entry if it exists
          if (formData.freeComment && formData.freeComment.trim()) {
            submitData.push({
              sourceFieldId: 'freeComment',
              fieldValue: null,
              userComment: formData.freeComment.trim(),
            });
          }

          // Submit the report
          try {
            await submitReport(submitData);
          } catch (error) {
            // Error is already handled in submitReport function
          }
        };

        // Render text input for comments with helper text showing field type
        const renderFieldInput = field => {
          if (!field) return null;

          const { required, sourceFieldId, helptext } = field;

          return (
            <TextField
              fullWidth
              size="small"
              type="text"
              variant="outlined"
              sx={{ mb: 2 }}
              multiline
              rows={2}
              required={required}
              error={!!validationErrors[sourceFieldId]}
              helperText={validationErrors[sourceFieldId] || helptext}
              value={formData[sourceFieldId] || ''}
              onChange={e => handleFieldChange(sourceFieldId, e.target.value)}
            />
          );
        };

        return (
          <Drawer
            variant="persistent"
            anchor="right"
            open={open}
            sx={{
              width: 400,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 400,
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                margin: 1,
                height: 'calc(100vh - 16px)',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  mb: 2.5,
                  pb: 1.25,
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Signalement
                </Typography>
                {onClose && (
                  <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>

              {/* Configuration selector when multiple configs available */}
              {reportConfigs.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type de signalement</InputLabel>
                    <Select
                      value={selectedConfigIndex}
                      label="Type de signalement"
                      onChange={e => setSelectedConfigIndex(e.target.value)}
                    >
                      {reportConfigs.map((config, index) => (
                        <MenuItem key={config.id || index} value={index}>
                          {config.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Display fields only if single config or config is selected */}
              {selectedConfig && (
                <List
                  sx={{
                    '& .MuiListItem-root': {
                      padding: 0,
                    },
                  }}
                >
                  <ListItem disablePadding>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedConfig.label}
                      </Typography>
                      <List sx={{ pl: 2 }}>
                        {selectedConfig.fields.map((field, fieldIndex) => (
                          <ListItem
                            key={field.sourceFieldId || fieldIndex}
                            disablePadding
                            sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                          >
                            <ListItemText primary={`${field.label}`} sx={{ my: 0.5 }} />
                            <Box sx={{ mt: 1, mb: 2 }}>{renderFieldInput(field)}</Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </ListItem>
                </List>
              )}

              {/* Free text comment section */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Commentaire libre
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  variant="outlined"
                  placeholder="Commentaire général (optionnel)"
                  helperText="Ajoutez ici tout commentaire supplémentaire"
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  value={formData.freeComment || ''}
                  onChange={e => handleFieldChange('freeComment', e.target.value)}
                />
              </Box>

              {/* Image upload section */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Fichiers joints
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      disabled={images.length >= 3}
                    >
                      Joindre un fichier
                    </Button>
                  </label>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
                  >
                    {images.length}/3 fichiers ajoutées
                  </Typography>
                </Box>

                {/* Image previews */}
                {images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {images.map(image => (
                      <Box
                        key={image.id}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <img
                          src={image.preview}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          onClick={() => removeImage(image.id)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'background.paper',
                            width: 20,
                            height: 20,
                            boxShadow: 1,
                            '&:hover': {
                              backgroundColor: 'error.light',
                            },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Location picker section */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Localisation (optionnel)
                </Typography>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  helperText="Sélectionnez la position géographique du signalement"
                  featureBbox={featureBbox}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {submitError && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mr: 2, alignSelf: 'center', fontSize: '0.875rem' }}
                  >
                    {submitError}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer signalement'}
                </Button>
              </Box>
            </Box>
          </Drawer>
        );
      }}
    </FeatureProperties>
  );
};

export default ReportingModule;
