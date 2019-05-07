export const eae = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae',
  paint: {
    'fill-color': '#c65959',
    'fill-opacity': 0.4,
  },
  'source-layer': 'zae',
};

export const eaeLogistique = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-logistique',
  paint: {
    'fill-color': [
      'match',
      ['get', 'voc_regr'],
      'Logistique', '#c8be00',
      'transparent',
    ],
    'fill-opacity': 0.8,
  },
  'source-layer': 'zae',
};

export const eaeGreenActivities = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-activite-vert',
  paint: {
    'fill-color': [
      'case',
      ['>', ['get', 'espaces_vert'], 0.1],
      '#079137',
      'transparent',
    ],
  },
  'source-layer': 'zae',
};

export const eaeIsoVocLogistique5 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-5',
  filter: ['==', ['get', 'level'], 0],
  paint: {
    'fill-color': '#1a9850',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeIsoVocLogistique10 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-10',
  filter: ['==', ['get', 'level'], 1],
  paint: {
    'fill-color': '#91cf60',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeIsoVocLogistique15 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-15',
  filter: ['==', ['get', 'level'], 2],
  paint: {
    'fill-color': '#d9ef8b',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeIsoVocLogistique20 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-20',
  filter: ['==', ['get', 'level'], 3],
  paint: {
    'fill-color': '#fee08b',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeIsoVocLogistique25 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-25',
  filter: ['==', ['get', 'level'], 4],
  paint: {
    'fill-color': '#fc8d59',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeIsoVocLogistique30 = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-iso-voc-logistique-30',
  filter: ['==', ['get', 'level'], 5],
  paint: {
    'fill-color': '#d73027',
    'fill-antialias': false,
  },
  'source-layer': 'zae-logistique-isochrone',
};

export const eaeRegr = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-regr',
  paint: {
    'fill-color': [
      'match',
      ['get', 'voc_regr'],
      'Activités supports', '#ff8c00',
      'Commerce de détail', '#965096',
      'Commerce de gros', '#ff78a0',
      'Construction', '#003c82',
      'Industrie', '#f5000a',
      'Logistique', '#c8be00',
      'Services aux particuliers', '#90ff77',
      'Services tertiaire supérieur', '#007dff',
      'Autres', '#1e6414',
      '#6a89cc',
    ],
    'fill-opacity': 0.8,
  },
  'source-layer': 'zae',
};

export const eaeDom = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-dom',
  paint: {
    'fill-color': [
      'match',
      ['get', 'voc_dom'],
      'Activités supports', '#8fa9db',
      'Commerce de détail', '#ec7c30',
      'Commerce de gros/Logistique', '#fedb2a',
      'Construction', '#a6a5ae',
      'Industrie', '#1f78b4',
      'Services aux particuliers', '#9e480d',
      'Tertiaire supérieur', '#b3de69',

      'Mixte', '#b91a1c',
      'Mixte à dominante Activités supports', '#b91a1c',
      'Mixte à dominante Commerce de détail', '#b91a1c',
      'Mixte à dominante Commerce de gros/Logistique', '#b91a1c',
      'Mixte à dominante Logistique', '#b91a1c',
      'Mixte à dominante Construction', '#b91a1c',
      'Mixte à dominante Industrie', '#b91a1c',
      'Mixte à dominante Services aux particuliers', '#b91a1c',
      'Mixte à dominante Tertiaire supérieur', '#b91a1c',
      'transparent',
    ],
    'fill-opacity': 0.8,
  },
  'source-layer': 'zae',
};

export const eaeSurf = {
  type: 'circle',
  source: 'terralego',
  id: 'terralego-eae-surf',
  paint: {
    'circle-radius': [
      'case',
      ['has', 'surf_total'],
      [
        'case',
        ['<', ['get', 'surf_total'], 35],
        3,
        ['<', ['get', 'surf_total'], 125],
        6,
        ['<', ['get', 'surf_total'], 330],
        9,
        ['<', ['get', 'surf_total'], 700],
        12,
        ['<', ['get', 'surf_total'], 1700],
        15,
        18,
      ],
      0],
    'circle-color': [
      'case',
      ['has', 'surf_total'],
      [
        'case',
        ['<', ['get', 'surf_total'], 35],
        '#c7e24a',
        ['<', ['get', 'surf_total'], 125],
        '#a7b655',
        ['<', ['get', 'surf_total'], 330],
        '#878c5b',
        ['<', ['get', 'surf_total'], 700],
        '#66645c',
        ['<', ['get', 'surf_total'], 1700],
        '#413f5b',
        '#081d58',
      ],
      '#fff',
    ],
  },
  'source-layer': 'zae-centroid',
};

export const eaeEmployment = {
  type: 'circle',
  source: 'terralego',
  id: 'terralego-eae-employment',
  paint: {
    'circle-radius': [
      'case', ['has', 'nb_emplois'],
      [
        'case',
        ['<', ['get', 'nb_emplois'], 300],
        3,
        ['<', ['get', 'nb_emplois'], 1000],
        6,
        ['<', ['get', 'nb_emplois'], 5000],
        9,
        ['<', ['get', 'nb_emplois'], 15000],
        12,
        ['<', ['get', 'nb_emplois'], 25000],
        15,
        18,
      ],
      0,
    ],
    'circle-color': [
      'case',
      ['has', 'nb_emplois'],
      [
        'case',
        ['<', ['get', 'nb_emplois'], 300],
        '#fcbba1',
        ['<', ['get', 'nb_emplois'], 1000],
        '#fc9272',
        ['<', ['get', 'nb_emplois'], 5000],
        '#fb6a4a',
        ['<', ['get', 'nb_emplois'], 15000],
        '#ef3b2c',
        ['<', ['get', 'nb_emplois'], 25000],
        '#cb181d',
        '#99000d',
      ],
      '#fff',
    ],
  },
  'source-layer': 'zae-centroid',
};

export const eaeName = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-eae-centroid',
  filter: ['>', ['zoom'], 10],
  layout: {
    'text-field': '{nom_ppal}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#666',
  },
  'source-layer': 'zae-centroid',
};

export const eaefoncierDispTheo = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-foncier-disp-theorique',
  paint: {
    'fill-color': [
      'case',
      ['has', 'surfdispo'],
      [
        'case',
        ['<', ['get', 'surfdispo'], 121178],
        '#addd8e',
        ['<', ['get', 'surfdispo'], 469768],
        '#78c679',
        ['<', ['get', 'surfdispo'], 1384820],
        '#41ab5d',
        ['<', ['get', 'surfdispo'], 3418629],
        '#238443',
        '#005a32',
      ],
      '#fff',
    ],
    'fill-outline-color': '#8f8f8f',
  },
  'source-layer': 'foncier_disponible_theorique',
};

export const eaefoncierDisp = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-foncier-disp',
  paint: {
    'fill-color': [
      'case',
      ['has', 'dispo'],
      [
        'case',
        ['==', ['get', 'dispo'], 'mobilisable terrain nu'],
        '#005a32',
        ['==', ['get', 'dispo'], 'mobilisable activite terrain nu'],
        '#238443',
        ['==', ['get', 'dispo'], 'mobilisable partiellement batie'],
        '#41ab5d',
        ['==', ['get', 'dispo'], 'mobilisable activite partiellement batie'],
        '#78c679',
        ['==', ['get', 'dispo'], 'reserve fonciere nue'],
        '#addd8e',
        ['==', ['get', 'dispo'], 'reserve fonciere activite nue'],
        '#fee090',
        ['==', ['get', 'dispo'], 'reserve fonciere partiellement batie'],
        '#fdae61',
        ['==', ['get', 'dispo'], 'reserve fonciere activite partiellement batie'],
        '#f46d43',
        ['==', ['get', 'dispo'], 'non mobilisable'],
        '#d73027',
        ['==', ['get', 'dispo'], 'non constructible'],
        '#a50026',
        ['==', ['get', 'dispo'], 'NSP'],
        '#797979',
        '#797979',
      ],
      '#fff',
    ],
    'fill-outline-color': '#8f8f8f',
  },
  'source-layer': 'foncier_disponible_theorique',
};

export const eaeCentroidPoint = {
  type: 'circle',
  source: 'terralego',
  id: 'terralego-eae-centroid-point',
  paint: {
    'circle-color': '#49006a',
  },
  'source-layer': 'zae-centroid',
};

export default eae;
