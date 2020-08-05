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

  const prevAuthenticatedRef = React.useRef();
  useEffect(() => {
    /** dirty-fix of some spaghetti code a bit hard to debug
   *
    * hashstate and layers tree seems to be linked
    * and relying on each other to be updated.
    * The problem was that the ref value for active layers
    * was changed to false when the data from the backend were true.
    * The change could possibly happened in several part of the app
    * & depenceny(i.e @terralego/core).
    *
    * The idea here is to update the hash state with active layers,
    * as soon as the data are received from the back.
    * we are by-passing the entire update flow to prevent the issue.
    * */
    if (viewConfig && authenticated) {
      // map is needed to create a copy of the ref before it is changed somewhere in the app
      const activeLayers = viewConfig.layersTree.map(({ layers }) => (
        layers.reduce((layerIds, { initialState, layers: l }) => (
          initialState.active ? [...layerIds, ...l] : layerIds
        ), [])
      ), []).reduce((activeIds, ids) => [...activeIds, ...ids], []);

      if (authenticated && !prevAuthenticatedRef.current) {
        console.log('just login', activeLayers);
      } else if (authenticated) {
        console.log('auth', activeLayers);
      } else {
        console.log('not auth', activeLayers);
      }
      setCurrentState({ layers: activeLayers });
      prevAuthenticatedRef.current = authenticated;
    }
  }, [setCurrentState, viewConfig, authenticated, prevAuthenticatedRef]);


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
