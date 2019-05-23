import React from 'react';
import ReactDOM from 'react-dom';

import Loading from '../../../components/Loading';

const el = document.createElement('div');
ReactDOM.render(<Loading className="details__loading" />, el);
const loading = el.innerHTML;

const TEMPLATE_DETAILS_EAE = `
<div class="details">
  <div 
    class="details__picto-{{voc_dom | slug}}"
    alt={{voc_dom}}
    title={{voc_dom}}
  >
  </div>
  <h2 class="details__title">
    <a href="https://fiches.sud-foncier-eco.fr/espaces-d-activites/{{id_eae}}" target="_blank">
    {{nom_ppal}}
    </a>
  </h2>
  {% if loading %}
    ${loading}
  {% else %}
  <section class="details__group">
    <h3 class="details__subtitle">Caractéristiques</h3>
    <ul class="details__list">
      <li class="details__column details__column--date_crea">
        <span class="details__column-label">
          Année de création
        </span>
        <span class="details__column-value">
        {% if date_crea.length > 0 %}{{date_crea}}{% else %}Non connue{% endif %}
        </span>
      </li>
      <li class="details__column details__column--type_esp">
        <span class="details__column-label">
          Nature
        </span>
        <span class="details__column-value">
        {% if type_esp.length > 0 %}{{type_esp}}{% else %}Non connu{% endif %}
        </span>
      </li>
      <li class="details__column details__column--ray_eae">
        <span class="details__column-label">
          Rayonnement ou polarité
        </span>
        <span class="details__column-value">
        {% if ray_eae.length > 0 %}{{ray_eae}}{% else %}Non connu{% endif %}
        </span>
      </li>
      <li class="details__column details__column--surf_total">
        <span class="details__column-label">
          Surface totale
        </span>
        <span class="details__column-value">
        {% if surf_total > 0 %}{{surf_total.toLocaleString()}} ha{% else %}Non connue{% endif %}
        </span>
      </li>
      <li class="details__column details__column--nb_etablissement">
      <span class="details__column-label">
        Nombre d'établissement{% if nb_etablissement > 0 %}s{% endif %}
      </span>
      <span class="details__column-value">
      {% if nb_etablissement > 0 %}{{nb_etablissement}}{% else %}Non connu{% endif %}
      </span>
    </li>
    <li class="details__column details__column--type_gest">
      <span class="details__column-label">
        Gestionnaire
      </span>
      <span class="details__column-value">
      {% if type_gest.length > 0 %}{{type_gest}}{% else %}Non connu{% endif %}
      </span>
    </li>
    </ul>
  </section>
  <section class="details__group">
    <h3 class="details__subtitle">Emploi</h3>
    <ul class="details__list">
      <li class="details__column details__column--voc_dom">
        <span class="details__column-label">
          Vocation dominante calculée
        </span>
        <span class="details__column-value">
        {% if voc_dom.length > 0 %}{{voc_dom}}{% else %}Non connu{% endif %}
        </span>
      </li>
      <li class="details__column details__column--pres_eff">
        <span class="details__column-label">
          Nombre d'emplois présentiels
        </span>
        <span class="details__column-value">
        {% if pres_eff > 0 %}{{pres_eff}}{% else %}Non connu{% endif %}
        </span>
      </li>
      <li class="details__column details__column--nonpres_eff">
        <span class="details__column-label">
          Nombre d'emplois productifs
        </span>
        <span class="details__column-value">
        {% if nonpres_eff > 0 %}{{nonpres_eff}}{% else %}Non connu{% endif %}
        </span>
      </li>
      <li class="details__column details__column--nb_emplois">
        <span class="details__column-label">
          Nombre d'emploi{% if nb_emplois > 0 %}s{% endif %}
        </span>
        <span class="details__column-value">
        {% if nb_emplois > 0 %}{{nb_emplois}}{% else %}Non connu{% endif %}
        </span>
      </li>
    </ul>
  </section>
  <section class="details__group">
    <h3 class="details__subtitle">Équipements</h3>
    <ul class="details__list__amenity">
      <li class="details__column details__column--fibre">
        <img
          class="details__list__amenity__img"
          alt="Fibre"
          title="Fibre"
        />
      </li>
      <li class="details__column details__column--parking">
        <img
          class="details__list__amenity__img"
          alt="Parking Poids lourds"
          title="Parking Poids lourds"
        />
      </li>
      <li class="details__column details__doctor">
        <img
          class="details__list__amenity__img"
          alt="Cabinets médicaux"
          title="Cabinets médicaux"
        />
      </li>
      <li class="details__column details__hotel">
        <img
          class="details__list__amenity__img"
          alt="Hôtels"
          title="Hôtels"
        />
      </li>
      <li class="details__column details__restaurant">
        <img
          class="details__list__amenity__img"
          alt="Restaurants"
          title="Restaurants"
        />
      </li>
      <li class="details__column details__post">
        <img
          class="details__list__amenity__img"
          alt="Agences de poste"
          title="Agences de poste"
        />
      </li>
      <li class="details__column details__bank">
        <img
          class="details__list__amenity__img"
          alt="Banques"
          title="Banques"
        />
      </li>
    </ul>
  </section>
  <section class="details__group">
    <h3 class="details__subtitle">Temps d'accès</h3>
    <div class="details__list__access">
      <div class="details__column details__tc">
        <span class="details__column-label">
          Desserte en transport en commun 
        </span>
        <span class="details__column-value">
          {% if accessibility_tc %}oui{% else %}non{% endif %}
        </span>
      </div>
      <p class="details__column-label">
        Temps de trajet en voiture
      </p>
      <ul class="details__times">
        <li class="details__column-value-time">
          <img 
            class="details__airport"
            alt="Aéroport le plus proche"
            title="Aéroport le plus proche"
          >
          <p class="details__column details__column-value">
          {% if closest_airport %}{{(closest_airport/60000) | round}} min{% else %}Non connu{% endif %}
          </p>
        </li>
        <li class="details__column-value-time">
          <img
          class="details__rail"
            alt="Gare la plus proche"
            title="Gare la plus proche"
          >
          <p class="details__column-value">
          {% if closest_gare %}{{(closest_gare/60000) | round}} min{% else %}Non connu{% endif %}
          </p>
        </li>
        <li class="details__column-value-time">
          <img 
            class="details__motorways"
            alt="Sortie d'autoroute la plus proche"
            title="Sortie d'autoroute la plus proche"
          >
          <p class="details__column-value">
          {% if closest_sortie_autoroute %}{{(closest_sortie_autoroute / 60000) | round}} min{% else %}Non connu{% endif %}
          </p>
        </li>
      </ul>
    </div>
  </section>
  <p class="details__link">
    <a href="https://fiches.sud-foncier-eco.fr/espaces-d-activites/{{id_eae}}" target="_blank">
      Voir la fiche complète
    </a>
  </p>
  {% endif %}
</div>
`;

const TEMPLATE_DETAILS_ETABLISSEMENTS = `
<div class="details">
  <h2 class="details__title">
    Établissement
  </h2>
  {% if loading %}
    ${loading}
  {% else %}
  <section class="details__group">
    <h3 class="details__subtitle">Caractéristiques</h3>
    <ul class="details__list">
    <li class="details__column">
      <span class="details__column-label">
        Siret
      </span>
      <span class="details__column-value">
        {{siret}}
      </span>
    </li>
    <li class="details__column">
      <span class="details__column-label">
        Date de création
      </span>
      <span class="details__column-value">
      {% if date_crea.length > 0 %}{{date_crea}}{% else %}Non connue{% endif %}
      </span>
    </li>
      <li class="details__column">
        <span class="details__column-label">
          Raison sociale
        </span>
        <span class="details__column-value">
          {{raison_sociale}}
        </span>
      </li>
      <li class="details__column">
        <span class="details__column-label">
          Adresse
        </span>
        <span class="details__column-value">
        {% if num_voie > 0 %}{{num_voie}},{%endif%} {% if type_voie %}{{type_voie}}{% endif%}  {% if lib_voie %}{{lib_voie}}, {% endif%}{{libcom}}
        </span>
      </li>
      <li class="details__column">
        <span class="details__column-label">
          Nom commune
        </span>
        <span class="details__column-value">
        {% if libcom.length > 0 %}{{libcom}}{% else %}Non connue{% endif %}
        </span>
      </li>
      <li class="details__column">
        <span class="details__column-label">
          Libellé principal de l'activité
        </span>
        <span class="details__column-value">
          {{libapet}}
        </span>
      </li>
      <li class="details__column">
        <span class="details__column-label">
          Effectif{% if effectif_reel > 0 %}s{% endif %} réel{% if effectif_reel > 0 %}s{% endif %}
        </span>
        <span class="details__column-value">
          {{effectif_reel}}
        </span>
      </li>
      {% if not effectif_reel %}
        <li class="details__column">
          <span class="details__column-label">
            Tranche d'effectif salarié
          </span>
          <span class="details__column-value">
            {{tefet}}
          </span>
        </li>
      {% endif %}
      <li class="details__column">
        <span class="details__column-label">
          Source des effectifs
        </span>
        <span class="details__column-value">
          {{origine_source}}
        </span>
      </li>
  </section>
  {% endif %}
</div>
`;

const TEMPLATE_DETAILS_COMMUNES = `
<div class="details">
  <h2 class="details__title">
    Commune
  </h2>
  {% if loading %}
    ${loading}
  {% else %}
  <section class="details__group">
    <h3 class="details__subtitle">Caractéristiques</h3>
    <ul class="details__list">
    <li class="details__column details__column">
      <span class="details__column-label">
        Commune
      </span>
      <span class="details__column-value">
        {{nom}}, {{depart}}
      </span>
    </li>
    <li class="details__column details__column">
      <span class="details__column-label">
        Statut
      </span>
      <span class="details__column-value">
        {{statut}}
      </span>
    </li>
    <li class="details__column details__column">
      <span class="details__column-label">
        Population
      </span>
      <span class="details__column-value">
        {{popul}}
      </span>
    </li>
    <li class="details__column details__column">
      <span class="details__column-label">
        Nombre d'emploi{% if nb_emplois > 0 %}s{% endif %}
      </span>
      <span class="details__column-value">
        {{nb_emplois}}
      </span>
    </li>
  </section>
  {% endif %}
</div>
`;

const TEMPLATE_TOOLTIP_EAE = `
# {{nom_ppal}}

* Commune : {% if nom_comm.length > 0 %}{{nom_comm}}{% else %}Non connue{% endif %}
* Surface : {{surf_total}} km²
* Nombre d'emploi{% if nb_emplois > 0 %}s{% endif %} : {{nb_emplois}}
* Espaces vert : {% if espaces_vert %}{{(espaces_vert*100) | round(2)}}%{% else %}Non connu{% endif %}
`;

const TEMPLATE_TOOLTIP_EAE_SURFACE = `
# {{nom_ppal}}

* Surface : {{surf_total}} km²
`;

const TEMPLATE_TOOLTIP_EAE_SYNC = TEMPLATE_TOOLTIP_EAE;

const TEMPLATE_TOOLTIP_EAE_EMPLOYMENT = `
# {{nom_ppal}}

* Nombre d'emploi{% if nb_emplois > 0 %}s{% endif %} : {{nb_emplois}}
`;

const TEMPLATE_TOOLTIP_ETABLISSEMENTS_EMPLOYEES = `
  * Nombre d'emplois: {{effectif_reel}}
`;

const TEMPLATE_TOOLTIP_EPCI_EAE_LESS_10 = `
* Part des espaces d'activités < 10 ha : {{eae_inf_10 | round(2)}}%
`;

const TEMPLATE_TOOLTIP_EPCI_AVG_EMPLOYEES = `
* Moyenne des emplois en espaces d'activités / ha : {{avg_eae_emplois_surface | round(2)}}
`;

const TEMPLATE_TOOLTIP_EPCI_AVG_SURFACE = `
* Surface moyenne des espaces d'activités : {{avg_eae_surface | round(2)}} ha
`;

const TEMPLATE_TOOLTIP_EPCI_EMPLOYEES =  `
* Répartition des emplois en espaces d'activités : {{eae_emplois}}
`;

const TEMPLATE_TOOLTIP_COMMUNES = `
Commune :  
{{nom}}, {{depart}}
`;

const TEMPLATE_TOOLTIP_PEM = `
# {{nom_de_l00}}
* Polarité : {{eti_polari}}
`;

const TEMPLATE_TOOLTIP_EPCI = `
# {{libepci}}
* Densité d'emplois : {{avg_eae_emplois_surface | round(2)}}/ha
`;

const TEMPLATE_TOOLTIP_FONCIER_DISP = `
* Surface disponible : {{(surfdispo/10000) | round(2)}} (ha)
* Nature du foncier mobilisable : {{dispo}}
`;

export default [
  {
    id: 'terralego-eae',
    interaction: 'displayDetails',
    template: TEMPLATE_DETAILS_EAE,
    fetchProperties: {
      url: '{{HOST}}/layer/zae/feature/{{id}}/',
      id: '_id',
    },
    highlight: {
      color: '#0B2B2F',
    },
  },
  {
    id: 'terralego-eae-regr',
    interaction: 'displayDetails',
    template: TEMPLATE_DETAILS_EAE,
    fetchProperties: {
      url: '{{HOST}}/layer/zae/feature/{{id}}/',
      id: '_id',
    },
  },
  {
    id: 'terralego-eae-dom',
    interaction: 'displayDetails',
    template: TEMPLATE_DETAILS_EAE,
    fetchProperties: {
      url: '{{HOST}}/layer/zae/feature/{{id}}/',
      id: '_id',
    },
  },
  {
    id: 'terralego-eae',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE,
    constraints: [
      { withLayers: ['!terralego-etablissements'] },
      { minZoom: 0, maxZoom: 13 },
    ],
  }, {
    id: 'terralego-eae-regr',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SYNC,
  }, {
    id: 'terralego-eae-dom',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SYNC,
  }, {
    id: 'terralego-eae-employment',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_EMPLOYMENT,
  }, {
    id: 'terralego-eae-surf',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SURFACE,
  }, {
    id: 'terralego-eae-logistique',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SYNC,
  }, {
    id: 'terralego-eae-centroid-point',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SYNC,
  }, {
    id: 'terralego-eae-activite-vert',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EAE_SYNC,
  }, {
    id: 'terralego-etablissements',
    interaction: 'displayDetails',
    template: TEMPLATE_DETAILS_ETABLISSEMENTS,
    fetchProperties: {
      url: '{{HOST}}/layer/etablissements/feature/{{id}}/',
      id: '_id',
    },
    constraints: [
      { minZoom: 16 },
      { isCluster: false },
    ],
    clusterLabel: 'raison_sociale',
  }, {
    id: 'terralego-etablissements-colorless',
    interaction: 'displayDetails',
    template: TEMPLATE_DETAILS_ETABLISSEMENTS,
    fetchProperties: {
      url: '{{HOST}}/layer/etablissements/feature/{{id}}/',
      id: '_id',
    },
    constraints: [
      { minZoom: 16 },
      { isCluster: false },
    ],
    clusterLabel: 'raison_sociale',
  }, ...(['terralego-etablissements', 'terralego-etablissements-colorless'].reduce((layers, layerId) => [
    ...layers,
    ...['', 7, 8, 9, 10, 11, 12].map(zoom => ({
      id: `${layerId}${zoom && `-static-cluster-circle-${zoom}`}`,
      zoom,
    })).map(({ id, zoom }) => ({
      id,
      interaction: 'zoom',
      step: 1,
      trigger: 'click',
      constraints: [{
        isCluster: !zoom,
        minZoom: zoom || undefined,
        maxZoom: 16,
      }],
    })),
  ], [])), {
    id: 'terralego-etablissements-colorless',
    interaction: 'zoom',
    step: 1,
    trigger: 'click',
    constraints: [{
      isCluster: true,
      minZoom: 12,
      maxZoom: 16,
    }],
  }, {
    id: 'terralego-etablissements-employees',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_ETABLISSEMENTS_EMPLOYEES,
  },
  {
    id: 'terralego-communes-interaction',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_COMMUNES,
  },
  {
    id: 'terralego-communes-interaction',
    interaction: 'displayDetails',
    fetchProperties: {
      url: '{{HOST}}/layer/communes/feature/{{id}}/',
      id: '_id',
    },
    template: TEMPLATE_DETAILS_COMMUNES,
  },
  {
    id: 'terralego-epci-eae-less-than-10-ha',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI_EAE_LESS_10,
  },
  {
    id: 'terralego-epci-eae-avg-employees',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI_AVG_EMPLOYEES,
  },
  {
    id: 'terralego-epci-eae-avg-surface',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI_AVG_SURFACE,
  },
  {
    id: 'terralego-epci-eae-employees',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI_EMPLOYEES,
  },
  {
    id: 'terralego-pem',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_PEM,
  }, {
    id: 'terralego-epci-interaction',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI,
  }, {
    id: 'terralego-foncier-disp-theorique',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_FONCIER_DISP,
  }, {
    id: 'terralego-foncier-disp',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_FONCIER_DISP,
  }, {
    id: 'terralego-eae-employment-density',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EPCI,
  },
];
