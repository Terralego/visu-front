import React from 'react';
import { Card, Classes } from '@blueprintjs/core';

import MapNavigationButton from './MapNavigationButton';
import LayersTree from '../LayersTree';
import AppName from '../AppName/AppName';

import './styles.scss';

function getUid () {
  return Math.floor((Date.now() * Math.random())).toString(16);
}

export const MapNavigation = ({
  title,
  children,
  visible,
  toggleLayersTree,
}) => {
  const uid = getUid();
  return (
    <Card
      className={`map-navigation ${Classes.DARK}`}
    >
      <div className="map-navigation__header">
        <AppName />
      </div>
      {title && <h2 className="map-navigation__title">{title}</h2>}
      <div id={`map-navigation__content-${uid}`} className="map-navigation__content">
        {children}
      </div>
      <MapNavigationButton
        onToggle={toggleLayersTree}
        isVisible={visible}
      />
    </Card>
  );
};
MapNavigation.defaultProps = {
  onToggle () {},
  ContentComponent (props) {
    return <LayersTree {...props} />;
  },
};

export default MapNavigation;
