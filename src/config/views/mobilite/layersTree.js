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
        label: 'Code',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code',
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
        label: 'Code',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code',
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
  group: 'Navette Domicile - Travail',
  layers: [{
    label: 'Transport en commun',
    layers: ['terralego-transports'],
    legends: [{
      title: 'Part des actifs se déplaçant en transport en commun (en %)',
      items: [{
        label: 'Supérieur ou égal à 14.1%',
        color: '#BC205D',
      }, {
        label: 'De 9.2 à 14.1%',
        color: '#D4495A',
      }, {
        label: 'De 7.0 à 9.2%',
        color: '#E8705D',
      }, {
        label: 'De 4.5 à 7.0%',
        color: '#F79465',
      }, {
        label: 'De 2.7 à 4.5%',
        color: '#F9AF79',
      }, {
        label: 'De 1.2 à 2.7%',
        color: '#F7C99E',
      }, {
        label: 'Inférieur à 1.2%',
        color: '#EFE3CF',
      }],
    }],
  }],
}];
