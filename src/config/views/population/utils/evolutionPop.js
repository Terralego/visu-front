import { periodsEvolution } from './variables';

export const customStyleEvolution = periodsEvolution.map(period => ({
  type: 'fill',
  source: 'terralego',
  id: `terralego-evolution_population-communes_${period}`,
  paint: {
    'fill-color': [
      'case',
      ['<', ['get', `evpop_${period.substring(2, 4)}${period.substring(7)}`], -2.0],
      '#156571',
      ['<', ['get', `evpop_${period.substring(2, 4)}${period.substring(7)}`], -1.0],
      '#2FB0C5',
      ['<', ['get', `evpop_${period.substring(2, 4)}${period.substring(7)}`], 0.0],
      '#8CCBDA',
      ['<', ['get', `evpop_${period.substring(2, 4)}${period.substring(7)}`], 1.0],
      '#EFE3CF',
      ['<', ['get', `evpop_${period.substring(2, 4)}${period.substring(7)}`], 2.0],
      '#F48161',
      '#BC205D',
    ],
  },
  'source-layer': 'evpop_communal',
}));

export const layerTreeEvolution = periodsEvolution.map(period => ({
  label: `Communes en ${period}`,
  layers: [`terralego-evolution_population-communes_${period}`],
  legends: [
    {
      title: 'Évolution de la population (en %)',
      items: [
        {
          label: 'Supérieur ou égal à 2.0',
          color: '#BC205D',
        }, {
          label: 'De 1.0 à 2.0',
          color: '#F48161',
        }, {
          label: 'De 0.0 à 1.0',
          color: '#EFE3CF',
        }, {
          label: 'De -1.0 à 0.0',
          color: '#8CCBDA',
        }, {
          label: 'De -2.0 à -1.0',
          color: '#2FB0C5',
        }, {
          label: 'Inférieur à -2.0',
          color: '#156571',
        },
      ],
    },
  ],
}));

export default {
  customStyleEvolution,
  layerTreeEvolution,
};
