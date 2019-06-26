import { Api } from '@terralego/core';

export const fetchViewConfig = async viewName => {
  try {
    const config = await Api.request(`geolayer/view/${viewName}/`);
    const configWithHost = JSON.parse(JSON.stringify(config).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`));

    return configWithHost;
  } catch (e) {
    return null;
  }
};

export default { fetchViewConfig };
