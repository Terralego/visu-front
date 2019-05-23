export default [
  {
    group: 'Logements',
    layers: [
      {
        label: 'Résidences principales',
        layers: ['terralego-residences_principales'],
        legends: [
          {
            title: 'Part des résidences principales (en %)',
            items: [
              { label: 'Inférieur à 44.8%', color: '#EFE3CF' },
              { label: 'De 44.8 à 59.5%', color: '#F7C99E' },
              { label: 'De 59.5 à 76.3%', color: '#F9AF79' },
              { label: 'De 76.3 à 84.3%', color: '#F79465' },
              { label: 'De 84.3 à 89.2%', color: '#E8705D' },
              { label: 'De 89.2 à 92.8%', color: '#D4495A' },
              { label: 'Supérieur ou égal à 92.8%', color: '#BC205D' },
            ],
          },
        ],
      },
    ],
  },
];
