import React from 'react';

import context from '../context';

const { Provider } = context;

export class ViewProvider extends React.Component {
  state = {
    layersTreeState: new Map(),
  };

  componentWillUnmount () {
    this.isUnmount = true;
  }

  setMap = map => !this.isUnmount && this.setState({ map });

  setMapState = mapState => {
    const { onViewStateUpdate } = this.props;
    onViewStateUpdate({ map: mapState });
  }

  setLayersTreeState = layersTreeState => this.setState({ layersTreeState });

  searchQuery = query => {
    const { onViewStateUpdate } = this.props;
    onViewStateUpdate({ query });
  };

  setVisibleBoundingBox = bbox => this.setState({ bbox })

  render () {
    const {
      children,
      view: {
        state: {
          query,
          map: mapState,
        } = {},
      },
    } = this.props;
    const { map, mapIsResizing, bbox, layersTreeState } = this.state;
    const {
      setLayersTreeState,
      setMap, setMapState,
      setVisibleBoundingBox,
      searchQuery,
    } = this;
    const value = {
      layersTreeState,
      setLayersTreeState,
      query,
      map,
      mapState,
      setMap,
      setMapState,
      mapIsResizing,
      searchQuery,
      setVisibleBoundingBox,
      visibleBoundingBox: bbox,
    };
    return (
      <Provider value={value}>
        {children}
      </Provider>
    );
  }
}

export default ViewProvider;
