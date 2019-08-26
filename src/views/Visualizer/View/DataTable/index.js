import { connectLayersTree } from '@terralego/core/modules/Visualizer/LayersTree';

import DataTable from './DataTable';

export default connectLayersTree(({ layersTreeState, query, map, visibleBoundingBox }) => ({
  query,
  map,
  visibleBoundingBox,
  displayedLayer: Array
    .from(layersTreeState)
    .filter(([, { table }]) => table)
    .map(([layer, state]) => ({ ...layer, state }))[0],
}))(DataTable);
