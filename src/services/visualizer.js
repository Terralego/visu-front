import Api from '@terralego/core/modules/Api';
import { sortCustomLayers } from '@terralego/core/modules/Visualizer/services/layersTreeUtils';
import memoizee from 'memoizee';
import { EXTENT_TYPE_MULTIPLE } from '../components/TerritorySelector/extentUtils';
import defaultIcon from '../images/defaultLogo.svg';

const mediaHost = () => Api.host.replace(/\/api\/?$/, '').replace(/\/$/, '');

const resolveMediaUrl = url =>
  (typeof url === 'string' && url.startsWith('/') ? `${mediaHost()}${url}` : url);

const toNumber = value => (typeof value === 'string' ? Number(value) : value);

const normalizeExtent = ({
  id,
  name,
  category,
  pictogram,
  adapts_to_theme: adaptsToTheme,
  minLat,
  minLon,
  maxLat,
  maxLon,
}) => {
  const bounds = [
    [toNumber(minLon), toNumber(minLat)],
    [toNumber(maxLon), toNumber(maxLat)],
  ];

  if (!bounds.flat().every(Number.isFinite)) return null;

  return {
    id,
    label: name,
    category,
    icon: resolveMediaUrl(pictogram),
    adaptToTheme: !!adaptsToTheme,
    bounds,
  };
};

export const normalizeExtents = ({ map = {} } = {}) => ({
  extentType: map.extent_type,
  extents: (Array.isArray(map.extra_extents) ? map.extra_extents : [])
    .map(normalizeExtent)
    .filter(Boolean),
});
const replaceApiHost = obj => JSON.parse(
  JSON.stringify(obj).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`),
);

const fetchLayerDetails = async (viewSlug, layerId) => {
  try {
    return await Api.request(`geolayer/view/${viewSlug}/layersTree/layer/${layerId}`);
  } catch (e) {
    console.warn(`Failed to fetch layer details for layer ${layerId}:`, e); // eslint-disable-line no-console
    return null;
  }
};

const fetchLayerMapboxLayers = async (viewSlug, layerId) => {
  try {
    return await Api.request(`geolayer/view/${viewSlug}/customStyle/layers/${layerId}`);
  } catch (e) {
    console.warn(`Failed to fetch Mapbox layers for layer ${layerId}:`, e); // eslint-disable-line no-console
    return [];
  }
};

const fetchLayerMapboxSources = async (viewSlug, layerId) => {
  try {
    return await Api.request(`geolayer/view/${viewSlug}/customStyle/source/${layerId}`);
  } catch (e) {
    console.warn(`Failed to fetch Mapbox sources for layer ${layerId}:`, e); // eslint-disable-line no-console
    return [];
  }
};

const extractLayerIds = layersTree => {
  const ids = new Set();
  const traverse = nodes => {
    nodes.forEach(node => {
      if (node.group && node.layers) {
        traverse(node.layers);
      } else if (node.id) {
        ids.add(node.id);
      }
    });
  };
  traverse(layersTree);
  return Array.from(ids);
};

const enrichLayerNode = (node, detailsMap) => {
  if (node.group && node.layers) {
    return {
      ...node,
      layers: node.layers.map(child => enrichLayerNode(child, detailsMap)),
    };
  }

  const details = detailsMap.get(node.id);
  if (!details) {
    return node;
  }

  return {
    ...details,
    ...node,
    content: node.content ?? details.content,
    source_filter: node.source_filter ?? details.source_filter,
    legends: node.legends ?? details.legends,
    variables: node.variables ?? details.variables,
    mainField: node.mainField ?? details.mainField,
    filters: node.filters ?? details.filters,
    source_credit: node.source_credit ?? details.source_credit,
    report_configs: node.report_configs ?? details.report_configs,
    widgets: node.widgets ?? details.widgets,
    compare: node.compare ?? details.compare,
    order: node.order ?? details.order,
  };
};

const rebuildFullConfig = (baseConfig, detailsMap, mapboxLayers, mapboxSources, layersTree) => {
  const config = { ...baseConfig };
  config.layersTree = layersTree.map(node => enrichLayerNode(node, detailsMap));
  config.map = config.map || {};
  config.map.customStyle = config.map.customStyle || {};
  config.map.customStyle.sources = mapboxSources;
  config.map.customStyle.layers = mapboxLayers;
  return config;
};

const deduplicateSources = sourcesArrays => {
  const seen = new Set();
  const result = [];
  sourcesArrays.flat().forEach(source => {
    if (source && source.id && !seen.has(source.id)) {
      seen.add(source.id);
      result.push(source);
    }
  });
  return result;
};

export const fetchViewConfig = memoizee(async viewName => {
  try {
    const baseConfig = await Api.request(`geolayer/view/${viewName}/`);
    const configWithHost = replaceApiHost(baseConfig);
    const { layersTree } = configWithHost;

    const layerIds = extractLayerIds(layersTree);

    const [layerDetailsResults, mapboxLayersResults, mapboxSourcesResults] = await Promise.all([
      Promise.all(layerIds.map(id => fetchLayerDetails(viewName, id))),
      Promise.all(layerIds.map(id => fetchLayerMapboxLayers(viewName, id))),
      Promise.all(layerIds.map(id => fetchLayerMapboxSources(viewName, id))),
    ]);

    const layerDetailsMap = new Map();
    layerIds.forEach((id, index) => {
      const details = layerDetailsResults[index];
      if (details) {
        layerDetailsMap.set(id, replaceApiHost(details));
      }
    });

    const allMapboxLayers = mapboxLayersResults
      .flat()
      .filter(Boolean)
      .map(layer => replaceApiHost(layer));

    const allMapboxSources = deduplicateSources(
      mapboxSourcesResults.map(sources => sources.map(source => replaceApiHost(source))),
    );

    const fullConfig = rebuildFullConfig(
      configWithHost,
      layerDetailsMap,
      allMapboxLayers,
      allMapboxSources,
      layersTree,
    );

    fullConfig.map.customStyle.layers = sortCustomLayers(
      fullConfig.map.customStyle.layers,
      fullConfig.layersTree,
    );

    const { extentType, extents } = normalizeExtents(fullConfig);
    fullConfig.map.extentType = extentType;
    fullConfig.map.extents = extents;

    const { fitBounds } = fullConfig.map;
    const [mainExtent] = extents;

    if (extentType === EXTENT_TYPE_MULTIPLE && mainExtent) {
      fullConfig.map.fitBounds = { ...fitBounds, coordinates: mainExtent.bounds };
    } else if (!fitBounds?.coordinates) {
      fullConfig.map.fitBounds = undefined;
    }

    return fullConfig;
  } catch (e) {
    console.error('Failed to fetch view config:', e); // eslint-disable-line no-console
    return null;
  }
}, { promise: true });

export const fetchAllViews = async (rootPath = '') => {
  try {
    const config = await Api.request('geolayer/scene/?viewer=true');
    const allViews = JSON.parse(JSON.stringify(config.results).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`));
    return allViews.map(({
      name,
      slug,
      custom_icon: customIcon,
    }) => ({
      id: `nav-${slug}`,
      label: name,
      href: rootPath ? `/${rootPath}/${slug}` : `/${slug}`,
      icon: customIcon || defaultIcon,
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return [];
  }
};

export default { fetchViewConfig, fetchAllViews };
