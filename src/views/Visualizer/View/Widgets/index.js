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
          filters: {
            ...Object.keys(filters).reduce((all, key) => ({
              ...all,
              ...form.find(({ property }) => property === key).values
                ? {
                  [`${key}.keyword`]: {
                    type: 'term',
                    value: filters[key],
                  },
                }
                : {
                  [key]: filters[key],
                },
            }), {}),
            'layer.keyword': {
              value: layer,
              type: 'term',
            },
          },
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
