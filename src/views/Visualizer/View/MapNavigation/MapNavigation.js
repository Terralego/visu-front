import React from 'react';
import { Button, Card, Classes, Tooltip } from '@blueprintjs/core';

import LayersTree from '../LayersTree';
import './styles.scss';

function getUid () {
  return Math.floor((Date.now() * Math.random())).toString(16);
}

export const MapNavigation = ({
  title,
  onToggle,
  isVisible,
  children,
}) => {
  const uid = getUid();
  return (
    <Card
      className={`map-navigation ${Classes.DARK}`}
    >
      <div className="map-navigation__header">
        {title && <h2 className="map-navigation__title">{title}</h2>}
        <Tooltip
          className="map-navigation__button-container"
          content={isVisible ? 'replier ' : 'déplier'}
        >
          <Button
            className="map-navigation__button"
            onClick={onToggle}
            aria-controls={`map-navigation__content-${uid}`}
            aria-expanded={isVisible}
            icon="arrow-right"
            minimal
          />
        </Tooltip>
      </div>
      <div id={`map-navigation__content-${uid}`} className="map-navigation__content">
        {children}
      </div>
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
