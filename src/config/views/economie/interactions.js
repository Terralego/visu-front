import { interactionCommunalTransparent } from '../../utils/administrativeBorders';

const TEMPLATE_TOOLTIP_EMPLOIS = `
Commune : {{nom}}  
Nombre d'emplois : {{(emplt_2015 | round(1)).toLocaleString() }}
`;

export const interactionEconomie = {
  id: 'terralego-emplois',
  interaction: 'displayTooltip',
  trigger: 'mouseover',
  template: TEMPLATE_TOOLTIP_EMPLOIS,
};

export default [
  interactionEconomie,
  interactionCommunalTransparent,
];
