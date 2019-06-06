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
      layer: 'departements',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }],
    },
  }, {
    label: 'Intercommunalités',
    initialState: {
      active: false,
    },
    layers: ['terralego-intercommunal'],
    filters: {
      layer: 'intercommunalites',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }],
    },
  }, {
    label: 'Communes',
    initialState: {
      active: false,
    },
    layers: ['terralego-communal'],
    filters: {
      layer: 'communes',
      form: [{
        property: 'nom',
        label: 'Nom',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codegeo',
        label: 'Code postal',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libepci',
        label: 'Intercommune',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codepci',
        label: 'Code Intercommune',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libdep',
        label: 'Département',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codep',
        label: 'Code Département',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'libreg',
        label: 'Région',
        type: TYPE_SINGLE,
        fetchValues: true,
      }, {
        property: 'codreg',
        label: 'Code Région',
        type: TYPE_SINGLE,
        fetchValues: true,
      }],
      fields: [{
        value: 'nom',
        label: 'Nom',
      }, {
        value: 'codegeo',
        label: 'Code postal',
      }, {
        value: 'libepci',
        label: 'Intercommune',
      }, {
        value: 'codepci',
        label: 'Code Intercommune',
      }, {
        value: 'libdep',
        label: 'Département',
      }, {
        value: 'codep',
        label: 'Code Département',
      }, {
        value: 'libreg',
        label: 'Région',
      }, {
        value: 'codreg',
        label: 'Code Région',
      }],
    },
  }],
}, {
  group: 'Structure de la population',
  layers: [
    layerTreePopulationMunicipale,
    layerTreeSoldesNaturel,
    layerTreeSoldesMigratoire,
    layerTreeEvolution,
    layerTreeDensity,
    layerTreeAgeClasses,
  ],
}];
