import { connectLayersTree } from '@terralego/core/modules/Visualizer/LayersTree';
import Widgets from './Widgets';

export default connectLayersTree(({ layersTreeState, setLayerState }) => {
  const widgets = Array
    .from(layersTreeState)
    .reduce((prev, [
      { filters: { layer, form } = {} },
      { widgets: layerWidgets = [], filters = {} },
    ]) => [
      ...prev,
      ...(layerWidgets
        .map(layerWidget => ({
          widget: layerWidget,
          filters,
          form,
          layer,
        }))
      ),
    ], []);
  return {
    visible: !!widgets.length,
    widgets,
    setLayerState,
    layersTreeState,
  };
})(Widgets);
