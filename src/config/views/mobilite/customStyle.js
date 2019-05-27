export default {
  sources: [{
    id: 'terralego',
    type: 'vector',
    url: '{{HOST}}/layer/reference/tilejson',
  }],
  layers: [
    {
      type: 'fill',
      source: 'terralego',
      id: 'terralego-transports',
      paint: {
        'fill-color': [
          'case',
          ['<', ['get', 'data'], 1.2],
          '#EFE3CF',
          ['<', ['get', 'data'], 2.7],
          '#F7C99E',
          ['<', ['get', 'data'], 4.5],
          '#F9AF79',
          ['<', ['get', 'data'], 7.0],
          '#F79465',
          ['<', ['get', 'data'], 9.2],
          '#E8705D',
          ['<', ['get', 'data'], 14.1],
          '#D4495A',
          '#BC205D',
        ],
      },
      'source-layer': 'transports',
    },
  ],
};
