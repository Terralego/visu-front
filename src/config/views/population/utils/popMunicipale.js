import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';

const years = ['1968', '1975', '1982', '1990', '1999', '2006', '2011', '2016'];

export const customStylePopulationMunicipale = years.map(year => ({
  type: 'circle',
  source: 'terralego',
  id: `terralego-population_municipale-communes_${year}`,
  paint: {
    'circle-color': '#769198',
    'circle-radius': ['*', ['get', `pop_${year}`], 0.000010, 20],
  },
  'source-layer': 'population_communal',
}));

export const layerTreePopulationMunicipale = years.map(year => ({
  label: `Communes en ${year}`,
  layers: [`terralego-population_municipale-communes_${year}`],
  initialState: {
    opacity: 0.8,
  },
  filters: {
    layer: 'population_communal',
    form: [{
      property: `pop_${year}`,
      label: 'Population',
      type: TYPE_RANGE,
      fetchValues: true,
    }],
    fields: [{
      value: 'nom',
      label: 'Nom',
    }, {
      value: 'pop_1968',
      label: 'Population en 1968',
      format: {
        type: 'number',
      },
      display: year === '1968',
    }, {
      value: 'pop_1975',
      label: 'Population en 1975',
      format: {
        type: 'number',
      },
      display: year === '1975',
    }, {
      value: 'pop_1982',
      label: 'Population en 1982',
      format: {
        type: 'number',
      },
      display: year === '1982',
    }, {
      value: 'pop_1990',
      label: 'Population en 1990',
      format: {
        type: 'number',
      },
      display: year === '1990',
    }, {
      value: 'pop_1999',
      label: 'Population en 1999',
      format: {
        type: 'number',
      },
      display: year === '1999',
    }, {
      value: 'pop_2006',
      label: 'Population en 2006',
      format: {
        type: 'number',
      },
      display: year === '2006',
    }, {
      value: 'pop_2011',
      label: 'Population en 2011',
      format: {
        type: 'number',
      },
      display: year === '2011',
    }, {
      value: 'pop_2016',
      label: 'Population en 2016',
      format: {
        type: 'number',
      },
      display: year === '2016',
    }],
    export: true,
  },
  legends: [
    {
      title: `Répartition de la population en ${year}`,
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
        },
      ],
    },
  ],
}));

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
