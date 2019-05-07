import Api from '@terralego/core/modules/Api';

import analyse from '../config/views/analyse';

import { getEnv } from './env';

const viewsMocks = { analyse };

export const fetchViewConfig = async viewName => {
  const viewMock = viewsMocks[viewName];
  const { API_HOST } = await getEnv();

  if (!viewMock) return null;

  const config = JSON.parse(JSON.stringify(viewMock).replace(/\{\{HOST}}/g, API_HOST));
  const { interactions = [] } = config;
  interactions.forEach(async ({ fetchProperties }) => {
    if (fetchProperties) {
      const { url } = fetchProperties;
      const [, layerName] = url.match(/\/layer\/([a-zA-Z]+)\/feature\//);
      const { id } = await Api.request(`layer/${layerName}/`);
      // Temp workaround while back is not ready to respond to a layername
      // eslint-disable-next-line no-param-reassign
      fetchProperties.url = url.replace(layerName, id);
    }
  });

  return config;
};

export default { fetchViewConfig };
