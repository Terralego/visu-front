export const township = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-communes',
  paint: {
    'line-color': '#aab1b7',
    'line-width': 2,
  },
  'source-layer': 'communes',
};

export const townshipInteraction = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-communes-interaction',
  paint: {
    'fill-color': 'rgba(255,255,255, 0)',
  },
  'source-layer': 'communes',
};

export default township;
