import React from 'react';
import ReactDOM from 'react-dom';

import { TYPE_SINGLE } from '@terralego/core/modules/Forms/Filters/Filters';

import Loading from '../../components/Loading';

const el = document.createElement('div');
ReactDOM.render(<Loading className="details__loading" />, el);
const loading = el.innerHTML;

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

export const customStyleCommunalTransparent = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-communal-interaction',
  paint: {
    'fill-color': 'transparent',
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
          }, {
            value: 'libreg',
            label: 'Région',
          },
        ],
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
            value: 'libdept',
            label: 'Département',
          }, {
            value: 'codept',
            label: 'Code dpt.',
          }, {
            value: 'libreg',
            label: 'Région',
          },
        ],
      },
    }, {
      label: 'Communes',
      initialState: {
        active: false,
      },
      layers: ['terralego-communal', 'terralego-communal-interaction'],
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

const TEMPLATE_DETAILS_EVOLUTION = `
<div class="details">
  <h2 class="details__title">{{nom}}</h2>
  <span class="details__info-administrative">{{libepci}}</span>
  <span class="details__info-administrative">{{libreg}}</span>
  {% if loading %}
    ${loading}
  {% else %}
  <section class="details__group">
    <h3 class="details__subtitle">Population</h3>
    <ul class="details__list">
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Nombre d’habitants en x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Évolution annuelle de la population entre x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Taille moyenne des ménages en x
        </span>
        <span class="details__column-value">
        x personnes
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Part des moins de 20 ans en x
        </span>
        <span class="details__column-value">
        x%
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Part des plus de 60 ans en x
        </span>
        <span class="details__column-value">
        x%
        </span>
      </li>
    </ul>
  </section>
  <section class="details__group">
    <h3 class="details__subtitle">Habitat</h3>
    <ul class="details__list">
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Nombre de logements en x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Part des propriétaires occupants en x
        </span>
        <span class="details__column-value">
          x%
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Part les locataires (privés et sociaux) en x
        </span>
        <span class="details__column-value">
          x%
        </span>
      </li>
    </ul>
  </section>
  <section class="details__group">
    <h3 class="details__subtitle">Éconmie</h3>
    <ul class="details__list">
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Nombre d’emplois en x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Évolution annuelle du nombre d’emplois entre x
        </span>
        <span class="details__column-value">
          x%
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Nombre d’actifs en x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Nombre d’établissements économiques en x
        </span>
        <span class="details__column-value">
          x
        </span>
      </li>
    </ul>
  </section>
  {% endif %}
</div>
`;

export const interactionCommunalTransparent = {
  id: 'terralego-communal-interaction',
  interaction: 'displayDetails',
  template: TEMPLATE_DETAILS_EVOLUTION,
  fetchProperties: {
    url: '{{HOST}}/layer/communes/feature/{{id}}/',
    id: '_id',
  },
  highlight: {
    color: '#0B2B2F',
  },
};

export default {
  layerTreeAdministrativeBorders,
  customStyleDepartemental,
  customStyleInterCommunal,
  customStyleCommunal,
  customStyleCommunalTransparent,
  interactionCommunalTransparent,
};
