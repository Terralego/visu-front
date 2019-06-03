import { TYPE_SINGLE } from '@terralego/core/modules/Forms/Filters/Filters';

export default [{
  group: 'Limites administratives',
  layers: [{
    label: 'Départements',
    initialState: {
      active: false,
    },
    layers: ['terralego-departemental'],
    filters: {
      layer: 'evpop_departemental',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
  }, {
    label: 'Intercommunalités',
    initialState: {
      active: false,
    },
    layers: ['terralego-intercommunal'],
    filters: {
      layer: 'evpop_intercommunal',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
  }, {
    label: 'Communes',
    initialState: {
      active: false,
    },
    layers: ['terralego-communal'],
    filters: {
      layer: 'evpop_communal',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
  }],
}, {
  group: 'Logements',
  layers: [{
    label: 'Résidences principales',
    layers: ['terralego-residences_principales'],
    legends: [{
      title: 'Part des résidences principales (en %)',
      items: [{
        label: 'Supérieur ou égal à 92.8%',
        color: '#BC205D',
      }, {
        label: 'De 89.2 à 92.8%',
        color: '#D4495A',
      }, {
        label: 'De 84.3 à 89.2%',
        color: '#E8705D',
      }, {
        label: 'De 76.3 à 84.3%',
        color: '#F79465',
      }, {
        label: 'De 59.5 à 76.3%',
        color: '#F9AF79',
      }, {
        label: 'De 44.8 à 59.5%',
        color: '#F7C99E',
      }, {
        label: 'Inférieur à 44.8%',
        color: '#EFE3CF',
      }],
    }],
  }],
}];
