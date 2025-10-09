import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, Button, Drawer, IconButton, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { checkTokenValidity } from '../../terra-front/utils/jwt';
import api from '../../terra-front/modules/Api/services/api';

const DeclarationModule = ({
  open = false,
  onClose,
  onMapClick = () => {},
  selectedLocation = null,
}) => {
  const [formData, setFormData] = useState({});
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [waitingForMapClick, setWaitingForMapClick] = useState(false);
  const [declarationConfig, setDeclarationConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [images, setImages] = useState([]);

  const isAuthenticated = React.useMemo(() => {
    const token = global.localStorage.getItem('tf:auth:token');
    return token && checkTokenValidity(token);
  }, []);

  // Charger la configuration de déclaration
  useEffect(() => {
    const loadDeclarationConfig = async () => {
      if (!open) return;

      try {
        setIsLoadingConfig(true);
        const config = await api.request('geolayer/declaration/config');
        setDeclarationConfig(config);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erreur lors du chargement de la configuration:', error);
        setSubmitError('Erreur lors du chargement du formulaire');
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadDeclarationConfig();
  }, [open]);

  React.useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
      setWaitingForMapClick(false);
      onMapClick(false);
    }
  }, [selectedLocation, onMapClick]);

  React.useEffect(() => {
    if (open && !location) {
      setWaitingForMapClick(true);
      onMapClick(true);
    } else if (!open) {
      setWaitingForMapClick(false);
      onMapClick(false);
    }
  }, [open, location, onMapClick]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setWaitingForMapClick(true);
    onMapClick(true);
  };

  const renderFieldInput = field => {
    if (!field) return null;

    const { title, helptext } = field;
    const fieldKey = title.toLowerCase().replace(/\s+/g, '_');

    return (
      <Box key={fieldKey} sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={formData[fieldKey] || ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          error={!!validationErrors[fieldKey]}
          helperText={validationErrors[fieldKey] || helptext}
          multiline={
            title.toLowerCase().includes('description') ||
            title.toLowerCase().includes('présentation')
          }
          rows={
            title.toLowerCase().includes('description') ||
            title.toLowerCase().includes('présentation')
              ? 3
              : 1
          }
        />
      </Box>
    );
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
    try {
      setIsSubmitting(true);

      const errors = {};

      if (!location) {
        setSubmitError('Veuillez sélectionner une position sur la carte');
        return;
      }

      if (!isAuthenticated) {
        if (!formData.email || !formData.email.trim()) {
          errors.email = "L'email est obligatoire pour les utilisateurs non connectés";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Format d'email invalide";
        }
      }

      if (declarationConfig?.declaration_fields) {
        declarationConfig.declaration_fields.forEach(field => {
          const fieldKey = field.title.toLowerCase().replace(/\s+/g, '_');
          const value = formData[fieldKey];

          if (field.title.toLowerCase().includes('identifiant') && (!value || !value.trim())) {
            errors[fieldKey] = 'Ce champ est obligatoire';
          }
        });
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSubmitError('Veuillez corriger les erreurs du formulaire');
        return;
      }

      // Reset error only when validation passes
      setSubmitError(null);

      const formDataToSend = new FormData();
      const content = [];

      if (declarationConfig?.declaration_fields) {
        declarationConfig.declaration_fields.forEach(field => {
          const fieldKey = field.title.toLowerCase().replace(/\s+/g, '_');
          const value = formData[fieldKey];

          if (value && value.trim()) {
            content.push({
              title: field.title,
              value: value.trim(),
            });
          }
        });
      }

      if (formData.free_comment && formData.free_comment.trim()) {
        content.push({
          free_comment: formData.free_comment.trim(),
        });
      }

      formDataToSend.append('content', JSON.stringify(content));

      const geom = {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      };
      formDataToSend.append('geom', JSON.stringify(geom));

      if (!isAuthenticated && formData.email && formData.email.trim()) {
        formDataToSend.append('email', formData.email.trim());
      }

      images.forEach(image => {
        formDataToSend.append('files', image.file);
      });

      await api.request('geolayer/declaration/', {
        method: 'POST',
        body: formDataToSend,
      });

      setFormData({});
      setLocation(null);
      setWaitingForMapClick(false);
      onMapClick(false);
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setSubmitSuccess(true);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      setSubmitError(error.message || "Une erreur est survenue lors de l'envoi de la déclaration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setWaitingForMapClick(false);
    onMapClick(false);
    if (onClose) {
      onClose();
    }
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
          right: 40,
          maxHeight: 'calc(100vh - 16px)',
          height: 'auto',
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
            Nouvelle déclaration
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Déclaration envoyée avec succès !
          </Alert>
        )}

        {!location ? (
          <Box sx={{ textAlign: 'center', py: 0 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Cliquez sur la carte pour sélectionner l'emplacement de votre déclaration
            </Alert>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Alert
                severity="success"
                sx={{ mb: 1, alignItems: 'bottom' }}
                action={(
                  <IconButton color="inherit" size="small" onClick={clearLocation}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              >
                Position sélectionnée
              </Alert>
            </Box>

            <Box sx={{ mb: 3 }}>
              {isLoadingConfig && (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                  Chargement du formulaire...
                </Typography>
              )}
              {!isLoadingConfig &&
                declarationConfig?.declaration_fields &&
                declarationConfig.declaration_fields.map(field => renderFieldInput(field))}
              {!isLoadingConfig && !declarationConfig?.declaration_fields && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  Aucun champ de formulaire disponible
                </Typography>
              )}
            </Box>

            {!isAuthenticated && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Email *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="email"
                  placeholder="Votre adresse email"
                  value={formData.email || ''}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  error={!!validationErrors.email}
                  helperText={
                    validationErrors.email || 'Nécessaire pour le suivi de votre déclaration'
                  }
                  required
                />
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Commentaire libre
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Ajoutez ici tout commentaire supplémentaire (optionnel)"
                multiline
                rows={3}
                value={formData.free_comment || ''}
                onChange={e => handleFieldChange('free_comment', e.target.value)}
                helperText="Ce commentaire sera ajouté à votre déclaration"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Pièces jointes
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
                  {images.length}/3 fichiers ajoutés
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
                          borderRadius: 4,
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {submitError && (
                <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem' }}>
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
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la déclaration'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

DeclarationModule.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onMapClick: PropTypes.func,
  selectedLocation: PropTypes.shape({
    lng: PropTypes.number,
    lat: PropTypes.number,
  }),
};

DeclarationModule.defaultProps = {
  open: false,
  onClose: () => {},
  onMapClick: () => {},
  selectedLocation: null,
};

export default DeclarationModule;
