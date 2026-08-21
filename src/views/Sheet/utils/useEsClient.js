import { useMemo } from 'react';
import Api from '@terralego/core/modules/Api';
import elasticsearch from 'elasticsearch';

const useEsClient = () =>
  useMemo(
    () =>
      new elasticsearch.Client({
        host: Api.host.replace(/api$/, 'elasticsearch'),
      }),
    [],
  );

export default useEsClient;
