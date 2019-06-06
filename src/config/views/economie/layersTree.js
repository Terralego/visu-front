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
  group: 'Emploi',
  layers: [{
    label: 'Nombre d\'emplois',
    layers: ['terralego-emplois'],
    initialState: {
      opacity: 0.8,
    },
    legends: [{
      title: 'Nombre d\'emplois',
      items: [{
        label: 'Plus de 180 000',
        color: '#769198',
        shape: 'circle',
        radius: 25,
      }, {
        label: 'De 100 000 à 140 000',
        color: '#769198',
        shape: 'circle',
        radius: 22,
      }, {
        label: 'De 70 000 à 100 000',
        color: '#769198',
        shape: 'circle',
        radius: 20,
      }, {
        label: 'De 30 000 à 70 000 ',
        color: '#769198',
        shape: 'circle',
        radius: 15,
      }, {
        label: 'Moins de 30 000',
        color: '#769198',
        shape: 'circle',
        radius: 10,
      }],
    }],
  }],
}];
