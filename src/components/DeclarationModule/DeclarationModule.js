import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { checkTokenValidity } from '../../terra-front/utils/jwt';

const DeclarationModule = ({
  open = false,
  onClose,
  onMapClick = () => {},
  selectedLocation = null,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [waitingForMapClick, setWaitingForMapClick] = useState(false);

  const isAuthenticated = React.useMemo(() => {
    const token = global.localStorage.getItem('tf:auth:token');
    return token && checkTokenValidity(token);
  }, []);

  React.useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
      setWaitingForMapClick(false);
      onMapClick(false);
    }
  }, [selectedLocation, onMapClick]);

  // Déclencher automatiquement le mode attente de clic quand le drawer s'ouvre
  React.useEffect(() => {
    if (open && !location) {
      setWaitingForMapClick(true);
      onMapClick(true);
    } else if (!open) {
      setWaitingForMapClick(false);
      onMapClick(false);
    }
  }, [open, location, onMapClick]);

  // Pour les devs, on désactive temporairement la vérification d'authentification
  // if (!isAuthenticated) {
  //   return null;
  // }

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const clearLocation = () => {
    setLocation(null);
    setWaitingForMapClick(true); // Repasser en mode attente
    onMapClick(true); // Réécouter les clics
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validation basique
      if (!formData.title.trim()) {
        setSubmitError('Le titre est obligatoire');
        return;
      }

      if (!location) {
        setSubmitError('Veuillez sélectionner une position sur la carte');
        return;
      }

      // const dataToSend = {
      //   title: formData.title.trim(),
      //   description: formData.description.trim(),
      //   geometry: {
      //     type: 'Point',
      //     coordinates: [location.lng, location.lat],
      //   },
      //   created_at: new Date().toISOString(),
      // };

      // TODO: Remplacer par l'endpoint réel quand il sera disponible
      // await api.request('declaration/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(dataToSend),
      // });

      // Simulation d'un appel API réussi pour les devs
      // console.log('Déclaration envoyée (simulation):', dataToSend);

      // Reset form after successful submission
      setFormData({ title: '', description: '' });
      setLocation(null);
      setSubmitSuccess(true);

      // Auto close success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        if (onClose) {
          onClose();
        }
      }, 3000);
    } catch (error) {
      setSubmitError(
        error.message || "Une erreur est survenue lors de l'envoi de la déclaration",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset waiting state when closing
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

        {/* Instructions ou formulaire selon l'état */}
        {!location ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Cliquez sur la carte pour sélectionner l'emplacement de votre déclaration
            </Alert>
            {waitingForMapClick && (
              <Typography variant="body2" color="text.secondary">
                En attente de votre clic sur la carte...
              </Typography>
            )}
          </Box>
        ) : (
          <>
            {/* Affichage de la position sélectionnée */}
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 1 }}>
                Position sélectionnée: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Alert>
              <Button
                variant="text"
                color="secondary"
                onClick={clearLocation}
                size="small"
              >
                Changer la position
              </Button>
            </Box>

            {/* Form fields - maintenant conditionnels */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Titre *
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Titre de votre déclaration"
                value={formData.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Description détaillée (optionnel)"
                multiline
                rows={4}
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Submit section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {submitError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {submitError}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title.trim()}
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
