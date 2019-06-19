import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';
import defaultFields from './defaultFields';
import defaultForm from './defaultForm';

const years = ['2016', '2011', '2006', '1999', '1990', '1982', '1975', '1968'];

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

const getProperty = year => `d_${year}`;

export const customStyleDensity = years.map(year => {
  const legend = getLegend(year);
  return {
    type: 'fill',
    source: 'terralego',
    id: `terralego-densite_population-communes_${year}`,
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', getProperty(year)], legend[0]],
        '#EFE3CF',
        ['<', ['get', getProperty(year)], legend[1]],
        '#F7C99E',
        ['<', ['get', getProperty(year)], legend[2]],
        '#F9AF79',
        ['<', ['get', getProperty(year)], legend[3]],
        '#F79465',
        ['<', ['get', getProperty(year)], legend[4]],
        '#E8705D',
        ['<', ['get', getProperty(year)], legend[5]],
        '#D4495A',
        '#BC205D',
      ],
    },
    'source-layer': 'denspop_communal',
  };
});

export const layerTreeDensity = ({
  label: 'Densité de la population',
  filters: {
    table: {
      title: 'Dénsité de population par commune',
    },
    layer: 'denspop_communal',
    form: [...defaultForm, ...years.map(year => ({
      property: getProperty(year),
      label: `Densité de la population par ${year} (hab/km²)`,
      type: TYPE_RANGE,
      fetchValues: true,
    }))],
    fields: [...defaultFields, ...years.map(fieldsYear => ({
      value: getProperty(fieldsYear),
      label: `Densité en ${fieldsYear}`,
      exportable: true,
      format: {
        type: 'number',
      },
    }))],
    exportable: true,
  },
  sublayers: years.map(year => {
    const legend = getLegend(year);
    return ({
      label: `Année ${year}`,
      layers: [`terralego-densite_population-communes_${year}`],
      legends: [
        {
          title: `Densité de la population en ${year} (hab/km²)`,
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
            }],
        }],
    });
  }),
});

export const interactionDensite = years.map(year => ({
  id: `terralego-densite_population-communes_${year}`,
  interaction: INTERACTION_DISPLAY_TOOLTIP,
  trigger: 'mouseover',
  template: `
Commune : {{nom}}  
{{d_${year} | round(1)}} hab/km²
`,
}));

export default {
  customStyleDensity,
  layerTreeDensity,
  interactionDensite,
};
