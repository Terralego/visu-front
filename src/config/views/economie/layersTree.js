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
