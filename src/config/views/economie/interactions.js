const TEMPLATE_TOOLTIP_EMPLOIS = `
Commune : {{lib_geo}}  
Nombre d'emplois : {{data}}
`;

export default [
  {
    id: 'terralego-emplois',
    interaction: 'displayTooltip',
    trigger: 'mouseover',
    template: TEMPLATE_TOOLTIP_EMPLOIS,
  },
];
