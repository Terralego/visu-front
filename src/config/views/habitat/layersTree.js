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
      layer: 'departements',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code postal',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }],
    },
  }, {
    label: 'Intercommunalités',
    initialState: {
      active: false,
    },
    layers: ['terralego-intercommunal'],
    filters: {
      layer: 'intercommunalites',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code postal',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }],
    },
  }, {
    label: 'Communes',
    initialState: {
      active: false,
    },
    layers: ['terralego-communal'],
    filters: {
      layer: 'communes',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code postal',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libepci',
        label: 'Intercommune',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codepci',
        label: 'Code Intercommune',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libdep',
        label: 'Département',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codep',
        label: 'Code Département',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libreg',
        label: 'Région',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codreg',
        label: 'Code Région',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }, {
        value: 'libepci',
        label: 'Intercommune',
      }, {
        value: 'codepci',
        label: 'Code Intercommune',
      }, {
        value: 'libdep',
        label: 'Département',
      }, {
        value: 'codep',
        label: 'Code Département',
      }, {
        value: 'libreg',
        label: 'Région',
      }, {
        value: 'codreg',
        label: 'Code Région',
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
