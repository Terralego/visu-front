const TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES = `
Commune : {{lib_geo}}  
Part des résidences principales : {{data}}%
`;

export default [{
  id: 'terralego-residences_principales',
  interaction: 'displayTooltip',
  trigger: 'mouseover',
  template: TEMPLATE_TOOLTIP_HABITATIONS_PRINCIPALES,
}];
