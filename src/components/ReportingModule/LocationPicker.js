import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Map, Marker } from 'react-map-gl/maplibre';

const LocationPicker = ({ value, onChange, helperText, featureBbox }) => {
  const [mapOpen, setMapOpen] = useState(false);

  // Calculate initial view state based on featureBbox or default values
  const getInitialViewState = React.useCallback(() => {
    if (featureBbox) {
      const { minLng, minLat, maxLng, maxLat } = featureBbox;
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      // Calculate zoom level based on bbox size
      const lngDiff = maxLng - minLng;
      const latDiff = maxLat - minLat;
      const maxDiff = Math.max(lngDiff, latDiff);

      // Simple zoom calculation (adjust as needed)
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
      longitude: value?.lng || 2.3488,
      latitude: value?.lat || 48.8534,
      zoom: 10,
    };
  }, [featureBbox, value]);

  const [viewState, setViewState] = useState(getInitialViewState());

  // Update view state when featureBbox changes
  React.useEffect(() => {
    if (featureBbox && mapOpen) {
      setViewState(getInitialViewState());
    }
  }, [featureBbox, mapOpen, getInitialViewState]);

  const handleMapClick = useCallback(
    event => {
      const { lng, lat } = event.lngLat;
      onChange({ lng, lat });
    },
    [onChange],
  );

  const handleClearLocation = () => {
    onChange(null);
    setMapOpen(false);
  };

  const formatCoordinates = coords => {
    if (!coords) return '';
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      {!mapOpen && (
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
          <IconButton size="small" onClick={handleClearLocation} color="error">
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {mapOpen && (
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
            }}
          >
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              onClick={handleMapClick}
              mapLib={maplibregl}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              cursor="crosshair"
            >
              {value && <Marker longitude={value.lng} latitude={value.lat} />}
            </Map>
          </Box>
        )}
      </Collapse>
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
};

LocationPicker.defaultProps = {
  value: null,
  helperText: null,
  featureBbox: null,
};

export default LocationPicker;
