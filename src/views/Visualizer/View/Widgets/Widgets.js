import React from 'react';
import classnames from 'classnames';

import WidgetSynthesis from './WidgetSynthesis';
import { COMPONENT_SYNTHESIS } from './WidgetsTypes';
import WidgetLayout from './WidgetLayout';
import './styles.scss';

const getComponent = component => {
  switch (component) {
    case COMPONENT_SYNTHESIS:
      return WidgetSynthesis;
    default:
      return null;
  }
};

export class Widgets extends React.Component {
  state = {
    widgets: [],
  };

  static getDerivedStateFromProps ({ widgets }) {
    /**
     * Keep a backup of widgets to have a beautiful animation with content
     */
    if (!widgets.length) return null;

    return { widgets };
  }

  render () {
    const { visible, ...props } = this.props;
    const { widgets } = this.state;

    return (
      <div
        className={classnames({
          'widgets-panel': true,
          'widgets-panel--visible': visible,
        })}
      >
        <div className="widgets-panel__container">
          {(widgets).map(({ widget, filters }, index) => {
            const { component } = widget;
            const Component = getComponent(component);
            return Component && (
              <WidgetLayout
                key={`${component}${index}`} // eslint-disable-line react/no-array-index-key
                widget={widget}
                {...props}
              >
                <Component {...widget} filters={filters} />
              </WidgetLayout>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Widgets;
