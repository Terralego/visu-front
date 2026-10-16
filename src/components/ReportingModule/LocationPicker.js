import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { Box, Button, Collapse, Dialog, IconButton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import LocationPickerMap from './LocationPickerMap';

const LocationPicker = ({
  value,
  onChange,
  helperText,
  featureBbox,
  featureGeometry,
  readOnly = false,
}) => {
  const [mapOpen, setMapOpen] = useState(readOnly);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const getInitialViewState = React.useCallback(() => {
    if (value) {
      return {
        longitude: value.lng,
        latitude: value.lat,
        zoom: 15,
      };
    }

    if (featureBbox) {
      const { minLng, minLat, maxLng, maxLat } = featureBbox;
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      const lngDiff = maxLng - minLng;
      const latDiff = maxLat - minLat;
      const maxDiff = Math.max(lngDiff, latDiff);

      let zoom = 10;
      if (maxDiff < 0.01) zoom = 15;
      else if (maxDiff < 0.1) zoom = 12;
      else if (maxDiff < 1) zoom = 8;
      else zoom = 6;

      return {
        longitude: centerLng,
        latitude: centerLat,
        zoom,
      };
    }

    return {
      longitude: 2.3488,
      latitude: 48.8534,
      zoom: 10,
    };
  }, [featureBbox, value]);

  const [viewState, setViewState] = useState(getInitialViewState());
  const [hasInitialized, setHasInitialized] = React.useState(false);

  React.useEffect(() => {
    if (mapOpen && !hasInitialized) {
      setViewState(getInitialViewState());
      setHasInitialized(true);
    }
  }, [mapOpen, hasInitialized, getInitialViewState]);

  // Auto-open map when in read-only mode
  React.useEffect(() => {
    if (readOnly && !mapOpen) {
      setMapOpen(true);
    }
  }, [readOnly, mapOpen]);

  const handleMapClick = useCallback(
    event => {
      if (readOnly) return;
      const { lng, lat } = event.lngLat;
      onChange({ lng, lat });
    },
    [onChange, readOnly],
  );

  const handleClearLocation = () => {
    if (readOnly) return;
    onChange(null);
    setMapOpen(false);
  };

  const formatCoordinates = coords => {
    if (!coords) return '';
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      {!mapOpen && !readOnly && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setMapOpen(true)}
            disabled={!!value}
          >
            Ajouter une localisation
          </Button>
        </Box>
      )}

      {mapOpen && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Position: {value ? formatCoordinates(value) : 'Non définie'}
          </Typography>
          {!readOnly && (
            <IconButton size="small" onClick={handleClearLocation} color="error">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      )}

      {mapOpen && !readOnly && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {helperText || 'Cliquez sur la carte pour sélectionner une position'}
        </Typography>
      )}

      <Collapse in={mapOpen}>
        {mapOpen && (
          <Box
            sx={{
              height: 200,
              width: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              mt: 1,
              position: 'relative',
              cursor: readOnly ? 'default' : 'crosshair',
            }}
          >
            <LocationPickerMap
              viewState={viewState}
              onMove={evt => setViewState(evt.viewState)}
              onClick={handleMapClick}
              value={value}
              featureGeometry={featureGeometry}
              readOnly={readOnly}
            />

            <IconButton
              size="small"
              onClick={() => setFullscreenOpen(true)}
              title="Ouvrir en plein écran"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1000,
                color: 'primary.main',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <FullscreenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
      </Collapse>

      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            maxHeight: '100%',
            width: '100%',
          },
        }}
      >
        <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                borderRadius: 1,
                padding: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Position: {value ? formatCoordinates(value) : 'Non définie'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setFullscreenOpen(false)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              cursor: readOnly ? 'default' : 'crosshair',
            }}
          >
            <LocationPickerMap
              viewState={viewState}
              onMove={evt => setViewState(evt.viewState)}
              onClick={handleMapClick}
              value={value}
              featureGeometry={featureGeometry}
              style={{ width: '100%', height: '100%' }}
              readOnly={readOnly}
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

LocationPicker.propTypes = {
  value: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  featureBbox: PropTypes.shape({
    minLng: PropTypes.number.isRequired,
    minLat: PropTypes.number.isRequired,
    maxLng: PropTypes.number.isRequired,
    maxLat: PropTypes.number.isRequired,
  }),
  featureGeometry: PropTypes.shape({
    type: PropTypes.string,
    coordinates: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.array, PropTypes.number])),
  }),
  readOnly: PropTypes.bool,
};

LocationPicker.defaultProps = {
  value: null,
  helperText: null,
  featureBbox: null,
  featureGeometry: null,
  readOnly: false,
};

export default LocationPicker;
