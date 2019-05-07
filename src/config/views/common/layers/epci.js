export const epci = {
  type: 'line',
  source: 'terralego',
  id: 'terralego-epci',
  paint: {
    'line-color': '#DB3737',
    'line-width': 2,
  },
  'source-layer': 'epci',
};

export const epciInteraction = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-epci-interaction',
  paint: {
    'fill-color': 'rgba(255,255,255, 0)',
  },
  'source-layer': 'epci',
};

export const epciName = {
  type: 'symbol',
  source: 'terralego',
  id: 'terralego-epci-centroid',
  layout: {
    'text-field': '{libepci}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-allow-overlap': false,
  },
  paint: {
    'text-color': '#DB3737',
    'text-halo-color': 'rgba(255, 255, 255, 0.8)',
    'text-halo-width': 2,
  },
  'source-layer': 'epci-centroid',
};

export const epciEAELessThan10ha = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-epci-eae-less-than-10-ha',
  paint: {
    'fill-outline-color': 'lightblue',
    'fill-color': [
      'case',
      ['has', 'eae_inf_10'],
      [
        'case',
        ['<', ['get', 'eae_inf_10'], 34],
        '#dadaeb',
        ['<', ['get', 'eae_inf_10'], 50],
        '#9e9ac8',
        ['<', ['get', 'eae_inf_10'], 67],
        '#807dba',
        ['<', ['get', 'eae_inf_10'], 83],
        '#6a51a3',
        '#4a1486',
      ],
      '#fff',
    ],
  },
  'source-layer': 'epci',
};
export const epciEAEAVGSurface = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-epci-eae-avg-surface',
  paint: {
    'fill-outline-color': 'lightblue',
    'fill-color': [
      'case',
      ['has', 'avg_eae_surface'],
      [
        'case',
        ['<', ['get', 'avg_eae_surface'], 5],
        '#c7e9b4',
        ['<', ['get', 'avg_eae_surface'], 11],
        '#7fcdbb',
        ['<', ['get', 'avg_eae_surface'], 14],
        '#41b6c4',
        ['<', ['get', 'avg_eae_surface'], 21],
        '#1d91c0',
        '#225ea8',
      ],
      '#fff',
    ],
  },
  'source-layer': 'epci',
};

export const epciEAEAVGEmployees = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-epci-eae-avg-employees',
  paint: {
    'fill-outline-color': 'lightblue',
    'fill-color': [
      'case',
      ['has', 'avg_eae_emplois_surface'],
      [
        'case',
        ['<', ['get', 'avg_eae_emplois_surface'], 5],
        '#fed976',
        ['<', ['get', 'avg_eae_emplois_surface'], 11],
        '#fd8d3c',
        ['<', ['get', 'avg_eae_emplois_surface'], 14],
        '#fc4e2a',
        ['<', ['get', 'avg_eae_emplois_surface'], 21],
        '#e31a1c',
        '#b10026',
      ],
      '#fff',
    ],
  },
  'source-layer': 'epci',
};

export const epciEAEEmployees = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-epci-eae-employees',
  paint: {
    'fill-outline-color': 'lightblue',
    'fill-color': [
      'case',
      ['has', 'eae_emplois'],
      [
        'case',
        ['==', ['get', 'eae_emplois'], 0],
        '#fcc5c0',
        ['<', ['get', 'eae_emplois'], 330],
        '#f768a1',
        ['<', ['get', 'eae_emplois'], 2501],
        '#dd3497',
        ['<', ['get', 'eae_emplois'], 7001],
        '#ae017e',
        '#7a0177',
      ],
      '#fff',
    ],
  },
  'source-layer': 'epci',
};

export const epciEmploymentDensity = {
  type: 'fill',
  source: 'terralego',
  id: 'terralego-eae-employment-density',
  paint: {
    'fill-color': [
      'case',
      ['has', 'avg_eae_emplois_surface'],
      [
        'case',
        ['<', ['get', 'avg_eae_emplois_surface'], 9.057],
        '#fed976',
        ['<', ['get', 'avg_eae_emplois_surface'], 18.114],
        '#fd8d3c',
        ['<', ['get', 'avg_eae_emplois_surface'], 27.171],
        '#fc4e2a',
        ['<', ['get', 'avg_eae_emplois_surface'], 36.229],
        '#e31a1c',
        ['>', ['get', 'avg_eae_emplois_surface'], 36.229],
        '#b10026',
        '#b10026',
      ],
      'transparent',
    ],
    'fill-outline-color': 'lightblue',
  },
  'source-layer': 'epci',
};

export default epci;
