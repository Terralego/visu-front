import { useMemo } from 'react';
import Api from '@terralego/core/modules/Api';
import { createEsClient } from '../../../services/elasticsearch';

const useEsClient = () =>
  useMemo(
    () =>
      createEsClient({
        host: Api.host.replace(/api$/, 'elasticsearch'),
      }),
    [],
  );

export default useEsClient;
