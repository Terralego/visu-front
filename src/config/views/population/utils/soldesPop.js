import { TYPE_RANGE } from '@terralego/core/modules/Forms/Filters';
import { INTERACTION_DISPLAY_TOOLTIP } from '@terralego/core/modules/Map/InteractiveMap/InteractiveMap';

const periods = ['2010-2015', '1999-2010', '1990-1999', '1982-1990', '1975-1982', '1968-1975'];

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

const getFromTo = period => {
  const [from, to] = period.split(/-/);
  return { from, to };
};

const getProperty = (period, prefix) => {
  const { from, to } = getFromTo(period);
  return `${prefix}_${from.substr(2, 2)}${to.substr(2, 2)}`;
};

const getLabel = (period, prefix) => {
  if (prefix === 'snat') {
    return `Communes solde naturel en ${period}`;
  }
  return `Communes solde migratoire en ${period}`;
};

const getTitleTable = (period, prefix) => {
  if (prefix === 'snat') {
    return `Solde naturel en ${period} pour la commune`;
  }
  return `Solde migratoire en ${period} pour la commune`;
};

const getField = (period, prefix) => {
  if (prefix === 'snat') {
    return `S.naturel ${period}`;
  }
  return `S.migratoire ${period}`;
};

export const customStyleSoldesNaturel = periods.map(period => {
  const legend = getLegendNat(period);
  return {
    type: 'fill',
    source: 'terralego',
    id: `terralego-soldes_naturels-communes_snat_${period}`,
    paint: {
      'fill-color': [
        'case',
        ['<', ['get', getProperty(period, 'snat')], legend[0]],
        '#156571',
        ['<', ['get', getProperty(period, 'snat')], legend[1]],
        '#2FB0C5',
        ['<', ['get', getProperty(period, 'snat')], legend[2]],
        '#8CCBDA',
        ['<', ['get', getProperty(period, 'snat')], legend[3]],
        '#F7F1E8',
        ['<', ['get', getProperty(period, 'snat')], legend[4]],
        '#F7C99D',
        ['<', ['get', getProperty(period, 'snat')], legend[5]],
        '#F48161',
        '#BC205D'],
    },
    'source-layer': 'soldes_communal',
  };
});

export const layerTreeSoldesNaturel = periods.map(period => {
  const legend = getLegendNat(period);
  return {
    label: getLabel(period, 'snat'),
    layers: [`terralego-soldes_naturels-communes_snat_${period}`],
    filters: {
      table: {
        title: `${getTitleTable(period)}`,
      },
      layer: 'soldes_communal',
      form: [{
        property: getProperty(period, 'snat'),
        label: 'Solde naturel (en unité)',
        type: TYPE_RANGE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
        exportable: true,
      }, ...periods.map(fieldsPeriod => ({
        value: getProperty(fieldsPeriod, 'snat'),
        label: getField(fieldsPeriod, 'snat'),
        exportable: true,
        format: {
          type: 'number',
        },
        display: period === fieldsPeriod,
      }))],
      exportable: true,
    },
    legends: [{
      title: `Solde naturel entre ${period} (en unité)`,
      items: [{
        label: `Supérieur ou égal à ${legend[5].toLocaleString()}`,
        color: '#BC205D',
      }, {
        label: `De ${legend[4].toLocaleString()} à ${legend[5].toLocaleString()}`,
        color: '#F48161',
      }, {
        label: `De ${legend[3].toLocaleString()} à ${legend[4].toLocaleString()}`,
        color: '#F7C99D',
      }, {
        label: `De ${legend[2].toLocaleString()} à ${legend[3].toLocaleString()}`,
        color: '#F7F1E8',
      }, {
        label: `De ${legend[1].toLocaleString()} à ${legend[2].toLocaleString()}`,
        color: '#8CCBDA',
      }, {
        label: `De ${legend[0].toLocaleString()} à ${legend[1].toLocaleString()}`,
        color: '#2FB0C5',
      }, {
        label: `Inférieur à ${legend[0].toLocaleString()}`,
        color: '#156571',
      }],
    }],
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
        ['<', ['get', getProperty(period, 'smig')], legend[0]],
        '#156571',
        ['<', ['get', getProperty(period, 'smig')], legend[1]],
        '#2FB0C5',
        ['<', ['get', getProperty(period, 'smig')], legend[2]],
        '#8CCBDA',
        ['<', ['get', getProperty(period, 'smig')], legend[3]],
        '#F7F1E8',
        ['<', ['get', getProperty(period, 'smig')], legend[4]],
        '#F7C99D',
        ['<', ['get', getProperty(period, 'smig')], legend[5]],
        '#F48161',
        '#BC205D',
      ],
    },
    'source-layer': 'soldes_communal',
  };
});

export const layerTreeSoldesMigratoire = periods.map(period => {
  const legend = getLegendNMig(period);
  return {
    label: getLabel(period, 'smig'),
    layers: [`terralego-soldes_naturels-communes_smig_${period}`],
    filters: {
      table: {
        title: `${getTitleTable(period)}`,
      },
      layer: 'soldes_communal',
      form: [{
        property: getProperty(period, 'smig'),
        label: 'Solde migratoire (en unité)',
        type: TYPE_RANGE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
        exportable: true,
      }, ...periods.map(fieldsPeriod => ({
        value: getProperty(fieldsPeriod, 'smig'),
        label: getField(fieldsPeriod, 'smig'),
        exportable: true,
        format: {
          type: 'number',
        },
        display: period === fieldsPeriod,
      }))],
      exportable: true,
    },
    legends: [{
      title: `Solde migratoire entre ${period} (en unité)`,
      items: [{
        label: `Supérieur ou égal à ${legend[5].toLocaleString()}`,
        color: '#BC205D',
      }, {
        label: `De ${legend[4].toLocaleString()} à ${legend[5].toLocaleString()}`,
        color: '#F48161',
      }, {
        label: `De ${legend[3].toLocaleString()} à ${legend[4].toLocaleString()}`,
        color: '#F7C99D',
      }, {
        label: `De ${legend[2].toLocaleString()} à ${legend[3].toLocaleString()}`,
        color: '#F7F1E8',
      }, {
        label: `De ${legend[1].toLocaleString()} à ${legend[2].toLocaleString()}`,
        color: '#8CCBDA',
      }, {
        label: `De ${legend[0].toLocaleString()} à ${legend[1].toLocaleString()}`,
        color: '#2FB0C5',
      }, {
        label: `Inférieur à ${legend[0].toLocaleString()}`,
        color: '#156571',
      }],
    }],
  };
});

export const interactionSoldesNaturel = periods.map(period => ({
  id: `terralego-soldes_naturels-communes_snat_${period}`,
  interaction: INTERACTION_DISPLAY_TOOLTIP,
  trigger: 'mouseover',
  template: `
Commune : {{nom}}  
{{(snat_${period.substring(2, 4)}${period.substring(7)} | round(1)).toLocaleString()}}
`,
}));

export const interactionSoldesMigratoire = periods.map(period => ({
  id: `terralego-soldes_naturels-communes_smig_${period}`,
  interaction: INTERACTION_DISPLAY_TOOLTIP,
  trigger: 'mouseover',
  template: `
Commune : {{nom}}  
{{(smig_${period.substring(2, 4)}${period.substring(7)} | round(1)).toLocaleString()}}
`,
}));

export default {
  customStyleSoldesNaturel,
  layerTreeSoldesNaturel,
  interactionSoldesNaturel,
  customStyleSoldesMigratoire,
  layerTreeSoldesMigratoire,
  interactionSoldesMigratoire,
};
