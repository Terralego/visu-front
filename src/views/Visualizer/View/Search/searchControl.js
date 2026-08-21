import { filterLayersStatesFromLayersState } from '@terralego/core/modules/Visualizer/services/layersTreeUtils';

import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import searchInMap, {
  canSearchLocations,
  fetchResultGeometry,
  SEARCH_MIN_QUERY_LENGTH,
} from './searchService';

export const getSearchableLayers = layersTreeState =>
  filterLayersStatesFromLayersState(layersTreeState, ({ active }) => !!active).filter(
    ([{ filters: { layer, mainField } = {} }]) => layer && mainField,
  );

export const getSearchAvailability = ({
  layersTreeState,
  layersEnable,
  locationsEnable,
  searchProvider,
  activeLayers,
}) => {
  const searchLayers = layersEnable !== false;
  const searchLocations = canSearchLocations(locationsEnable, searchProvider);
  const hasSearchableLayer = Array.from(layersTreeState.keys()).some(
    ({ filters: { mainField } = {} }) => !!mainField,
  );

  return {
    display: (searchLayers && hasSearchableLayer) || searchLocations,
    disabled: !(searchLayers && activeLayers.length) && !searchLocations,
  };
};

export const buildSearchControl = ({
  language,
  searchProvider,
  locationsEnable,
  layersEnable,
  translate,
  layers,
  onResultClick,
}) => ({
  onSearch: searchInMap({
    language,
    searchProvider,
    locationsEnable,
    layersEnable,
    translate,
    layers,
  }),
  onSearchResultClick: onResultClick,
  renderSearchInput: SearchInput,
  renderSearchResults: SearchResults,
  minQueryLength: SEARCH_MIN_QUERY_LENGTH,
});

export const selectSearchResult = async ({
  result,
  result: { label, layers } = {},
  map,
  focusOnSearchResult,
  setQuery,
  interactions = [],
  interactiveMapInstance,
  hideDetails,
}) => {
  setQuery(label);
  hideDetails();

  const { geometry, bounds, center } = await fetchResultGeometry(result);

  if (bounds || result.bounds) {
    focusOnSearchResult({ bounds: bounds || result.bounds });
  } else if (center || result.center) {
    map.flyTo({ center: center || result.center, zoom: Math.max(map.getZoom(), 14) });
  }

  const interaction =
    layers &&
    interactions.find(
      ({ id: iId, trigger = 'click' }) => layers.includes(iId) && trigger === 'click',
    );
  const mapLayer =
    interaction && (map.getLayer(interaction.id) || map.getLayer(`${interaction.id}-cluster-data`));

  if (!mapLayer) return;

  try {
    interaction.fn({
      feature: {
        type: 'Feature',
        properties: {
          _id: result._feature_id,
        },
        geometry: geometry || result.geom || null,
        layer: {
          id: mapLayer.id,
          source: mapLayer.source,
        },
        source: mapLayer.source,
        sourceLayer: mapLayer.sourceLayer,
      },
      map,
      event: {},
      layerId: mapLayer.id,
      instance: interactiveMapInstance,
    });
    map.fire('updateMap');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Could not open the details of the search result:', e);
  }
};
