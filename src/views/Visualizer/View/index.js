import React from 'react';

import { connectView } from './context';
import View from './View';
import ViewProvider from './Provider';

const ConnectedView = connectView(
  'initLayersState',
  'layersTreeState',
  'query',
  'map',
  'setMap',
  'setMapState',
  'resizingMap',
  'mapIsResizing',
  'searchQuery',
)(View);

export default props => (
  <ViewProvider {...props}>
    <ConnectedView {...props} />
  </ViewProvider>
);
