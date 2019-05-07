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
    default:
      return key;
  }
}
