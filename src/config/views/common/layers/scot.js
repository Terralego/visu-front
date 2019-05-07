export const scot = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-scot',
  paint: {
    'line-color': '#fe9929',
    'line-width': 1,
  },
  'source-layer': 'scot',
};

export const scotName = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-scot-centroid',
  layout: {
    'text-field': '{nom_scot}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-allow-overlap': false,
  },
  paint: {
    'text-color': '#fe9929',
    'text-halo-color': 'rgba(255, 255, 255, 0.8)',
    'text-halo-width': 2,
  },
  'source-layer': 'scot-centroid',
};

export default scot;
