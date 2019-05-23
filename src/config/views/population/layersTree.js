export default [
  {
    group: 'Habitat',
    layers: [
      {
        label: 'Résidences principales',
        layers: ['terralego-residences_principales'],
        legends: [
          {
            title: 'Part des résidences principales (en %)',
            items: [
              { label: 'Supérieur ou égal à 92.8%', color: '#BC205D' },
              { label: 'De 89.2 à 92.8%', color: '#D4495A' },
              { label: 'De 84.3 à 89.2%', color: '#E8705D' },
              { label: 'De 76.3 à 84.3%', color: '#F79465' },
              { label: 'De 59.5 à 76.3%', color: '#F9AF79' },
              { label: 'De 44.8 à 59.5%', color: '#F7C99E' },
              { label: 'Inférieur à 44.8%', color: '#EFE3CF' },
            ],
          },
        ],
      },
    ],
  },
  {
    group: 'Mobilité',
    layers: [
      {
        label: 'Transport en commun',
        layers: ['terralego-transports'],
        legends: [
          {
            title: 'Part des actifs se déplaçant en transport en commun (en %)',
            items: [
              { label: 'Supérieur ou égal à 14.1%', color: '#BC205D' },
              { label: 'De 9.2 à 14.1%', color: '#D4495A' },
              { label: 'De 7.0 à 9.2%', color: '#E8705D' },
              { label: 'De 4.5 à 7.0%', color: '#F79465' },
              { label: 'De 2.7 à 4.5%', color: '#F9AF79' },
              { label: 'De 1.2 à 2.7%', color: '#F7C99E' },
              { label: 'Inférieur à 1.2%', color: '#EFE3CF' },
            ],
          },
        ],
      },
    ],
  },
  {
    group: 'Économie',
    layers: [
      {
        label: 'Nombre d\'emplois',
        layers: ['terralego-emplois'],
        initialState: {
          opacity: 0.8,
        },
        legends: [{
          title: 'Nombre d\'emplois',
          items: [
            { label: 'Plus de 180000', color: '#769198', shape: 'circle', radius: 25 },
            { label: 'De 100000 à 140000', color: '#769198', shape: 'circle', radius: 22 },
            { label: 'De 70000 à 100000', color: '#769198', shape: 'circle', radius: 20 },
            { label: 'De 30000 à 70000 ', color: '#769198', shape: 'circle', radius: 15 },
            { label: 'Moins de 30000', color: '#769198', shape: 'circle', radius: 10 },
          ],
        }],
      },
    ],
  },
];
