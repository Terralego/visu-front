import React from 'react';
import { Icon } from '@blueprintjs/core';

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
    const { children, title } = this.props;
    const { hideWidget } = this;

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
