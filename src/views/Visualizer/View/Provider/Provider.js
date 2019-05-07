import React from 'react';

import context from '../context';
import {
  initLayersStateAction,
  selectSublayerAction,
  setLayerStateAction,
  fetchPropertyValues as fetchPropertyValuesAction,
  fetchPropertyRange as fetchPropertyRangeAction,
} from '../layersTreeUtils';

const { Provider } = context;

export class ViewProvider extends React.Component {
  state = {};

  componentWillUnmount () {
    this.isUnmount = true;
  }

  setMap = map => !this.isUnmount && this.setState({ map });

  setMapState = mapState => {
    const { onViewStateUpdate } = this.props;
    onViewStateUpdate({ map: mapState });
  }

  setLayerState = ({ layer, state }) => {
    const { onViewStateUpdate, view: { state: { layersTreeState } } } = this.props;
    onViewStateUpdate(({
      layersTreeState: setLayerStateAction(layer, state, layersTreeState),
    }));
  }

  getLayerState = ({ layer }) => {
    const { view: { state: { layersTreeState } } } = this.props;
    const layerState = layersTreeState.get(layer);

    return layerState || {};
  }

  selectSublayer = ({ layer, sublayer }) => {
    const { onViewStateUpdate, view: { state: { layersTreeState } } } = this.props;
    onViewStateUpdate(({
      layersTreeState: selectSublayerAction(layer, sublayer, layersTreeState),
    }));
  }

  fetchPropertyValues = async (layer, property) => {
    if (property.values) return;
    const { onViewStateUpdate, view: { state: { layersTreeState } } } = this.props;
    // We need to keep a static reference to this object because it serve as
    // key in layersTreeState
    // eslint-disable-next-line no-param-reassign
    property.values = [];
    onViewStateUpdate(({
      layersTreeState: new Map(layersTreeState),
    }));
    const properties = await fetchPropertyValuesAction(layer, property);
    // eslint-disable-next-line no-param-reassign
    property.values = [...properties];
    const { view: { state: { layersTreeState: newLayersTreeState } } } = this.props;
    onViewStateUpdate(({
      layersTreeState: new Map(newLayersTreeState),
    }));
  }

  fetchPropertyRange = async (layer, property) => {
    if (property.min !== undefined) return;
    const { onViewStateUpdate, view: { state: { layersTreeState } } } = this.props;
    // We need to keep a static reference to this object because it serve as
    // key in layersTreeState
    /* eslint-disable no-param-reassign */
    property.min = 0;
    property.max = 100;
    /* eslint-enable no-param-reassign */
    onViewStateUpdate(({
      layersTreeState: new Map(layersTreeState),
    }));
    const { min = 0, max = 100 } = await fetchPropertyRangeAction(layer, property);
    /* eslint-disable no-param-reassign */
    property.min = min;
    property.max = max;
    /* eslint-enable no-param-reassign */
    const { view: { state: { layersTreeState: newLayersTreeState } } } = this.props;
    onViewStateUpdate(({
      layersTreeState: new Map(newLayersTreeState),
    }));
  }

  initLayersState = () => {
    const { onViewStateUpdate, view: { layersTree, state: { layersTreeState } } } = this.props;
    if (!layersTree) return;
    onViewStateUpdate({
      layersTreeState: layersTreeState.size
        ? layersTreeState
        : initLayersStateAction(layersTree),
    });
  }

  resizingMap = () => {
    const { map } = this.state;
    this.setState({ mapIsResizing: true });
    setTimeout(() => {
      map.resize();
      if (this.isUnmount) return;

      this.setState({ mapIsResizing: false });
    }, 800);
  }

  searchQuery = query => {
    const { onViewStateUpdate } = this.props;
    onViewStateUpdate({ query });
  };

  render () {
    const {
      children,
      view: {
        state: {
          layersTreeState,
          query,
          map: mapState,
        } = {},
      },
    } = this.props;
    const { map, mapIsResizing } = this.state;
    const {
      initLayersState, setLayerState, getLayerState, selectSublayer,
      fetchPropertyValues,
      fetchPropertyRange,
      setMap, resizingMap, setMapState,
      searchQuery,
    } = this;
    const value = {
      layersTreeState,
      initLayersState,
      setLayerState,
      getLayerState,
      selectSublayer,
      query,
      map,
      mapState,
      setMap,
      resizingMap,
      setMapState,
      mapIsResizing,
      fetchPropertyValues,
      fetchPropertyRange,
      searchQuery,
    };
    return (
      <Provider value={value}>
        {children}
      </Provider>
    );
  }
}

export default ViewProvider;
