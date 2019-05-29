import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';

import {
  ageClasses,
  yearsAgeClasses,
} from './variables';

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

export const layerTreeAgeClasses = ageClasses.reduce((prevAges, ageClass) => [
  ...prevAges, ...yearsAgeClasses.map(year => {
    const legend = getLegend(ageClass, year);
    return {
      label: `De ${ageClass.substring(1, 3)} à ${ageClass.substring(3)} pour ${year}`,
      layers: [`terralego-classe_age-communes_${ageClass}_${year}`],
      filters: {
        layer: 'classe_age_communal',
        form: [{
          property: `c${ageClass.substring(1, 3)}${ageClass.substring(3)}_${year}`,
          label: 'Âge',
          type: TYPE_RANGE,
          fetchValues: true,
        }],
      },
      legends: [
        {
          title: 'Part de la population par classes d’âge (en %)',
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

export default {
  customStyleAgeClasses,
  layerTreeAgeClasses,
};
