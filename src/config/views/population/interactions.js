import { interactionPopulationMunicipale } from './utils/popMunicipale';
import { interactionEvolution } from './utils/evolutionPop';
import { interactionDensite } from './utils/densitePop';
import { interactionAgeClasses } from './utils/ageClassesPop';
import {
  interactionSoldesMigratoire,
  interactionSoldesNaturel,
} from './utils/soldesPop';

export default [
  ...interactionPopulationMunicipale,
  ...interactionEvolution,
  ...interactionDensite,
  ...interactionAgeClasses,
  ...interactionSoldesNaturel,
  ...interactionSoldesMigratoire,
];
