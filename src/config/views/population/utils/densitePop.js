import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';

import { years } from './variables';

function getLegend (year) {
  switch (year) {
    case '2016':
      return [27.0, 40.6, 54.6, 75.7, 110.4, 189.7];
    case '2011':
      return [26.8, 39.6, 53.0, 72.7, 105.5, 184.8];
    case '2006':
      return [27.0, 40.6, 54.6, 75.7, 110.4, 189.7];
    case '1999':
      return [24.0, 34.0, 44.3, 58.5, 85.2, 156.2];
    case '1990':
      return [24.0, 33.4, 42.8, 56.5, 80.4, 145.3];
    case '1982':
      return [24.6, 33.0, 41.4, 53.4, 74.8, 130.7];
    case '1975':
      return [26.0, 32.8, 40.0, 48.8, 66.10, 113.3];
    case '1968':
      return [28.8, 34.8, 41.5, 48.7, 61.3, 97.7];
    default:
      return [27.0, 40.6, 54.6, 75.7, 110.4, 189.7];
  }
}

export const customStyleDensity = years.map(year => {
  const legend = getLegend(year);
  return {
    type: 'fill',
    source: 'terralego',
    id: `terralego-densite_population-communes_${year}`,
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', `d_${year}`], legend[0]],
        '#EFE3CF',
        ['<', ['get', `d_${year}`], legend[1]],
        '#F7C99E',
        ['<', ['get', `d_${year}`], legend[2]],
        '#F9AF79',
        ['<', ['get', `d_${year}`], legend[3]],
        '#F79465',
        ['<', ['get', `d_${year}`], legend[4]],
        '#E8705D',
        ['<', ['get', `d_${year}`], legend[5]],
        '#D4495A',
        '#BC205D',
      ],
    },
    'source-layer': 'denspop_communal',
  };
});

export const layerTreeDensity = years.map(year => {
  const legend = getLegend(year);
  return {
    label: `Communes en ${year}`,
    layers: [`terralego-densite_population-communes_${year}`],
    filters: {
      layer: 'denspop_communal',
      form: [{
        property: `d_${year}`,
        label: 'Densité de la population (hab/km²)',
        type: TYPE_RANGE,
        fetchValues: true,
      }],
    },
    legends: [
      {
        title: 'Densité de la population (hab/km²)',
        items: [
          {
            label: `Supérieur ou égal à ${legend[5]}`,
            color: '#BC205D',
          }, {
            label: `De ${legend[4]} à ${legend[5]}`,
            color: '#D4495A',
          }, {
            label: `De ${legend[3]} à ${legend[4]}`,
            color: '#E8705D',
          }, {
            label: `De ${legend[2]} à ${legend[3]}`,
            color: '#F79465',
          }, {
            label: `De ${legend[1]} à ${legend[2]}`,
            color: '#F9AF79',
          }, {
            label: `De ${legend[0]} à ${legend[1]}`,
            color: '#F7C99E',
          }, {
            label: `Inférieur à ${legend[0]}`,
            color: '#EFE3CF',
          },
        ],
      },
    ],
  };
});

export default {
  customStyleDensity,
  layerTreeDensity,
};
