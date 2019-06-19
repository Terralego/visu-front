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


const communeLabelPaint = {
  'text-color': '#000000',
  'text-halo-color': '#fcfcfc',
  'text-halo-width': 1,
};

export const customStyleCommuneLabels = [
  {
    id: 'communal-label-all',
    type: 'symbol',
    source: 'terralego',
    'source-layer': 'population_communal',
    minzoom: 10,
    maxzoom: 24,
    layout: {
      visibility: 'visible',
      'text-field': '{nom}',
      'text-font': [
        'DIN Offc Pro Regular',
        'Arial Unicode MS Regular',
      ],
      'text-size': {
        stops: [
          [
            10,
            6,
          ],
          [
            11,
            16,
          ],
        ],
      },
      'text-max-width': 6,
    },
    paint: communeLabelPaint,
  },
  {
    id: 'communal-label-1k',
    type: 'symbol',
    source: 'terralego',
    'source-layer': 'population_communal',
    minzoom: 9,
    maxzoom: 24,
    filter: [
      'all',
      [
        '>',
        'pop_2016',
        1000,
      ],
    ],
    layout: {
      visibility: 'visible',
      'text-field': '{nom}',
      'text-font': [
        'DIN Offc Pro Regular',
        'Arial Unicode MS Regular',
      ],
      'text-size': {
        stops: [
          [
            9,
            6,
          ],
          [
            10,
            16,
          ],
        ],
      },
      'text-max-width': 6,
    },
    paint: communeLabelPaint,
  },
  {
    id: 'communal-label-10k',
    type: 'symbol',
    source: 'terralego',
    'source-layer': 'population_communal',
    minzoom: 8,
    maxzoom: 24,
    filter: [
      'all',
      [
        '>',
        'pop_2016',
        10000,
      ],
    ],
    layout: {
      visibility: 'visible',
      'text-field': '{nom}',
      'text-font': [
        'DIN Offc Pro Regular',
        'Arial Unicode MS Regular',
      ],
      'text-size': {
        stops: [
          [
            8,
            6,
          ],
          [
            9,
            18,
          ],
        ],
      },
      'text-max-width': 6,
    },
    paint: communeLabelPaint,
  },
  {
    id: 'communal-label-50k',
    type: 'symbol',
    source: 'terralego',
    'source-layer': 'population_communal',
    filter: [
      'all',
      [
        '>',
        'pop_2016',
        50000,
      ],
    ],
    layout: {
      visibility: 'visible',
      'text-field': '{nom}',
      'text-transform': 'uppercase',
      'text-font': [
        'DIN Offc Pro Regular',
        'Arial Unicode MS Regular',
      ],
      'text-size': 20,
      'text-max-width': 6,
    },
    paint: communeLabelPaint,
  },
];

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
            label: 'Code postal',
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
            label: 'Code postal',
          }, {
            value: 'libepci',
            label: 'Intercommune',
          }, {
            value: 'libdep',
            label: 'Département',
          }, {
            value: 'libreg',
            label: 'Région',
          }],
      },
    }],
}];

export default {
  layerTreeAdministrativeBorders,
  customStyleDepartemental,
  customStyleInterCommunal,
  customStyleCommunal,
};
