import React, { useEffect } from 'react';
import WidgetSynthesis from './WidgetSynthesis';
import { COMPONENT_SYNTHESIS } from './WidgetsTypes';
import WidgetLayout from './WidgetLayout';

const WidgetItem = ({
  widget,
  filters,
  layer,
  form,
  layerLabel,
  index,
  displayedLayers,
  translate,
  layersTreeState,
  setLayerState,
  ...rest
}) => {
  const { component } = widget;

  const displayedLayer = displayedLayers.find(({ label }) => label === layerLabel);

  useEffect(() => {
    if (displayedLayer) return;
    const entry = Array.from(layersTreeState).find(([, { widgets = [] }]) =>
      widgets.includes(widget),
    );
    if (!entry) return;
    const [entryLayer, state] = entry;
    setLayerState({
      layer: entryLayer,
      state: { widgets: state.widgets.filter(w => w !== widget) },
    });
  }, [displayedLayer]); // eslint-disable-line react-hooks/exhaustive-deps

  if (component !== COMPONENT_SYNTHESIS || !displayedLayer) {
    return null;
  }

  const title = translate('terralego.widget.synthesis.title', { layer: layerLabel });

  return (
    <WidgetLayout
      widget={widget}
      title={title}
      layersTreeState={layersTreeState}
      setLayerState={setLayerState}
      {...rest}
    >
      <WidgetSynthesis
        {...widget}
        filters={filters}
        layer={layer}
        form={form}
        displayedLayer={displayedLayer}
      />
    </WidgetLayout>
  );
};

export default WidgetItem;
