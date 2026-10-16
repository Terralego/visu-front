import { connectView } from '../context';
import Table from './Table';

export default connectView(({ 
  layersTreeState, 
  query, 
  map, 
  visibleBoundingBox, 
  setLayerState,
}) => ({
  query,
  map,
  visibleBoundingBox,
  setLayerState,
  displayedLayer: Array
    .from(layersTreeState)
    .filter(([, { table }]) => table)
    .map(([layer, state]) => ({ ...layer, state, layerRef: layer }))[0],
}))(Table);
