import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';

const yearsAgeClasses = ['2010', '2015'];

const ageClasses = ['c0014', 'c1529', 'c3044', 'c4559', 'c6074', 'c75p'];

function getLegend (ageClass, year) {
  switch (ageClass) {
    case 'c0014':
      switch (year) {
        case '2015':
          return [13.3, 16.6, 19.2, 21.5, 23.9, 26.7];
        case '2010':
          return [13.0, 16.2, 18.9, 21.3, 23.7, 26.6];
        default:
          return [13.3, 16.6, 19.2, 21.5, 23.9, 26.7];
      }
    case 'c1529':
      switch (year) {
        case '2015':
          return [9.9, 12.1, 13.8, 15.5, 17.7, 22.9];
        case '2010':
          return [10.4, 12.7, 14.5, 16.2, 18.2, 21.8];
        default:
          return [9.9, 12.1, 13.8, 15.5, 17.7, 22.9];
      }
    case 'c3044':
      switch (year) {
        case '2015':
          return [12.8, 15.8, 18.0, 20.1, 22.3, 24.8];
        case '2010':
          return [14.3, 17.2, 19.4, 21.4, 23.5, 26.1];
        default:
          return [12.8, 15.8, 18.0, 20.1, 22.3, 24.8];
      }
    case 'c4559':
      switch (year) {
        case '2015':
          return [16.9, 18.8, 20.5, 22.4, 24.9, 29.5];
        case '2010':
          return [16.3, 18.5, 20.2, 22.0, 24.1, 27.0];
        default:
          return [16.9, 18.8, 20.5, 22.4, 24.9, 29.5];
      }
    case 'c6074':
      switch (year) {
        case '2015':
          return [11.3, 14.1, 16.7, 19.8, 23.9, 29.2];
        case '2010':
          return [9.6, 12.2, 14.6, 17.2, 20.7, 25.6];
        default:
          return [11.3, 14.1, 16.7, 19.8, 23.9, 29.2];
      }
    case 'c75p':
      switch (year) {
        case '2015':
          return [5.3, 7.5, 9.6, 12.1, 15.4, 19.9];
        case '2010':
          return [5.2, 7.5, 9.7, 12.0, 14.9, 18.8];
        default:
          return [5.3, 7.5, 9.6, 12.1, 15.4, 19.9];
      }
    default:
      return [0, 0, 0, 0, 0, 0];
  }
}

export const customStyleAgeClasses = ageClasses.reduce((prevAges, ageClass) => [
  ...prevAges, ...yearsAgeClasses.map(year => {
    const legend = getLegend(ageClass, year);
    return {
      type: 'fill',
      source: 'terralego',
      id: `terralego-classe_age-communes_${ageClass}_${year}`,
      paint: {
        'fill-color': [
          'case',
          ['<', ['get', `${ageClass}_${year}`], legend[0]],
          '#EFE3CF',
          ['<', ['get', `${ageClass}_${year}`], legend[1]],
          '#F7C99E',
          ['<', ['get', `${ageClass}_${year}`], legend[2]],
          '#F9AF79',
          ['<', ['get', `${ageClass}_${year}`], legend[3]],
          '#F79465',
          ['<', ['get', `${ageClass}_${year}`], legend[4]],
          '#E8705D',
          ['<', ['get', `${ageClass}_${year}`], legend[5]],
          '#D4495A',
          '#BC205D',
        ],
      },
      'source-layer': 'classe_age_communal',
    };
  }),
], []);

const getFromTo = ageClass => {
  const [, from, to] = ageClass.split(/c([0-9]{2})(.*)$/);
  return { from, to };
};
const getLabel = (ageClass, year) => {
  const { from, to } = getFromTo(ageClass);
  if (Number.isNaN(+to)) {
    return `Part de la population à partir de ${+from} ans en ${year}`;
  }
  return `Part de la population de ${+from} à ${+to} ans en ${year}`;
};
const getProperty = (ageClass, year) => {
  const { from, to } = getFromTo(ageClass);

  return `c${from}${to}_${year}`;
};

export const layerTreeAgeClasses = ageClasses.reduce((prevAges, ageClass) => [
  ...prevAges, ...yearsAgeClasses.map(year => {
    const legend = getLegend(ageClass, year);
    return {
      label: getLabel(ageClass, year),
      layers: [`terralego-classe_age-communes_${ageClass}_${year}`],
      filters: {
        layer: 'classe_age_communal',
        form: [{
          property: getProperty(ageClass, year),
          label: 'Âge',
          type: TYPE_RANGE,
          fetchValues: true,
        }],
        fields: [{
          value: 'nom',
          label: 'Nom',
        }, ...yearsAgeClasses.reduce((prev, fieldsYear) => [
          ...prev,
          ...ageClasses.map(fieldsAgeClass => ({
            value: getProperty(fieldsAgeClass, fieldsYear),
            label: getLabel(fieldsAgeClass, fieldsYear),
            format: {
              type: 'number',
            },
            display: year === fieldsYear && ageClass === fieldsAgeClass,
          })),
        ], [])],
        export: true,
      },
      legends: [
        {
          title: `Part de la population par classes d’âge en ${year} (en %)`,
          items: [
            {
              label: `Supérieur ou égal à ${legend[5]}%`,
              color: '#BC205D',
            }, {
              label: `De ${legend[4]} à ${legend[5]}%`,
              color: '#D4495A',
            }, {
              label: `De ${legend[3]} à ${legend[4]}%`,
              color: '#E8705D',
            }, {
              label: `De ${legend[2]} à ${legend[3]}%`,
              color: '#F79465',
            }, {
              label: `De ${legend[1]} à ${legend[2]}%`,
              color: '#F9AF79',
            }, {
              label: `De ${legend[0]} à ${legend[1]}%`,
              color: '#F7C99E',
            }, {
              label: `Inférieur à ${legend[0]}%`,
              color: '#EFE3CF',
            },
          ],
        },
      ],
    };
  }),
], []);

export const interactionAgeClasses = ageClasses.reduce((prevAges, ageClass) => [
  ...prevAges, ...yearsAgeClasses.map(year => ({
    id: `terralego-classe_age-communes_${ageClass}_${year}`,
    interaction: INTERACTION_DISPLAY_TOOLTIP,
    trigger: 'mouseover',
    template: `
Commune : {{nom}}  
{{${ageClass}_${year} | round(1)}}%
`,
  })),
], []);

export default {
  customStyleAgeClasses,
  layerTreeAgeClasses,
  interactionAgeClasses,
};
