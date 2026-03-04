import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import maplibregl from 'maplibre-gl';
import bbox from '@turf/bbox';
import { Box, Typography } from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapBlock = ({ geometry, color = 'rgb(31, 119, 180)' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !geometry) return;

    const geojson = {
      type: 'Feature',
      properties: {},
      geometry,
    };

    const [minX, minY, maxX, maxY] = bbox(geojson);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: [[minX, minY], [maxX, maxY]],
      fitBoundsOptions: { padding: 50 },
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('feature-geometry', {
        type: 'geojson',
        data: geojson,
      });

      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        map.current.addLayer({
          id: 'feature-fill',
          type: 'fill',
          source: 'feature-geometry',
          paint: {
            'fill-color': color,
            'fill-opacity': 0.3,
          },
        });

        map.current.addLayer({
          id: 'feature-outline',
          type: 'line',
          source: 'feature-geometry',
          paint: {
            'line-color': color,
            'line-width': 2,
          },
        });
      }

      if (geometry.type === 'Point' || geometry.type === 'MultiPoint') {
        map.current.addLayer({
          id: 'feature-points',
          type: 'circle',
          source: 'feature-geometry',
          paint: {
            'circle-radius': 6,
            'circle-color': color,
            'circle-stroke-width': 2,
            'circle-stroke-color': color,
          },
        });
      }

      if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
        map.current.addLayer({
          id: 'feature-line',
          type: 'line',
          source: 'feature-geometry',
          paint: {
            'line-color': color,
            'line-width': 3,
          },
        });
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      map.current?.remove();
    };
  }, [geometry, color]);

  if (!geometry) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Aucune géométrie disponible</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={mapContainer}
      sx={{
        minHeight: 400,
        width: '100%',
        borderRadius: 1,
        '@media print': {
          breakInside: 'avoid',
        },
      }}
    />
  );
};

MapBlock.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  geometry: PropTypes.object,
  color: PropTypes.string,
};

MapBlock.defaultProps = {
  geometry: null,
  color: 'rgb(31, 119, 180)',
};

export default MapBlock;
