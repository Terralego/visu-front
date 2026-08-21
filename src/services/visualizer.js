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

export const fetchViewConfig = memoizee(async viewName => {
  try {
    const config = await Api.request(`geolayer/view/${viewName}/`);

    // Replace '/api/' part in urls with the API_HOST value to be able to reach the
    // configured backend
    const configWithHost = JSON.parse(JSON.stringify(config).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`));

    const { layersTree, map: { customStyle: { layers } = {} } = {} } = configWithHost;

    configWithHost.map = configWithHost.map || {};
    configWithHost.map.customStyle = configWithHost.map.customStyle || {};
    configWithHost.map.customStyle.layers = sortCustomLayers(layers, layersTree);

    const { extentType, extents } = normalizeExtents(configWithHost);
    configWithHost.map.extentType = extentType;
    configWithHost.map.extents = extents;

    const { fitBounds } = configWithHost.map;
    const [mainExtent] = extents;

    if (extentType === EXTENT_TYPE_MULTIPLE && mainExtent) {
      configWithHost.map.fitBounds = { ...fitBounds, coordinates: mainExtent.bounds };
    } else if (!fitBounds?.coordinates) {
      configWithHost.map.fitBounds = undefined;
    }

    return configWithHost;
  } catch (e) {
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
