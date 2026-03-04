import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import bbox from '@turf/bbox';
import { Box, Typography, CircularProgress } from '@mui/material';

const getCoordinates = geometry => {
  if (!geometry) return null;
  try {
    const [minX, minY, maxX, maxY] = bbox(geometry);
    return {
      lng: (minX + maxX) / 2,
      lat: (minY + maxY) / 2,
    };
  } catch {
    return null;
  }
};

const PanoramaxBlock = ({ geometry }) => {
  const coords = useMemo(() => getCoordinates(geometry), [geometry]);
  const [photoId, setPhotoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords) return;

    const fetchNearestPhoto = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `https://api.panoramax.xyz/api/search?limit=1&place_position=${coords.lng},${coords.lat}&place_distance=5-100`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.features || data.features.length === 0) {
          setError('Aucune photo trouvée à proximité');
          return;
        }

        setPhotoId(data.features[0].id);
      } catch (e) {
        setError(`Erreur lors du chargement: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNearestPhoto();
  }, [coords]);

  if (!coords) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Coordonnées non disponibles</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!photoId) {
    return null;
  }

  const panoramaxUrl = `https://api.panoramax.xyz/#focus=pic&map=none&pic=${photoId}`;

  return (
    <Box sx={{ width: '100%', minHeight: 400 }}>
      <Box
        component="iframe"
        src={panoramaxUrl}
        title="Vue Panoramax"
        allowFullScreen
        sx={{
          width: '100%',
          height: 400,
          border: 'none',
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

PanoramaxBlock.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  geometry: PropTypes.object,
};

PanoramaxBlock.defaultProps = {
  geometry: null,
};

export default PanoramaxBlock;
