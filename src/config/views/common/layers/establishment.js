export const layerEstablishment = {
  id: 'terralego-etablissements',
  source: 'terralego',
  'source-layer': 'etablissements',
  type: 'circle',
  cluster: {
    radius: [{
      value: 50,
      maxzoom: 16,
    }, {
      value: 10,
      minzoom: 16,
    }],
    steps: [2, 20, 300, 800, 1200],
    sizes: [5, 10, 15, 20, 22, 25],
    colors: ['#ffb3a8', '#ffb3a8', '#d7887b', '#af5f51', '#883729', '#600c00'],
    font: {
      color: '#ffffff',
    },
    border: 4,
  },
  minzoom: 12,
  paint: {
    'circle-stroke-width': 2,
    'circle-stroke-color': 'white',
    'circle-stroke-opacity': 0.8,
    'circle-color': [
      'match',
      ['get', 'apet700_ta5_corres_naf'],
      'Activités supports', '#ff8c00',
      'Agriculture', '#1e6414',
      'Commerce de détail', '#965096',
      'Commerce de gros', '#ff78a0',
      'Construction', '#003c82',
      'Industrie', '#f5000a',
      'Logistique', '#c8be00',
      'Services aux particuliers', '#90ff77',
      'Services tertiaire supérieur', '#007dff',
      '#777',
    ],
  },
};

function generateStaticCluster (layerId = '', zoom) {
  return [{
    id: `${layerId}-static-cluster-circle-${zoom}`,
    source: 'terralego',
    'source-layer': `etablissements_cluster_${zoom}`,
    type: 'circle',
    filter: ['has', 'point_count'],
    paint: {
      'circle-radius': [
        'case',
        ['<', ['get', 'point_count'], 20],
        10,
        ['<', ['get', 'point_count'], 300],
        15,
        ['<', ['get', 'point_count'], 800],
        20,
        ['<', ['get', 'point_count'], 1200],
        22,
        25,
      ],
      'circle-color': [
        'case',
        ['<', ['get', 'point_count'], 20],
        '#ffb3a8',
        ['<', ['get', 'point_count'], 300],
        '#d7887b',
        ['<', ['get', 'point_count'], 800],
        '#af5f51',
        ['<', ['get', 'point_count'], 1200],
        '#883729',
        '#600c00',
      ],
      'circle-stroke-width': 5,
      'circle-stroke-opacity': 0.4,
      'circle-stroke-color': [
        'case',
        ['<', ['get', 'point_count'], 20],
        '#ffb3a8',
        ['<', ['get', 'point_count'], 300],
        '#d7887b',
        ['<', ['get', 'point_count'], 800],
        '#af5f51',
        ['<', ['get', 'point_count'], 1200],
        '#883729',
        '#600c00',
      ],
    },
  }, {
    id: `${layerId}-static-cluster-count-${zoom}`,
    source: 'terralego',
    'source-layer': `etablissements_cluster_${zoom}`,
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': [
        'let', 'round', ['/', ['number', ['get', 'point_count']], 1000], [
          'case',
          ['>', ['var', 'round'], 1],
          ['concat', [
            'number-format',
            ['var', 'round'],
            { locale: 'en', 'max-fraction-digits': 1 },
          ], 'k'],
          ['get', 'point_count'],
        ]],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': [
        'case',
        ['<', ['get', 'point_count'], 20],
        10,
        ['<', ['get', 'point_count'], 300],
        15,
        ['<', ['get', 'point_count'], 800],
        18,
        ['<', ['get', 'point_count'], 1200],
        20,
        16,
      ],
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#ffffff',
    },
  }];
}

export const layersEstablishmentStaticClusters = [7, 8, 9, 10, 11].reduce((all, zoom) =>
  [...all, ...generateStaticCluster('terralego-etablissements', zoom)], []);

export const layerEstablishmentColorless = {
  ...layerEstablishment,
  id: 'terralego-etablissements-colorless',
  paint: {
    'circle-color': '#535353',
  },
};
export const layerEstablishmentColorlessStaticClusters = [7, 8, 9, 10, 11].reduce((all, zoom) =>
  [...all, ...generateStaticCluster('terralego-etablissements-colorless', zoom)], []);

export const layerEstablishmentEmployees = {
  type: 'circle',
  source: 'terralego',
  id: 'terralego-etablissements-employees',
  filter: ['has', 'effectif_reel'],
  paint: {
    'circle-radius': [
      'case',
      ['<', ['get', 'effectif_reel'], 20],
      5,
      ['<', ['get', 'effectif_reel'], 93],
      8,
      ['<', ['get', 'effectif_reel'], 227],
      10,
      ['<', ['get', 'effectif_reel'], 463],
      12,
      ['<', ['get', 'effectif_reel'], 800],
      15,
      20,
    ],
    'circle-color': [
      'case',
      ['<', ['get', 'effectif_reel'], 20],
      '#fdd49e',
      ['<', ['get', 'effectif_reel'], 93],
      '#fdbb84',
      ['<', ['get', 'effectif_reel'], 227],
      '#fc8d59',
      ['<', ['get', 'effectif_reel'], 463],
      '#ef6548',
      ['<', ['get', 'effectif_reel'], 800],
      '#d7301f',
      '#990000',
    ],
  },
  'source-layer': 'etablissements',
};

export default layerEstablishment;
