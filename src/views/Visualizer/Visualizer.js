import React, { useState, useEffect } from 'react';
import search from '@terralego/core/modules/Visualizer/services/search';
import { connectAuthProvider } from '@terralego/core/modules/Auth';

import { connectState } from '@terralego/core/modules/State/context';

import { fetchViewConfig, loadLayerData } from '../../services/visualizer';
import addSourceFilter from './sourceFilter';
import { sortCustomLayers } from '../../terra-front/modules/Visualizer/services/layersTreeUtils';
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
  const loadedLayers = React.useRef(new Map());

  const loadViewConfig = React.useCallback(async viewLabel => {
    setLoading(true);
    setNotFound(false);
    loadedLayers.current = new Map();

    const viewSettings = await fetchViewConfig(viewLabel);

    if (isUnmount.current) {
      return;
    }

    if (!viewSettings) {
      setNotFound(true);
      return;
    }

    // Deep copy to avoid modification of cached values
    const newViewSettings = JSON.parse(JSON.stringify(viewSettings));

    addSourceFilter({ layers: newViewSettings.layersTree, group: 'root' }, newViewSettings.map.customStyle);

    setViewConfig({
      ...newViewSettings,
      state: {
        layersTreeState: new Map(),
        query: '',
        table: [],
      },
    });

    setLoading(false);
  }, []);

  const onViewStateUpdate = React.useCallback(viewState => {
    setViewConfig(view => ({
      ...view,
      state: {
        ...view.state,
        ...viewState,
      },
    }));
  }, []);

  const applyLayerData = React.useCallback((layer, data, hidden) => {
    if (data.details) {
      const { details } = data;
      Object.keys(details).forEach(key => {
        if (layer[key] === undefined || layer[key] === null) {
          // eslint-disable-next-line no-param-reassign
          layer[key] = details[key];
        }
      });
      // eslint-disable-next-line no-param-reassign
      layer.layers = details.layers ?? layer.layers;
      // eslint-disable-next-line no-param-reassign
      layer.source = details.source ?? layer.source;
      // eslint-disable-next-line no-param-reassign
      layer.fetched = true;
    }

    const styleToAdd = {
      layers: hidden
        ? data.mapboxLayers.map(l => ({
          ...l,
          layout: { ...(l.layout || {}), visibility: 'none' },
        }))
        : data.mapboxLayers,
    };

    addSourceFilter(layer, styleToAdd);

    setViewConfig(prev => {
      if (!prev) return prev;
      const newConfig = { ...prev };
      newConfig.map = { ...prev.map };
      newConfig.map.customStyle = { ...prev.map.customStyle };
      const existingSourceIds = new Set(
        prev.map.customStyle.sources.map(s => s.id),
      );
      newConfig.map.customStyle.sources = [
        ...prev.map.customStyle.sources,
        ...data.mapboxSources.filter(s => !existingSourceIds.has(s.id)),
      ];
      newConfig.map.customStyle.layers = sortCustomLayers(
        [...prev.map.customStyle.layers, ...styleToAdd.layers],
        newConfig.layersTree,
      );
      return newConfig;
    });
  }, []);

  const handleLoadLayerData = React.useCallback((layer, { hidden = false } = {}) => {
    const pending = loadedLayers.current.get(layer.id);
    if (pending) return pending;

    const loadingLayer = loadLayerData(viewName, layer.id)
      .catch(() => ({ details: null, mapboxLayers: [], mapboxSources: [] }))
      .then(data => applyLayerData(layer, data, hidden));

    loadedLayers.current.set(layer.id, loadingLayer);
    return loadingLayer;
  }, [viewName, applyLayerData]);

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
  }, [viewName, authenticated, loadViewConfig]);


  search.host = API_HOST.replace(/api$/, 'elasticsearch');

  if (notfound) return <NotFound />;

  if (loading || !viewConfig) return <Loading />;

  return (
    <View
      key={viewName}
      view={viewConfig}
      onViewStateUpdate={onViewStateUpdate}
      onLoadLayerData={handleLoadLayerData}
      {...props}
    />
  );
};

export default connectState('setCurrentState')(connectAuthProvider('authenticated')(Visualizer));
