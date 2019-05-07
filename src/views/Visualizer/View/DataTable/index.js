import React from 'react';
import DataTable from './DataTable';
import FoldablePanel from '../FoldablePanel';
import { connectView } from '../context';

export default connectView(({ layersTreeState, query, map, resizingMap }) => ({
  query,
  map,
  resizingMap,
  displayedLayer: Array
    .from(layersTreeState)
    .filter(([, { table }]) => table)
    .map(([layer, state]) => ({ ...layer, state }))[0],
}))(({ displayedLayer, ...props }) => (
  <FoldablePanel
    visible={!!displayedLayer}
    className="data-table"
  >
    <DataTable
      displayedLayer={displayedLayer}
      {...props}
    />
  </FoldablePanel>
));
