const TEMPLATE_TOOLTIP_TRANSPORTS = `
Commune : {{lib_geo}}  
Part des actifs se déplaçant en transport en commun : {{data}}%
`;

export default [
  {
    id: 'terralego-transports',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_TRANSPORTS,
  },
];
