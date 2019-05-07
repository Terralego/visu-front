import React from 'react';

import FoldablePanel from '../FoldablePanel';
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

export const Widgets = ({ visible, widgets, ...props }) => (
  <FoldablePanel visible={visible} className="widgets-panel">
    {widgets.map(({ widget, filters }, index) => {
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
  </FoldablePanel>
);

export default Widgets;
