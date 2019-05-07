const tfTransportIconExpression = [
  'step',
  ['zoom'],
  'transparent',
  0,
  [
    'match',
    ['get', 'fclass'],
    'railway_station', 'rail-11',
    'railway_halt', 'rail-11',
    'transparent',
  ],
  13,
  [
    'match',
    ['get', 'fclass'],
    'railway_station', 'rail-15',
    'railway_halt', 'rail-15',
    'tram_stop', 'rail-light-15',
    'taxi', 'car-15',
    'ferry_terminal', 'ferry-15',
    'rail-15',
  ],
];

const tfBusFilter = ['==', 'fclass', 'bus_stop'];
const tfTramFilter = ['==', 'fclass', 'tram_stop'];
const tfTaxiFilter = ['==', 'fclass', 'taxi'];
const tfFerryFilter = ['==', 'fclass', 'ferry_terminal'];
const tfTrainFilter = [
  'any',
  ['==', 'fclass', 'railway_station'],
  ['==', 'fclass', 'railway_halt'],
];


export const busTransport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-bus',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  filter: tfBusFilter,
  'source-layer': 'arret_transport',
};

export const bus = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-line-bus',
  paint: {
    'line-color': '#ffcc00',
  },
  'source-layer': 'routes_bus',
};

export const trainTransport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-train',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  filter: tfTrainFilter,
  'source-layer': 'arret_transport',
};

export const pemTransport = {
  type: 'circle',
  source: 'terralego',
  id: 'terralego-pem',
  paint: {
    'circle-color': [
      'match',
      ['get', 'typoligie_'],
      'gare locale', '#a6cee3',
      'gare locale CP', '#1f78b4',
      'PEM de maillage', '#b2df8a',
      'PEM de maillage CP', '#33a02c',
      'PEM de proximité', '#fb9a99',
      'PEM national', '#e31a1c',
      'PEM national en projet', '#fdbf6f',
      'PEM régional', '#ff7f00',
      'hors typologie', '#cab2d6',
      '#cab2d6',
    ],
  },
  'source-layer': 'pem',
};

export const pemTransportColorless = {
  ...pemTransport,
  id: 'terralego-pem-colorless',
  paint: {
    'circle-color': '#535353',
  },
};

export const tramTransport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-tram',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  filter: tfTramFilter,
  'source-layer': 'arret_transport',
};

export const tram = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-tram',
  paint: {
    'line-color': '#ff0066',
  },
  'source-layer': 'rails_tram',
};

export const taxiTransport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-taxi',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  filter: tfTaxiFilter,
  'source-layer': 'arret_transport',
};

export const ferryTransport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-ferry',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  filter: tfFerryFilter,
  'source-layer': 'arret_transport',
};

export const roadTransport = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-line-autoroutes',
  paint: {
    'line-color': '#000066',
    'line-dasharray': [4, 2],
  },
  'source-layer': 'autoroutes',
};

// Duplicate of the previous layer because we need to display both
export const roadTransportBis = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-line-autoroutes-bis',
  paint: {
    'line-color': '#000066',
    'line-dasharray': [4, 2],
  },
  'source-layer': 'autoroutes',
};

export const transport = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-arret-transport',
  layout: {
    'icon-image': tfTransportIconExpression,
  },
  'source-layer': 'arret_transport',
};

// Les layers suivants ne proviennent pas directement du layer transport

export const train = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-train',
  paint: {
    'line-color': '#996633',
  },
  'source-layer': 'rails',
};

export const airports = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-airports',
  layout: {
    'icon-image': [
      'step', ['zoom'], 'airport-11',
      0, 'airport-11',
      10, 'airport-15',
    ],
  },
  'source-layer': 'airport',
};

export const roads = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-autoroutes',
  layout: {
    'icon-image': [
      'step', ['zoom'], 'autoroutes',
      0, 'autoroutes',
      10, 'autoroutes',
    ],
  },
  'source-layer': 'sorties_autoroutes',
};

// Duplicate of the previous layer because we need to display both
export const roadsBis = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-autoroutes-bis',
  layout: {
    'icon-image': [
      'step', ['zoom'], 'autoroutes',
      0, 'autoroutes',
      10, 'autoroutes',
    ],
  },
  'source-layer': 'sorties_autoroutes',
};

export default transport;
