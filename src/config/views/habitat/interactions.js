import {
  interactionCommunalTransparent,
  interactionInterCommunalTransparent,
} from '../../utils/administrativeBorders';

const TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES = `
Commune : {{lib_geo}}  
Part des résidences principales : {{data}}%
`;

export const interactionHabitat = {
  id: 'terralego-residences_principales',
  interaction: 'displayTooltip',
  trigger: 'mouseover',
  template: TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES,
};

export default [
  interactionHabitat,
  interactionCommunalTransparent,
  interactionInterCommunalTransparent,
];
