import React from 'react';
import { H5 } from '@blueprintjs/core';

import LayersTreeItem from '../LayersTreeItem';

export const LayersTreeGroup = ({
  title,
  layers,
  private: isPrivate,
  authenticated,
}) => ((!isPrivate || authenticated)
  ? (
    <div className="layers-tree-group">
      <H5>{title}</H5>
      {layers.map(layer => (
        <LayersTreeItem
          key={layer.label}
          layer={layer}
        />
      ))}
    </div>
  )
  : null);

export default LayersTreeGroup;
