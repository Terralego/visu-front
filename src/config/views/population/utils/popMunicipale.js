import { years } from './variables';

export const customStylePopulationMunicipale = years.map(year => ({
  type: 'circle',
  source: 'terralego',
  id: `terralego-population_municipale-communes_${year}`,
  paint: {
    'circle-color': '#769198',
    'circle-radius': ['*', ['get', `pop_${year}`], 0.000010, 10],
  },
  'source-layer': 'population_communal',
}));

export const layerTreePopulationMunicipale = years.map(year => ({
  label: `Communes en ${year}`,
  layers: [`terralego-population_municipale-communes_${year}`],
  initialState: {
    opacity: 0.8,
  },
  legends: [
    {
      title: 'Répartition de la population',
      items: [
        {
          label: 'Plus de 300000',
          color: '#769198',
          shape: 'circle',
          radius: 25,
        },
        {
          label: 'De 240000 à 300000',
          color: '#769198',
          shape: 'circle',
          radius: 22,
        },
        {
          label: 'De 180000 à 240000',
          color: '#769198',
          shape: 'circle',
          radius: 20,
        },
        {
          label: 'De 120000 à 180000 ',
          color: '#769198',
          shape: 'circle',
          radius: 15,
        },
        {
          label: 'Moins de 120000',
          color: '#769198',
          shape: 'circle',
          radius: 10,
        },
      ],
    },
  ],
}));

export default {
  customStylePopulationMunicipale,
  layerTreePopulationMunicipale,
};
