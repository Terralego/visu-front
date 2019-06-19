import { interactionCommunalTransparent } from '../../utils/administrativeBorders';

const TEMPLATE_TOOLTIP_TRANSPORTS = `
Commune : {{nom}}  
Part des actifs se déplaçant en transport en commun : {{cdr_2015 | round(1)}}%
`;

export const interactionTransport = {
  id: 'terralego-transports',
  interaction: 'displayTooltip',
  trigger: 'mouseover',
  template: TEMPLATE_TOOLTIP_TRANSPORTS,
};

export default [
  interactionTransport,
  interactionCommunalTransparent,
];
