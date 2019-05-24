import React from 'react';
import {
  Position,
  Tooltip,
} from '@blueprintjs/core';

import withEnv from '../../../config/withEnv';
import HeaderLink from './HeaderLink';
import HeaderButton from './HeaderButton';

export const NavBarItem = ({ id, content, iconPath, env: { VIEW_ROOT_PATH }, ...item }) => (
  <Tooltip
    content={item.label}
    position={Position.RIGHT}
    usePortal={false}
  >
    <HeaderLink
      href={(item.href || '').replace('{{VIEW_ROOT_PATH}}', VIEW_ROOT_PATH)}
      onClick={item.onClick}
      data-link-id={id}
    >
      <HeaderButton
        id={id}
        iconPath={iconPath}
        alt={item.label}
        icon={item.icon}
      >
        {item.content}
      </HeaderButton>
    </HeaderLink>
  </Tooltip>
);

export default withEnv(NavBarItem);
