import { layerTreePopulationMunicipale } from './utils/popMunicipale';
import { layerTreeEvolution } from './utils/evolutionPop';
import { layerTreeDensity } from './utils/densitePop';
import {
  layerTreeSoldesMigratoire,
  layerTreeSoldesNaturel,
} from './utils/soldesPop';
import { layerTreeAgeClasses } from './utils/ageClassesPop';

export default [{
  group: 'Limites administratives',
  layers: [{
    label: 'Départements',
    initialState: {
      active: false,
    },
    layers: ['terralego-departemental'],
  }, {
    label: 'Intercommunalités',
    initialState: {
      active: false,
    },
    layers: ['terralego-intercommunal'],
  }, {
    label: 'Communes',
    initialState: {
      active: false,
    },
    layers: ['terralego-communal'],
  }],
}, {
  group: 'Population municipale',
  layers: [...layerTreePopulationMunicipale],
}, {
  group: 'Évolution de la population',
  layers: [...layerTreeEvolution],
}, {
  group: 'Densité de la population',
  layers: [...layerTreeDensity],
}, {
  group: 'Soldes naturel et migratoire',
  layers: [...layerTreeSoldesNaturel, ...layerTreeSoldesMigratoire],
}, {
  group: 'Classe d\'âge',
  layers: [...layerTreeAgeClasses],
}];
