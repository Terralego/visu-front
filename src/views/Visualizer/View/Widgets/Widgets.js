import React from 'react';
import classnames from 'classnames';

import WidgetSynthesis from './WidgetSynthesis';
import { COMPONENT_SYNTHESIS } from './WidgetsTypes';
import WidgetLayout from './WidgetLayout';
import './styles.scss';


const getTitle = (translate, component, layerLabel) => {
  switch (component) {
    case COMPONENT_SYNTHESIS:
      return translate('terralego.widget.synthesis.title', { layer: layerLabel });
    default:
      return translate('terralego.widget.default.title');
  }
};

const getComponent = component => {
  switch (component) {
    case COMPONENT_SYNTHESIS:
      return WidgetSynthesis;
    default:
      return null;
  }
};

const Widgets = ({
  widgets,
  visible,
  translate,
  layersTreeState,
  ...rest
}) => {
  const displayedLayers = React.useMemo(() =>
    (Array.from(layersTreeState, ([k1, k2]) => ({ ...k1, ...k2 }))
      .filter(({ active }) => active) || []),
  [layersTreeState]);

  if (!widgets.length) {
    return null;
  }

  return (
    <div
      className={classnames({
        'widgets-panel': true,
        'widgets-panel--visible': visible,
      })}
    >
      <div className="widgets-panel__container">
        {(widgets).map(({ widget, filters, layer, form, layerLabel }, index) => {
          const { component } = widget;
          const displayedLayer = displayedLayers.find(({ label }) => label === layerLabel);
          const Component = getComponent(component);
          const title = getTitle(translate, component, layerLabel);
          return Component && (
          <WidgetLayout
            key={`${component}${index}`} // eslint-disable-line react/no-array-index-key
            widget={widget}
            title={title}
            {...rest}
          >
            <Component
              {...widget}
              filters={filters}
              layer={layer}
              form={form}
              displayedLayer={displayedLayer}
            />
          </WidgetLayout>
          );
        })}
      </div>
    </div>
  );
};

export default Widgets;
