import turfCenter from '@turf/center';
import turfBbox from '@turf/bbox';

import Api from '@terralego/core/modules/Api';
import elasticsearch from '@terralego/core/modules/Visualizer/services/search';

const SEARCH_WITH_ELASTICSEARCH = true;

const SEARCH_RESULTS_PER_LAYER = 10;

export const SEARCH_MIN_QUERY_LENGTH = 3;

export const DEFAULT_NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const errorGroup = label => ({ group: label, total: 0, results: [], error: true });

const toBounds = geom => {
  const [west, south, east, north] = turfBbox(geom);
  return west === east && south === north ? undefined : [west, south, east, north];
};

export const canSearchLocations = (locationsEnable, { provider } = {}) =>
  !!locationsEnable && `${provider}`.toLowerCase() === 'nominatim';

export const fetchNominatim = async ({
  query,
  translate,
  baseUrl = DEFAULT_NOMINATIM_URL,
  language = 'en',
  options: { viewbox = [] } = {},
}) => {
  let url;
  try {
    url = new URL(baseUrl);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Invalid location search URL "${baseUrl}":`, e);
    return [];
  }
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('accept-language', language);
  if (viewbox.length) {
    url.searchParams.set('viewbox', viewbox);
    url.searchParams.set('polygon_geojson', 1);
    url.searchParams.set('bounded', 1);
  }

  let results;
  try {
    results = await fetch(url).then(response => response.json());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Location search failed:', e);
    return [];
  }
  // Filter to avoid duplicates location
  const filteredFeatures = (results?.features || []).reduce((list, result) => {
    if (!list.some(item => item.properties.display_name === result.properties.display_name)) {
      list.push(result);
    }
    return list;
  }, []);
  return [
    {
      total: filteredFeatures.length,
      group: translate('terralego.map.search_results.locations'),
      results: filteredFeatures
        .slice(0, SEARCH_RESULTS_PER_LAYER)
        .map(({ bbox, properties: { osm_id: id, display_name: label } }) => ({
          label,
          id,
          bounds: bbox,
        })),
    },
  ];
};

const searchInLayer = async ({ label, layers, filters }, query) => {
  const { layer: source, mainField } = filters;

  let response;
  try {
    response = await Api.request(`geo-api/${encodeURIComponent(source)}/feature/`, {
      querystring: {
        search: query,
        limit: SEARCH_RESULTS_PER_LAYER,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Search failed on layer "${source}":`, e);
    return errorGroup(label);
  }

  const { count = 0, results = [] } = response || {};

  return {
    group: label,
    total: count,
    results: results.map(({ identifier, properties = {} }) => {
      const { search_match: matchedField } = properties;
      return {
        ...properties,
        label: properties[mainField] || identifier,
        id: identifier,
        _feature_id: identifier,
        matchedField: matchedField === mainField ? undefined : matchedField,
        matchedValue: matchedField === mainField ? undefined : properties[matchedField],
        source,
        layers,
      };
    }),
  };
};

export const fetchResultGeometry = async ({ source, id }) => {
  if (!source || id === undefined) return {};
  try {
    const { geometry } = await Api.request(
      `geo-api/${encodeURIComponent(source)}/feature/${encodeURIComponent(id)}/`,
      { querystring: { geometry: true } },
    );
    if (!geometry) return {};
    return {
      geometry,
      bounds: toBounds(geometry),
      center: turfCenter(geometry).geometry.coordinates,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Could not fetch the geometry of "${id}" on layer "${source}":`, e);
    return {};
  }
};

const stripAccents = value =>
  `${value}`.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const findMatchedField = (properties, query, mainField) => {
  const needle = stripAccents(query);
  const matched = Object.keys(properties).find(
    key =>
      key !== '_feature_id' &&
      properties[key] !== null &&
      stripAccents(properties[key]).includes(needle),
  );
  return matched === mainField ? undefined : matched;
};

const searchLayersInElasticsearch = async (layers, query) => {
  let responses;
  try {
    ({ responses } = await elasticsearch.msearch(
      layers.map(([{ filters: { layer }, baseEsQuery }]) => ({
        query,
        index: layer,
        baseQuery: baseEsQuery,
        size: SEARCH_RESULTS_PER_LAYER,
      })),
    ));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Search failed:', e);
    return layers.map(([{ label }]) => errorGroup(label));
  }

  return layers.map(([{ label, layers: mapLayers, filters: { mainField } }], index) => {
    const { hits } = responses?.[index] || {};
    if (!hits) return errorGroup(label);

    return {
      group: label,
      total: hits.total.value,
      results: hits.hits.map(({ _id: id, _source: { geom, ...properties } }) => {
        const matchedField = findMatchedField(properties, query, mainField);
        return {
          ...properties,
          label: properties[mainField] || id,
          id,
          _feature_id: id,
          matchedField,
          matchedValue: matchedField && properties[matchedField],
          geom,
          bounds: toBounds(geom),
          center: turfCenter(geom).geometry.coordinates,
          source: undefined,
          layers: mapLayers,
        };
      }),
    };
  });
};

const searchLayers = (layers, query) =>
  (SEARCH_WITH_ELASTICSEARCH
    ? searchLayersInElasticsearch(layers, query)
    : Promise.all(layers.map(([layer]) => searchInLayer(layer, query))));

const searchInMap = ({
  searchProvider: { provider, baseUrl, options = {} } = {},
  layers,
  translate,
  locationsEnable,
  layersEnable = true,
  language = 'en',
}) => async query => {
  const searchLocations = canSearchLocations(locationsEnable, { provider });
  const searchedLayers = layersEnable ? layers : [];

  if (!searchLocations && !searchedLayers.length) return undefined;

  const [locations, results] = await Promise.all([
    searchLocations ? fetchNominatim({ query, language, translate, baseUrl, options }) : [],
    searchedLayers.length ? searchLayers(searchedLayers, query) : [],
  ]);

  return [...results, ...locations];
};

export default searchInMap;
