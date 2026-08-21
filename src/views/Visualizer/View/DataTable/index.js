import { connectView } from '../context';
import DataTable from './DataTable';

export default connectView(
  ({ layersTreeState, query, map, visibleBoundingBox, setLayerState }) => ({
    query,
    map,
    visibleBoundingBox,
    setLayerState,
    displayedLayer: Array.from(layersTreeState)
      .filter(([, { table }]) => table)
      .map(([layer, state]) => ({ ...layer, state }))[0],
  }),
)(DataTable);
