const TEMPLATE_TOOLTIP_EMPLOIS = `
Commune : {{nom}}  
Nombre d'emplois : {{emplt_2015}}
`;

export default [
  {
    id: 'terralego-emplois',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EMPLOIS,
  },
];
