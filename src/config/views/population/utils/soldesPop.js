import { periods } from './variables';

function getLegendNat (period) {
  switch (period) {
    case '2010-2015':
      return [-5.8, 0.2, 2.6, 5.5, 9.8, 18.7];
    case '1999-2010':
      return [-418.0, 66.0, 319.0, 649.0, 1164.4, 2134.0];
    case '1990-1999':
      return [-4.9, -1.1, 0.4, 1.8, 4.3, 10.8];
    case '1982-1990':
      return [-5.0, -1.4, 0.3, 1.8, 5.0, 12.6];
    case '1975-1982':
      return [-5.1, -1.7, -0.1, 1.4, 4.3, 12.1];
    case '1968-1975':
      return [-2.7, -0.4, 1.0, 2.6, 5.4, 12.1];
    default:
      return [-5.8, 0.2, 2.6, 5.5, 9.8, 18.7];
  }
}

function getLegendNMig (period) {
  switch (period) {
    case '2010-2015':
      return [-7.2, -2.8, 0.6, 4.9, 13.2, 29.2];
    case '1999-2010':
      return [-77.0, 276.6, 755.9, 1422.1, 2596.0, 4750.4];
    case '1990-1999':
      return [-5.2, -1.7, 0.3, 3.0, 7.0, 17.1];
    case '1982-1990':
      return [-6.0, -2.3, 0.3, 3.3, 8.4, 20.3];
    case '1975-1982':
      return [-7.3, -2.9, 0.7, 6.1, 15.7, 37.9];
    case '1968-1975':
      return [-15.3, -9.7, -6.1, -2.7, 2.8, 21.5];
    default:
      return [-7.2, -2.8, 0.6, 4.9, 13.2, 29.2];
  }
}


export const customStyleSoldesNaturel = periods.map(period => {
  const legend = getLegendNat(period);
  return {
    type: 'fill',
    source: 'terralego',
    id: `terralego-soldes_naturels-communes_snat_${period}`,
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[0]],
        '#156571',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[1]],
        '#2FB0C5',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[2]],
        '#8CCBDA',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[3]],
        '#F7F1E8',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[4]],
        '#F7C99D',
        ['<', ['get', `snat_${period.substring(2, 4)}${period.substring(7)}`], legend[5]],
        '#F48161',
        '#BC205D',
      ],
    },
    'source-layer': 'soldes_naturels',
  };
});

export const layerTreeSoldesNaturel = periods.map(period => {
  const legend = getLegendNat(period);
  return {
    label: `Communes solde naturel en ${period}`,
    layers: [`terralego-soldes_naturels-communes_snat_${period}`],
    legends: [
      {
        title: 'Solde naturel (en unité)',
        items: [
          {
            label: `Supérieur ou égal à ${legend[5]}`,
            color: '#BC205D',
          }, {
            label: `De ${legend[4]} à ${legend[5]}`,
            color: '#F48161',
          }, {
            label: `De ${legend[3]} à ${legend[4]}`,
            color: '#F7C99D',
          }, {
            label: `De ${legend[2]} à ${legend[3]}`,
            color: '#F7F1E8',
          }, {
            label: `De ${legend[1]} à ${legend[2]}`,
            color: '#8CCBDA',
          }, {
            label: `De ${legend[0]} à ${legend[1]}`,
            color: '#2FB0C5',
          }, {
            label: `Inférieur à ${legend[0]}`,
            color: '#156571',
          },
        ],
      },
    ],
  };
});

export const customStyleSoldesMigratoire = periods.map(period => {
  const legend = getLegendNMig(period);
  return {
    type: 'fill',
    source: 'terralego',
    id: `terralego-soldes_naturels-communes_smig_${period}`,
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[0]],
        '#156571',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[1]],
        '#2FB0C5',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[2]],
        '#8CCBDA',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[3]],
        '#F7F1E8',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[4]],
        '#F7C99D',
        ['<', ['get', `smig_${period.substring(2, 4)}${period.substring(7)}`], legend[5]],
        '#F48161',
        '#BC205D',
      ],
    },
    'source-layer': 'soldes_naturels',
  };
});

export const layerTreeSoldesMigratoire = periods.map(period => {
  const legend = getLegendNMig(period);
  return {
    label: `Communes solde migratoire en ${period}`,
    layers: [`terralego-soldes_naturels-communes_smig_${period}`],
    legends: [
      {
        title: 'Solde migratoire (en unité)',
        items: [
          {
            label: `Supérieur ou égal à ${legend[5]}`,
            color: '#BC205D',
          }, {
            label: `De ${legend[4]} à ${legend[5]}`,
            color: '#F48161',
          }, {
            label: `De ${legend[3]} à ${legend[4]}`,
            color: '#F7C99D',
          }, {
            label: `De ${legend[2]} à ${legend[3]}`,
            color: '#F7F1E8',
          }, {
            label: `De ${legend[1]} à ${legend[2]}`,
            color: '#8CCBDA',
          }, {
            label: `De ${legend[0]} à ${legend[1]}`,
            color: '#2FB0C5',
          }, {
            label: `Inférieur à ${legend[0]}`,
            color: '#156571',
          },
        ],
      },
    ],
  };
});

export default {
  customStyleSoldesNaturel,
  layerTreeSoldesNaturel,
  customStyleSoldesMigratoire,
  layerTreeSoldesMigratoire,
};
