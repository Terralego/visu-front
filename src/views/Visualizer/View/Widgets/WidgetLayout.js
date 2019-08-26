import React from 'react';
import { Icon } from '@blueprintjs/core';

import { COMPONENT_SYNTHESIS } from './WidgetsTypes';

const getTitle = component => {
  switch (component) {
    case COMPONENT_SYNTHESIS:
      return 'Synthèse des espaces d\'activités';
    default:
      return component;
  }
};

export class WidgetLayout extends React.Component {
  hideWidget = () => {
    const { widget, layersTreeState, setLayerState } = this.props;
    const [layer, state] = Array
      .from(layersTreeState)
      .find(([, { widgets = [] }]) => widgets.includes(widget));
    setLayerState({
      layer,
      state: {
        widgets: state.widgets.filter(w => w !== widget),
      },
    });
  }

  render () {
    const { children, widget: { component } } = this.props;
    const { hideWidget } = this;
    const title = getTitle(component);

    return (
      <div className="widget">
        <div className="widget__header">
          <div className="widget__title">
            {title}
          </div>
          <div className="widget__buttons">
            <button
              type="button"
              onClick={hideWidget}
            >
              <Icon icon="cross" />
            </button>
          </div>
        </div>
        <div className="widget__body">
          {children}
        </div>
      </div>
    );
  }
}

export default WidgetLayout;
