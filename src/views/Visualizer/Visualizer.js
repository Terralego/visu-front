import React, { useState, useEffect } from 'react';
import search from '@terralego/core/modules/Visualizer/services/search';
import { connectAuthProvider } from '@terralego/core/modules/Auth';

import { connectState } from '@terralego/core/modules/State/context';

import { fetchViewConfig } from '../../services/visualizer';
import Loading from './Loading';
import View from './View';
import NotFound from './NotFound';

import './styles.scss';

export const Visualizer = ({
  match: { params: { viewName } },
  env: { API_HOST },
  authenticated,
  setCurrentState,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [notfound, setNotFound] = useState(false);
  const [viewConfig, setViewConfig] = useState(null);
  const [prevAuth, setPrevAuth] = useState(null);

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
    // When we login or logout, we want to reset current state
    // but not on initial loading as we want the state from the hash to be conserved
    // So if prevAuth is null, then we are loading the app for the first time.
    // Otherwise, only on auth change, we reset the state.
    if (prevAuth !== null && authenticated !== prevAuth) {
      setCurrentState({ layers: undefined });
    }
    setPrevAuth(authenticated);
  }, [authenticated, prevAuth, setCurrentState]);

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

export default connectState('setCurrentState')(connectAuthProvider('authenticated')(Visualizer));
