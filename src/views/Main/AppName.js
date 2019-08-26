import React from 'react';
import logo from '../../images/terravisu-logo.png';

export const AppName = () => (
  <div className="bp3-dark appName">
    <span className="appName-title">
      <img
        className="appName-title-logo"
        src={logo}
        alt="TerraVisu"
      />
    </span>
    <span className="appName-version">Version bêta</span>
  </div>
);


export default AppName;
