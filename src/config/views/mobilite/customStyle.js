import {
  customStyleCommunal,
  customStyleCommuneLabels,
  customStyleDepartemental,
  customStyleInterCommunal,
} from '../../utils/administrativeBorders';

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
          ['<', ['get', 'cdr_2015'], 1.2],
          '#EFE3CF',
          ['<', ['get', 'cdr_2015'], 2.7],
          '#F7C99E',
          ['<', ['get', 'cdr_2015'], 4.5],
          '#F9AF79',
          ['<', ['get', 'cdr_2015'], 7.0],
          '#F79465',
          ['<', ['get', 'cdr_2015'], 9.2],
          '#E8705D',
          ['<', ['get', 'cdr_2015'], 14.1],
          '#D4495A',
          '#BC205D',
        ],
      },
      'source-layer': 'transports_communal',
    },
    customStyleDepartemental,
    customStyleInterCommunal,
    customStyleCommunal,
    ...customStyleCommuneLabels,
  ],
};
