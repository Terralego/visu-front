export const LayerGareTime15 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-gareTime15',
  filter: ['==', ['get', 'time'], 900],
  paint: {
    'fill-color': '#ff0000',
    'fill-outline-color': '#ca4128',
    'fill-antialias': false,
  },
  'source-layer': 'gare_isochrone',
};

export const LayerGareTime30 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-gareTime30',
  filter: ['==', ['get', 'time'], 1800],
  paint: {
    'fill-color': '#fa5500',
    'fill-outline-color': '#ca4128',
    'fill-antialias': false,
  },
  'source-layer': 'gare_isochrone',
};

export const LayerGareTime45 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-gareTime45',
  filter: ['==', ['get', 'time'], 2700],
  paint: {
    'fill-color': '#f4aa00',
    'fill-outline-color': '#ca4128',
    'fill-antialias': false,
  },
  'source-layer': 'gare_isochrone',
};

export default LayerGareTime15;
