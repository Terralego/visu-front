export default function translate (key, params) {
  switch (key) {
    case 'terralego.map.search_results.title':
      return 'Résultats de recherche';
    case 'terralego.map.search_results.no_result':
      return 'Pas de résultat';
    case 'terralego.map.search_control.button_label':
      return 'Rechercher';
    case 'terralego.map.search_results.group_total':
      if (params.count > 1) {
        return `(${params.count} résultats trouvés)`;
      }
      return '(1 résultat trouvé)';
    case 'terralego.map.print_control.button_label':
      return 'Print to PDF';
    case 'terralego.map.permalink_control.button_label':
      return 'Share your map';
    case 'terralego.map.home_control.button_label':
      return 'Reset map center';
    default:
      return key;
  }
}
