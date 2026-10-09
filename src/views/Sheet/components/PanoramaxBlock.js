import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import bbox from '@turf/bbox';
import { Box, CircularProgress, Typography, Link, Divider } from '@mui/material';
import { ImageSearchOutlined } from '@mui/icons-material';

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
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
          textAlign: 'center',
        }}
      >
        <ImageSearchOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography variant="body1" fontWeight={600}>
          Aucune image Panoramax n'est encore disponible sur cette zone.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vous pouvez contribuer à enrichir la couverture du territoire en partageant vos propres
          photos panoramiques. Chaque contribution améliore les données ouvertes et bénéficie à
          l'ensemble de la communauté.
        </Typography>
        <Divider flexItem />
        <Link
          href="https://panoramax.fr/comment-participer-a-panoramax/guide-collecte-pieton-debutant"
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
        >
          Comment contribuer à Panoramax ?
        </Link>
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
