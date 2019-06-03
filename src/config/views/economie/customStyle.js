import {
  customStyleCommunal,
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
      type: 'circle',
      source: 'terralego',
      id: 'terralego-emplois',
      paint: {
        'circle-color': '#769198',
        'circle-radius': ['*', ['get', 'emplt_2015'], 0.000010, 30],
      },
      'source-layer': 'emplois_communal',
    },
    customStyleDepartemental,
    customStyleInterCommunal,
    customStyleCommunal,
  ],
};
