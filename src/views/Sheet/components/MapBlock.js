import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import maplibregl from 'maplibre-gl';
import bbox from '@turf/bbox';
import { Box, Typography } from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CHART_COLORS } from '../../../mui-theme';

const MapBlock = ({
  firstGeometries,
  secondGeometries,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const color = CHART_COLORS[0];

  useEffect(() => {
    if (!mapContainer.current) return;
    if (firstGeometries.length === 0 && secondGeometries.length === 0) return;

    const allGeometries = [
      ...firstGeometries.filter(Boolean),
      ...secondGeometries.filter(Boolean),
    ];

    if (allGeometries.length === 0) return;

    const featureCollection = {
      type: 'FeatureCollection',
      features: allGeometries.map(geom => ({
        type: 'Feature',
        properties: {},
        geometry: geom,
      })),
    };

    const [minX, minY, maxX, maxY] = bbox(featureCollection);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: [[minX, minY], [maxX, maxY]],
      fitBoundsOptions: { padding: 50 },
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('geometries', { type: 'geojson', data: featureCollection });

      // Polygons fill
      map.current.addLayer({
        id: 'geometries-fill',
        type: 'fill',
        source: 'geometries',
        filter: ['any',
          ['==', ['geometry-type'], 'Polygon'],
          ['==', ['geometry-type'], 'MultiPolygon'],
        ],
        paint: { 'fill-color': color, 'fill-opacity': 0.3 },
      });

      // Polygons outline
      map.current.addLayer({
        id: 'geometries-outline',
        type: 'line',
        source: 'geometries',
        filter: ['any',
          ['==', ['geometry-type'], 'Polygon'],
          ['==', ['geometry-type'], 'MultiPolygon'],
        ],
        paint: { 'line-color': color, 'line-width': 2 },
      });

      // Points
      map.current.addLayer({
        id: 'geometries-points',
        type: 'circle',
        source: 'geometries',
        filter: ['any',
          ['==', ['geometry-type'], 'Point'],
          ['==', ['geometry-type'], 'MultiPoint'],
        ],
        paint: {
          'circle-radius': 4,
          'circle-color': color,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
        },
      });

      // Lines
      map.current.addLayer({
        id: 'geometries-line',
        type: 'line',
        source: 'geometries',
        filter: ['any',
          ['==', ['geometry-type'], 'LineString'],
          ['==', ['geometry-type'], 'MultiLineString'],
        ],
        paint: { 'line-color': color, 'line-width': 3 },
      });
    });

    // eslint-disable-next-line consistent-return
    return () => {
      map.current?.remove();
    };
  }, [firstGeometries, secondGeometries, color]);

  const hasGeometries = firstGeometries.length > 0 || secondGeometries.length > 0;

  if (!hasGeometries) {
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
  firstGeometries: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  secondGeometries: PropTypes.array,
};

MapBlock.defaultProps = {
  firstGeometries: [],
  secondGeometries: [],
};

export default MapBlock;
