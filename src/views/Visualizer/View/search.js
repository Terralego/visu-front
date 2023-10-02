const fetchNominatim = async (query, language = 'en', t, searchProvider, viewbox = []) => {
  const url = new URL(searchProvider);
  url.searchParams.set('q', query);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('accept-language', language);
  if (viewbox && viewbox.length) {
    url.searchParams.set('viewbox', viewbox);
    url.searchParams.set('polygon_geojson', 1);
    url.searchParams.set('bounded', 1);
  }

  const headers = new Headers([['Content-Type', 'application/json']]);
  let results;
  try {
    results = await fetch(url, {
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
