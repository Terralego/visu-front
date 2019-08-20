import { Api } from '@terralego/core';
import { sortCustomLayers } from '@terralego/core/modules/Visualizer/services/layersTreeUtils';

export const fetchViewConfig = async viewName => {
  try {
    const config = await Api.request(`geolayer/view/${viewName}/`);
    const configWithHost = JSON.parse(JSON.stringify(config).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`));
    const { layersTree, map: { customStyle: { layers } = {} } = {} } = configWithHost;
    configWithHost.map = configWithHost.map || {};
    configWithHost.map.customStyle = configWithHost.map.customStyle || {};
    configWithHost.map.customStyle.layers = sortCustomLayers(layers, layersTree);
    return configWithHost;
  } catch (e) {
    return null;
  }
};

export default { fetchViewConfig };
