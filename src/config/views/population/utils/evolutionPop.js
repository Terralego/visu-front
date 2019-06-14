import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';

const periodsEvolution = ['2011-2016', '2006-2011', '1999-2006', '1990-1999', '1982-1990', '1975-1982', '1968-1975'];

const getFromTo = period => {
  const [from, to] = period.split(/-/);
  return { from, to };
};

const getProperty = period => {
  const { from, to } = getFromTo(period);
  return `evpop_${from.substr(2, 2)}${to.substr(2, 2)}`;
};

export const customStyleEvolution = periodsEvolution.map(period => ({
  type: 'fill',
  source: 'terralego',
  id: `terralego-evolution_population-communes_${period}`,
  paint: {
    'fill-color': [
      'case',
      ['<', ['get', getProperty(period)], -2.0],
      '#156571',
      ['<', ['get', getProperty(period)], -1.0],
      '#2FB0C5',
      ['<', ['get', getProperty(period)], 0.0],
      '#8CCBDA',
      ['<', ['get', getProperty(period)], 1.0],
      '#EFE3CF',
      ['<', ['get', getProperty(period)], 2.0],
      '#F48161',
      '#BC205D',
    ],
  },
  'source-layer': 'evpop_communal',
}));

export const layerTreeEvolution = ({
  label: 'Évolution de la population',
  filters: {
    table: {
      title: 'Évolution annuelle de la population par commune',
    },
    layer: 'evpop_communal',
    form: [...periodsEvolution.map(period => ({
      property: getProperty(period),
      label: `Évolution de la population entre ${period} (en %)`,
      type: TYPE_RANGE,
      fetchValues: true,
    }))],
    fields: [{
      value: 'nom',
      label: 'Nom',
      exportable: true,
    }, ...periodsEvolution.map(fieldsPeriod => ({
      value: getProperty(fieldsPeriod),
      label: `Évolution en ${fieldsPeriod}`,
      exportable: true,
      format: {
        type: 'number',
      },
    }))],
    exportable: true,
  },
  sublayers: periodsEvolution.map(period => ({
    label: `De ${period}`,
    layers: [`terralego-evolution_population-communes_${period}`],
    legends: [
      {
        title: `Évolution de la population entre ${period} (en %)`,
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
  })),
});

export const interactionEvolution = periodsEvolution.map(period => ({
  id: `terralego-evolution_population-communes_${period}`,
  interaction: INTERACTION_DISPLAY_TOOLTIP,
  trigger: 'mouseover',
  template: `
Commune : {{nom}}  
{{evpop_${period.substring(2, 4)}${period.substring(7)} | round(1)}}%
`,
}));

export default {
  customStyleEvolution,
  layerTreeEvolution,
  interactionEvolution,
};
