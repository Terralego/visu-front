const fetchNominatim = async (query, language = 'en', t, searchProvider, viewbox = []) => {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('format', 'geojson');
  params.append('accept-language', language);
  if (viewbox && viewbox.length) {
    params.append('viewbox', viewbox);
    params.append('polygon_geojson', 1);
    params.append('bounded', 1);
  }

  const headers = new Headers([['Content-Type', 'application/json']]);
  let results;
  try {
    results = await fetch(`${searchProvider}${params}`, {
      headers,
    }).then(response => response.json());
  } catch (e) {
    return [];
  }
  // Filter to avoid duplicates location
  const filteredFeatures = results.features.reduce((list, result) => {
    if (!list.some(item => item.properties.display_name === result.properties.display_name)) {
      list.push(result);
    }
    return list;
  }, []);
  const data = [
    {
      total: filteredFeatures.length,
      group: t('terralego.map.search_results.locations'),
      results: filteredFeatures.map(
        ({ bbox, properties: { osm_id: id, display_name: label } }) => ({
          label,
          id,
          bounds: bbox,
        }),
      ),
    },
  ];
  return data;
};

export default fetchNominatim;
