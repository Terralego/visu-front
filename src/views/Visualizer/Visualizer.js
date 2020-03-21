import React, { useState, useEffect } from 'react';
import search from '@terralego/core/modules/Visualizer/services/search';
import { connectAuthProvider } from '@terralego/core/modules/Auth';

import { fetchViewConfig } from '../../services/visualizer';
import Loading from './Loading';
import View from './View';
import NotFound from './NotFound';

import './styles.scss';

export const Visualizer = ({
  match: { params: { viewName } },
  env: { API_HOST },
  authenticated,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [notfound, setNotFound] = useState(false);
  const [viewConfig, setViewConfig] = useState(null);

  const isUnmount = React.useRef(false);
  isUnmount.current = false;

  const loadViewConfig = async viewLabel => {
    setLoading(true);
    setNotFound(false);

    const viewSettings = await fetchViewConfig(viewLabel);

    if (isUnmount.current) {
      return;
    }

    if (!viewSettings) {
      setNotFound(true);
      return;
    }

    // Deep copy to avoid modification
    const newViewSettings = JSON.parse(JSON.stringify(viewSettings));

    setViewConfig({
      ...newViewSettings,
      state: {
        layersTreeState: new Map(),
        query: '',
        table: [],
      },
    });

    setLoading(false);
  };

  const onViewStateUpdate = viewState => {
    setViewConfig(view => ({
      ...view,
      state: {
        ...view.state,
        ...viewState,
      },
    }));
  };

  // Cleanup function to cancel effects
  useEffect(() => () => { isUnmount.current = true; }, []);

  useEffect(() => {
    fetchViewConfig.clear();
  }, [authenticated]);

  useEffect(() => {
    loadViewConfig(viewName);
  }, [viewName, authenticated]);


  search.host = API_HOST.replace(/api$/, 'elasticsearch');

  if (notfound) return <NotFound />;

  if (loading || !viewConfig) return <Loading />;

  return (
    <View
      key={viewName}
      view={viewConfig}
      onViewStateUpdate={onViewStateUpdate}
      {...props}
    />
  );
};

export default connectAuthProvider('authenticated')(Visualizer);
