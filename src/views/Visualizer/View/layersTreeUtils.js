import { PREFIX_SOURCE } from '@terralego/core/modules/Map/services/cluster';

import searchService, { MAX_SIZE } from '../../../services/search';

const INITIAL_FILTERS = new Map();

export const isCluster = (source, layerId) => !!source.match(new RegExp(`^${layerId}-${PREFIX_SOURCE}-[0-9]+`));

export function initLayersStateAction (layersTree) {
  const layersTreeState = new Map();
  function reduceLayers (group, map) {
    return group.reduce((layersStateMap, layer) => {
      const { initialState = {}, sublayers } = layer;
      const { active } = initialState;
      if (sublayers) {
        initialState.sublayers = initialState.sublayers || sublayers.map((_, k) =>
          (k === 0 && !!active));
      }
      if (layer.group) {
        return reduceLayers(layer.layers, layersStateMap);
      }
      initialState.opacity = initialState.opacity === undefined
        ? 1
        : initialState.opacity;
      layersStateMap.set(layer, {
        active: false,
        opacity: 1,
        ...initialState,
      });
      return layersStateMap;
    }, map);
  }
  return reduceLayers(layersTree, layersTreeState);
}

export function setLayerStateAction (layer, layerState, prevLayersTreeState) {
  const layersTreeState = new Map(prevLayersTreeState);
  const prevLayerState = layersTreeState.get(layer);
  const newLayerState = { ...layerState };

  if (!prevLayerState) return prevLayersTreeState;

  if (prevLayerState.sublayers && !prevLayerState.sublayers.find(sl => sl)) {
    newLayerState.sublayers = [...prevLayerState.sublayers];
    newLayerState.sublayers[0] = true;
  }
  if (newLayerState.table) {
    // Easiest to to read as transform Map in Array and run a .map() on it
    // eslint-disable-next-line no-param-reassign
    layersTreeState.forEach(layState => { layState.table = false; });
  }
  layersTreeState.set(layer, {
    ...prevLayerState,
    ...newLayerState,
  });
  return layersTreeState;
}

export function layersTreeStatesHaveChanged (layersTreeState, prevLayersTreeState, fields = ['active']) {
  return !fields.reduce((all, field) =>
    all && Array.from(layersTreeState).reduce((suball, [layer, state = {}]) =>
      suball && state[field] === (prevLayersTreeState.get(layer) || {})[field],
    all),
  true);
}

export function selectSublayerAction (layer, sublayer, prevLayersTreeState) {
  const layersTreeState = new Map(prevLayersTreeState);
  const layerState = layersTreeState.get(layer);
  layerState.sublayers = layerState.sublayers.map((_, k) => k === sublayer);
  layersTreeState.set(layer, { ...layerState });
  return layersTreeState;
}

export const filterFeatures = (
  map,
  features = [/* { c: String, features: [{},] } */],
  layersTreeState,
) => {
  Array.from(layersTreeState).forEach(([{
    sublayers = [],
    layers = sublayers.reduce((all, { layers: layersIds }) => [...all, ...layersIds], []),
    filters: { layer } = {},
  }, {
    active,
  }]) => {
    if (!active || !layers) return;
    const layerFeatures = features
      .find(({ layer: fLayer }) => fLayer === layer);
    const { features: ids = [] } = layerFeatures || {};

    const filter = ['match', ['get', '_id'], ids.length ? ids : '', true, false];
    layers.forEach(layerId => {
      const paintLayer = map.getLayer(layerId);
      if (!paintLayer) return;

      if (isCluster(paintLayer.source, layerId)) {
        // Force to upgrade cluster data
        map.fire('refreshCluster');
        return;
      }

      if (!INITIAL_FILTERS.has(layerId)) {
        INITIAL_FILTERS.set(layerId, map.getFilter(layerId));
      }
      map.setFilter(layerId, layerFeatures ? filter : INITIAL_FILTERS.get(layerId));
    });
  });
};

export const resetFilters = (map, layersTreeState) => {
  Array.from(layersTreeState).forEach(([{
    sublayers = [],
    layers = sublayers.reduce((all, { layers: layersIds }) => [...all, ...layersIds], []),
    filters,
  }]) => {
    if (!filters) return;

    layers.forEach(layerId => {
      const paintLayer = map.getLayer(layerId);

      if (!map.getLayer(layerId)) return;

      if (isCluster(paintLayer.source, layerId)) {
        // Force to upgrade cluster data
        map.fire('refreshCluster');
        return;
      }
      if (!INITIAL_FILTERS.has(layerId)) return;
      map.setFilter(layerId, INITIAL_FILTERS.get(layerId));
    });
  });
};

export const filterLayersStatesFromLayersState = (
  layersTreeState = [],
  check = ({ active }) => !!active,
) => Array
  .from(layersTreeState)
  .reduce((allLayers, [layer, state]) =>
    ((check(state)) ? [...allLayers, [layer, state]] : allLayers), []);

export const filterLayersFromLayersState = (layersTreeState, check) =>
  filterLayersStatesFromLayersState(layersTreeState, check)
    .filter(([{ filters: { layer } = {} }]) => layer)
    .map(([{ filters: { layer } = {} }]) => layer);

export const hasTable = layersTreeState =>
  filterLayersFromLayersState(layersTreeState, ({ table }) => table).length > 0;

export const hasWidget = layersTreeState =>
  filterLayersFromLayersState(layersTreeState, ({ widgets = [] }) => widgets.length > 0).length > 0;

export const fetchPropertyValues = async (layer, { property }) => {
  const results = await searchService.search({
    properties: {
      'layer.keyword': { value: layer, type: 'term' },
    },
    aggregations: [{
      type: 'terms',
      field: `${property}.keyword`,
      name: 'values',
      options: {
        size: MAX_SIZE,
      },
    }],
    size: 0,
  });
  const { aggregations: { values: { buckets } } } = results;
  return buckets.map(({ key }) => key);
};

export const fetchPropertyRange = async (layer, { property }) => {
  const results = await searchService.search({
    properties: {
      'layer.keyword': { value: layer, type: 'term' },
    },
    aggregations: [{
      type: 'max',
      field: `${property}`,
      name: 'max',
    }, {
      type: 'min',
      field: `${property}`,
      name: 'min',
    }],
    size: 0,
  });
  const { aggregations: { min: { value: min }, max: { value: max } } = {} } = results;

  return { min: Math.round(min), max: Math.round(max) };
};

export default {
  initLayersStateAction,
  selectSublayerAction,
  setLayerStateAction,
  filterLayersFromLayersState,
  hasTable,
  hasWidget,
};
