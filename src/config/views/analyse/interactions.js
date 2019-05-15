const TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES = `
Commune : {{lib_geo}}  
Part des résidences principales : {{data}}%
`;

const TEMPLATE_TOOLTIP_TRANSPORTS = `
Commune : {{lib_geo}}  
Part des actifs se déplaçant en transport en commun : {{data}}%
`;

export default [
  {
    id: 'terralego-residences_principales',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES,
  },
  {
    id: 'terralego-transports',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_TRANSPORTS,
  },
];
