import React from 'react';
import classnames from 'classnames';

export const AppName = ({
  component: Component = 'div',
  className,
  title = 'TerraVisu',
  version = 'v1.0',
  ...rest
}) => (
  <Component
    className={classnames(
      'bp5-dark',
      'appName',
      className,
    )}
    {...rest}
  >
    <span className="appName-title">
      { title }
    </span>
    <span className="appName-version">{ version }</span>
  </Component>
);


export default AppName;
