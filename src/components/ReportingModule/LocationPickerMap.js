import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropTypes from 'prop-types';
import React from 'react';
import { Map, Marker, Source, Layer } from 'react-map-gl/maplibre';

const LocationPickerMap = ({
  viewState,
  onMove,
  onClick,
  value,
  featureGeometry,
  style,
  readOnly = false,
}) => (
  <Map
    {...viewState}
    onMove={onMove}
    onClick={onClick}
    mapLib={maplibregl}
    mapStyle="https://tiles.openfreemap.org/styles/liberty"
    cursor={readOnly ? 'default' : 'crosshair'}
    style={style}
  >
    {featureGeometry && (
      <Source id="feature-geometry" type="geojson" data={featureGeometry}>
        {featureGeometry.type === 'Point' ? (
          <Layer
            id="feature-point"
            type="circle"
            source="feature-geometry"
            paint={{
              'circle-color': 'rgba(59, 130, 246, 0.8)',
              'circle-radius': 8,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            }}
          />
        ) : (
          <>
            <Layer
              id="feature-fill"
              type="fill"
              source="feature-geometry"
              paint={{
                'fill-color': 'rgba(59, 130, 246, 0.2)',
                'fill-outline-color': 'rgba(59, 130, 246, 0.8)',
              }}
            />
            <Layer
              id="feature-stroke"
              type="line"
              source="feature-geometry"
              paint={{
                'line-color': 'rgba(59, 130, 246, 0.8)',
                'line-width': 2,
              }}
            />
          </>
        )}
      </Source>
    )}
    {value && <Marker longitude={value.lng} latitude={value.lat} />}
  </Map>
);

LocationPickerMap.propTypes = {
  viewState: PropTypes.shape({
    longitude: PropTypes.number.isRequired,
    latitude: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
  }).isRequired,
  onMove: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  value: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  featureGeometry: PropTypes.shape({
    type: PropTypes.string,
    coordinates: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.array, PropTypes.number])),
  }),
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  readOnly: PropTypes.bool,
};

LocationPickerMap.defaultProps = {
  value: null,
  featureGeometry: null,
  style: undefined,
  readOnly: false,
};

export default LocationPickerMap;
