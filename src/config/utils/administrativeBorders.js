export const customStyleDepartemental = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-departemental',
  paint: {
    'line-color': '#007798',
    'line-width': 3,
  },
  'source-layer': 'departements',
};

export const customStyleInterCommunal = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-intercommunal',
  paint: {
    'line-color': '#007798',
    'line-width': 1,
  },
  'source-layer': 'intercommunalites',
};

export const customStyleCommunal = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-communal',
  paint: {
    'line-color': '#007798',
    'line-width': 1,
    'line-dasharray': [2, 5],
  },
  'source-layer': 'communes',
};

export default {
  customStyleDepartemental,
  customStyleInterCommunal,
  customStyleCommunal,
};
