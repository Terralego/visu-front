import { TYPE_SINGLE } from '@terralego/core/modules/Forms/Filters/Filters';

export const customStyleDepartemental = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-departemental',
  paint: {
    'line-color': '#30404d',
    'line-width': 3,
  },
  'source-layer': 'departements',
};

export const customStyleInterCommunal = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-intercommunal',
  paint: {
    'line-color': '#30404d',
    'line-width': 2,
  },
  'source-layer': 'intercommunalites',
};

export const customStyleCommunal = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-communal',
  paint: {
    'line-color': '#30404d',
    'line-width': 1,
  },
  'source-layer': 'communes',
};

export const layerTreeAdministrativeBorders = [{
  group: 'Limites administratives',
  initialState: {
    open: false,
  },
  layers: [
    {
      label: 'Départements',
      initialState: {
        active: false,
      },
      layers: ['terralego-departemental'],
      filters: {
        layer: 'departements',
        form: [
          {
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
        fields: [
          {
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
        form: [
          {
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
        fields: [
          {
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
        form: [
          {
            property: 'nom',
            label: 'Nom',
            type: TYPE_SINGLE,
            fetchValues: true,
          }, {
            property: 'codegeo',
            label: 'Code INSEE',
            type: TYPE_SINGLE,
            fetchValues: true,
          }, {
            property: 'libepci',
            label: 'Intercommune',
            type: TYPE_SINGLE,
            fetchValues: true,
          }, {
            property: 'libdep',
            label: 'Département',
            type: TYPE_SINGLE,
            fetchValues: true,
          }, {
            property: 'libreg',
            label: 'Région',
            type: TYPE_SINGLE,
            fetchValues: true,
          }],
        fields: [
          {
            value: 'nom',
            label: 'Nom',
          }, {
            value: 'codegeo',
            label: 'Code INSEE',
          }, {
            value: 'libepci',
            label: 'Intercommune',
          }, {
            value: 'libdep',
            label: 'Département',
          }, {
            value: 'codep',
            label: 'Code dpt.',
          }, {
            value: 'libreg',
            label: 'Région',
          },
        ],
      },
    }],
}];

export default {
  layerTreeAdministrativeBorders,
  customStyleDepartemental,
  customStyleInterCommunal,
  customStyleCommunal,
};
