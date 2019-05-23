export default {
  sources: [{
    id: 'terralego',
    type: 'vector',
    url: '{{HOST}}/layer/reference/tilejson',
  }],
  layers: [
    {
      type: 'circle',
      source: 'terralego',
      id: 'terralego-emplois',
      paint: {
        'circle-color': '#769198',
        'circle-radius': ['*', ['get', 'data'], 0.000010, 20],
      },
      'source-layer': 'emplois',
    },
  ],
};
