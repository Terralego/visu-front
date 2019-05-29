export default [
  {
    group: 'Emploi',
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
            { label: 'Plus de 180 000', color: '#769198', shape: 'circle', radius: 25 },
            { label: 'De 100 000 à 140 000', color: '#769198', shape: 'circle', radius: 22 },
            { label: 'De 70 000 à 100 000', color: '#769198', shape: 'circle', radius: 20 },
            { label: 'De 30 000 à 70 000 ', color: '#769198', shape: 'circle', radius: 15 },
            { label: 'Moins de 30 000', color: '#769198', shape: 'circle', radius: 10 },
          ],
        }],
      },
    ],
  },
];
