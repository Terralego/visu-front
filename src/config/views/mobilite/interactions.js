const TEMPLATE_TOOLTIP_TRANSPORTS = `
Commune : {{nom}}  
Part des actifs se déplaçant en transport en commun : {{cdr_2015}}%
`;

export default [
  {
    id: 'terralego-transports',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_TRANSPORTS,
  },
];
