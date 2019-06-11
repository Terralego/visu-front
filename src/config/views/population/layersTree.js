import { layerTreePopulationMunicipale } from './utils/popMunicipale';
import { layerTreeEvolution } from './utils/evolutionPop';
import { layerTreeDensity } from './utils/densitePop';
import {
  layerTreeSoldesMigratoire,
  layerTreeSoldesNaturel,
} from './utils/soldesPop';
import { layerTreeAgeClasses } from './utils/ageClassesPop';
import { layerTreeAdministrativeBorders } from '../../utils/administrativeBorders';

export default [
  {
    group: 'Structure de la population',
    layers: [
      layerTreePopulationMunicipale,
      layerTreeSoldesNaturel,
      layerTreeSoldesMigratoire,
      layerTreeEvolution,
      layerTreeDensity,
      layerTreeAgeClasses],
  },
  ...layerTreeAdministrativeBorders,
];
