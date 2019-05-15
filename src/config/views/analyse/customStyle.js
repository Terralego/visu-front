export default {
  sources: [{
    id: 'terralego',
    type: 'vector',
    url: '{{HOST}}/layer/reference/tilejson',
  }],
  layers: [{
    type: 'fill',
    source: 'terralego',
    id: 'terralego-residences_principales',
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', 'data'], 44.8],
        '#EFE3CF',
        ['<', ['get', 'data'], 59.5],
        '#F7C99E',
        ['<', ['get', 'data'], 76.3],
        '#F9AF79',
        ['<', ['get', 'data'], 84.3],
        '#F79465',
        ['<', ['get', 'data'], 89.2],
        '#E8705D',
        ['<', ['get', 'data'], 92.8],
        '#D4495A',
        '#BC205D',

      ],
    },
    'source-layer': 'residences_principales',
  }],
};
