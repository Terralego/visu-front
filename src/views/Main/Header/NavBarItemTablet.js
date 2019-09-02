import React from 'react';

import withEnv from '../../../config/withEnv';
import HeaderLink from './HeaderLink';
import HeaderButton from './HeaderButton';

export const NavBarItemTablet = ({ id, content, iconPath, env: { VIEW_ROOT_PATH }, ...item }) => (
  <HeaderLink
    href={(item.href || '').replace('{{VIEW_ROOT_PATH}}', VIEW_ROOT_PATH)}
    onClick={item.onClick}
    data-link-id={id}
  >
    <p className="header-button-label">{item.label}</p>
    <HeaderButton
      id={id}
      iconPath={iconPath}
      alt={item.label}
    >
      {item.content}
    </HeaderButton>
  </HeaderLink>
);

export default withEnv(NavBarItemTablet);
