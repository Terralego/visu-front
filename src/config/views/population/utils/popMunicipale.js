import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';
import defaultFields from './defaultFields';
import defaultForm from './defaultForm';

const years = ['2016', '2011', '2006', '1999', '1990', '1982', '1975', '1968'];

const getProperty = year => `pop_${year}`;

export const customStylePopulationMunicipale = years.map(year => ({
  type: 'circle',
  source: 'terralego',
  id: `terralego-population_municipale-communes_${year}`,
  paint: {
    'circle-color': '#769198',
    'circle-radius': ['*', ['get', getProperty(year)], 0.000010, 20],
  },
  'source-layer': 'population_communal',
}));

export const layerTreePopulationMunicipale = ({
  label: 'Population municipale',
  initialState: {
    opacity: 0.8,
  },
  filters: {
    table: {
      title: 'Population municipale par commune',
    },
    layer: 'population_communal',
    form: [...defaultForm, ...years.map(year => ({
      property: getProperty(year),
      label: `Population en ${year}`,
      type: TYPE_RANGE,
      fetchValues: true,
    }))],
    fields: [...defaultFields, ...years.map(fieldsYear => ({
      value: getProperty(fieldsYear),
      label: `Population en ${fieldsYear}`,
      exportable: true,
      format: {
        type: 'number',
      },
    }))],
    exportable: true,
  },
  sublayers: years.map(year => ({
    label: `Année ${year}`,
    layers: [`terralego-population_municipale-communes_${year}`],
    legends: [
      {
        title: `Population en ${year}`,
        items: [
          {
            label: 'Plus de 300 000',
            color: '#769198',
            shape: 'circle',
            radius: 25,
          }, {
            label: 'De 240 000 à 300 000',
            color: '#769198',
            shape: 'circle',
            radius: 22,
          }, {
            label: 'De 180 000 à 240 000',
            color: '#769198',
            shape: 'circle',
            radius: 20,
          }, {
            label: 'De 120 000 à 180 000 ',
            color: '#769198',
            shape: 'circle',
            radius: 15,
          }, {
            label: 'Moins de 120 000',
            color: '#769198',
            shape: 'circle',
            radius: 10,
          }],
      }],
  })),
});

export const interactionPopulationMunicipale = years.map(year => ({
  id: `terralego-population_municipale-communes_${year}`,
  interaction: INTERACTION_DISPLAY_TOOLTIP,
  trigger: 'mouseover',
  template: `
Commune : {{nom}}  
{{(pop_${year} | round(1)).toLocaleString()}} habitants
`,
}));

export default {
  customStylePopulationMunicipale,
  layerTreePopulationMunicipale,
  interactionPopulationMunicipale,
};
