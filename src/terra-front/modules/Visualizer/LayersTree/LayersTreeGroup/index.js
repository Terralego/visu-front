import LayersTreeGroup from './LayersTreeGroup';
import { connectLayersTree } from '../LayersTreeProvider/context';
import { getGroupCounters, isGroupHidden, isNodeActive } from './utils';

export default connectLayersTree(({
  getLayerState, setLayerState, translate, layersExtent, isDetailsVisible,
}, {
  layer: { layers },
}) => {
  const { total, active } = getGroupCounters(layers, getLayerState);
  return {
    isHidden: isGroupHidden(layers, getLayerState),
    totalCount: total,
    activeCount: active,
    activeNodes: layers.map(layer => isNodeActive(layer, getLayerState)),
    setLayerState,
    translate,
    layersExtent,
    isDetailsVisible,
  };
})(LayersTreeGroup);
