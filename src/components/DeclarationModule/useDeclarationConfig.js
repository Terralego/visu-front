import { useEffect, useState } from 'react';

import api from '../../terra-front/modules/Api/services/api';

let request;

const fetchDeclarationConfig = () => {
  if (!request) {
    request = api
      .request('geolayer/declaration/config')
      .then(config => (config?.declaration_fields?.length ? config : null))
      .catch(error => {
        // eslint-disable-next-line no-console
        console.debug('No declaration config available:', error);
        return null;
      });
  }

  return request;
};

const useDeclarationConfig = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchDeclarationConfig().then(value => {
      if (!cancelled) setConfig(value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return config;
};

export default useDeclarationConfig;
