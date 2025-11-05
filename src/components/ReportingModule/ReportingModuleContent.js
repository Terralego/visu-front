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
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import api from '../../terra-front/modules/Api/services/api';
import LocationPicker from './LocationPicker';

const ReportingModuleContent = ({
  open,
  onClose,
  layer,
  featureGeometry,
  mainField,
  reportConfigs,
  featureProperties,
}) => {
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const handleClose = () => {
    setFormData({});
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setLocation(null);
    setSubmitError(null);
    setValidationErrors({});
    onClose();
  };

  const featureBbox = useMemo(() => {
    if (!featureGeometry) {
      return null;
    }

    try {
      const bboxArray = bbox(featureGeometry);
      return {
        minLng: bboxArray[0],
        minLat: bboxArray[1],
        maxLng: bboxArray[2],
        maxLat: bboxArray[3],
      };
    } catch (error) {
      console.error('Error calculating bbox:', error);
      return null;
    }
  }, [featureGeometry]);

  const extractFeatureIdFromFeature = featureData => {
    if (featureData?.id !== undefined) {
      return featureData.id;
    }
    return null;
  };

  const actualFeatureId = featureProperties ? extractFeatureIdFromFeature(featureProperties) : null;

  const mainFieldValue = useMemo(() => {
    if (!mainField || !featureProperties) {
      return null;
    }
    return featureProperties[mainField] || null;
  }, [featureProperties, mainField]);

  const selectedConfig = reportConfigs[selectedConfigIndex] || reportConfigs[0];

  const submitReport = async submitData => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formDataToSend = new FormData();

      formDataToSend.append('config', selectedConfig?.id || reportConfigs[0]?.id);
      formDataToSend.append('feature', actualFeatureId || '');

      if (location) {
        const geom = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
        formDataToSend.append('geom', JSON.stringify(geom));
      }

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

      images.forEach(image => {
        formDataToSend.append('files', image.file);
      });

      const result = await api.request('geolayer/report/', {
        method: 'POST',
        body: formDataToSend,
      });

      setFormData({});
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setLocation(null);

      if (onClose) {
        onClose();
      }

      return result;
    } catch (error) {
      const errorData = error.data || {};
      if (
        errorData.content &&
        Array.isArray(errorData.content) &&
        errorData.content.length === 1 &&
        errorData.content[0].includes('cannot be empty')
      ) {
        setSubmitError("Veuillez remplir au moins un champ avant d'envoyer le signalement");
      } else {
        setSubmitError(error.message || "Une erreur est survenue lors de l'envoi du signalement");
      }
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

    files.forEach(file => {
      if (newImages.length < 3) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          id: Date.now() + Math.random(),
        });
      }
    });

    setImages(newImages);
  };

  const removeImage = imageId => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
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
      setSubmitError('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setSubmitError(null);

    const submitData = [];

    Object.entries(formData).forEach(([fieldId, comment]) => {
      if (comment && comment.trim() && fieldId !== 'freeComment') {
        const field = selectedConfig?.fields.find(f => f.sourceFieldId.toString() === fieldId);
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

    if (formData.freeComment && formData.freeComment.trim()) {
      submitData.push({
        sourceFieldId: 'freeComment',
        fieldValue: null,
        userComment: formData.freeComment.trim(),
      });
    }

    try {
      await submitReport(submitData);
    } catch (error) {
      // Error is already handled in submitReport function
    }
  };

  const renderFieldInput = field => {
    if (!field) return null;

    const { required, sourceFieldId, format_type: formatType, label } = field;

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
        helperText={`Champ source : ${label} (${formatType})`}
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
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {mainFieldValue ? `Signalement : ${mainFieldValue}` : 'Signalement'}
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={handleClose} size="small" sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

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
                <List sx={{ pl: 0 }}>
                  {selectedConfig.fields.map((field, fieldIndex) => (
                    <ListItem
                      key={field.sourceFieldId || fieldIndex}
                      disablePadding
                      sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <ListItemText
                        primary={`${field.helptext}`}
                        secondary={field.required && 'Champ requis'}
                        sx={{ my: 0.5 }}
                      />
                      <Box sx={{ mt: 1, mb: 2 }}>{renderFieldInput(field)}</Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </ListItem>
          </List>
        )}

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Commentaire libre
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="text"
            variant="outlined"
            helperText="Ajoutez ici tout commentaire supplémentaire"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            value={formData.freeComment || ''}
            onChange={e => handleFieldChange('freeComment', e.target.value)}
          />
        </Box>

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

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Localisation (optionnel)
          </Typography>
          <LocationPicker
            key={actualFeatureId || 'no-feature'}
            value={location}
            onChange={setLocation}
            helperText="Sélectionnez la position géographique du signalement"
            featureBbox={featureBbox}
            featureGeometry={featureGeometry}
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
            color={submitError ? 'error' : 'primary'}
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
};

ReportingModuleContent.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  layer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    report_configs: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(PropTypes.shape({
        sourceFieldId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string,
        helptext: PropTypes.string,
        format_type: PropTypes.string,
        required: PropTypes.bool,
        value: PropTypes.string,
      })),
    })),
  }).isRequired,
  featureGeometry: PropTypes.shape({
    type: PropTypes.string,
    coordinates: PropTypes.array,
  }),
  mainField: PropTypes.string,
  reportConfigs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
      sourceFieldId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string,
      helptext: PropTypes.string,
      format_type: PropTypes.string,
      required: PropTypes.bool,
      value: PropTypes.string,
    })),
  })).isRequired,
  featureProperties: PropTypes.object,
};

ReportingModuleContent.defaultProps = {
  featureGeometry: null,
  mainField: null,
  featureProperties: null,
};

export default ReportingModuleContent;
