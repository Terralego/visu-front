import { TYPE_SINGLE } from '@terralego/core/modules/Forms/Filters/Filters';

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
    filters: {
      layer: 'evpop_departemental',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
  }, {
    label: 'Intercommunalités',
    initialState: {
      active: false,
    },
    layers: ['terralego-intercommunal'],
    filters: {
      layer: 'evpop_intercommunal',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
  }, {
    label: 'Communes',
    initialState: {
      active: false,
    },
    layers: ['terralego-communal'],
    filters: {
      layer: 'evpop_communal',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }],
    },
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
