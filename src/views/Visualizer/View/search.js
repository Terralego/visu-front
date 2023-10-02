import turfCenter from '@turf/center';
import turfBbox from '@turf/bbox';

import searchService from '@terralego/core/modules/Visualizer/services/search';

export const fetchNominatim = async ({
  query,
  t,
  searchProvider,
  language = 'en',
  viewbox = [],
}) => {
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

  console.log(url.href);
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


const searchInMap = ({
  layers,
  t,
  locationsEnable,
  searchProvider,
  language = 'en',
  viewbox = [],
}) => async query => {
  console.log('searching...');
  const locations = locationsEnable
    ? await fetchNominatim({ query, language, t, searchProvider, viewbox })
    : [];

  if (!layers.length && !locations.length) return undefined;

  const { responses } = await searchService.msearch(
    layers.map(([{ filters: { layer }, baseEsQuery }]) => ({
      query,
      index: layer,
      baseQuery: baseEsQuery,
      size: 6,
    })),
  );

  const results = layers.map(([{
    label, layers: resultsLayers, filters: { mainField },
  }], index) => ({
    group: label,
    total: responses[index].hits.total.value,
    results: responses[index].hits.hits.map(({ _id: id, _source: source }) => ({
      label: source[mainField] || id,
      id,
      ...source,
      center: turfCenter(source.geom).geometry.coordinates,
      bounds: turfBbox(source.geom),
      layers: resultsLayers,
    })),
  }));

  return [...results, ...locations];
};

export default searchInMap;
