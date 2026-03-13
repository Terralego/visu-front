import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import bbox from '@turf/bbox';
import { Box, CircularProgress } from '@mui/material';

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

const PanoramaxBlock = ({ geometry, onEmpty }) => {
  const coords = useMemo(() => getCoordinates(geometry), [geometry]);
  const [photoId, setPhotoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPhotoId(null);
    setNotFound(false);
    setLoading(true);

    if (!coords) {
      setNotFound(true);
      setLoading(false);
      onEmpty?.();
      return;
    }

    let cancelled = false;

    const fetchNearestPhoto = async () => {
      try {
        const url = `https://api.panoramax.xyz/api/search?limit=1&place_position=${coords.lng},${coords.lat}&place_distance=5-100`;
        const response = await fetch(url);
        const data = await response.json();

        if (cancelled) return;

        if (!data.features || data.features.length === 0) {
          setNotFound(true);
          onEmpty?.();
        } else {
          setPhotoId(data.features[0].id);
        }
      } catch (e) {
        if (cancelled) return;
        setNotFound(true);
        onEmpty?.();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNearestPhoto();

    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  if (notFound) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={32} />
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
  onEmpty: PropTypes.func,
};

PanoramaxBlock.defaultProps = {
  geometry: null,
  onEmpty: null,
};

export default PanoramaxBlock;
