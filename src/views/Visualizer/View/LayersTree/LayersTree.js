import React from 'react';

import LayersTreeGroup from './LayersTreeGroup';
import LayersTreeItem from './LayersTreeItem';

import './styles.scss';

export const LayersTree = ({ layersTree }) => (
  <div className="layerstree-panel-list">
    {layersTree.map(layer => (layer.group
      ? (
        <LayersTreeGroup
          key={layer.group}
          title={layer.group}
          {...layer}
        />
      )
      : (
        <LayersTreeItem
          key={layer.label}
          layer={layer}
        />
      )
    ))}
  </div>
);

export default LayersTree;
