import React from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';
import { connectAuthProvider } from '@terralego/core/modules/Auth';
import PropTypes from 'prop-types';


import NavBarItemDesktop from './NavBarItemDesktop';
import NavBarItemTablet from './NavBarItemTablet';

import './styles.scss';

/* eslint-disable react/no-array-index-key */
export const MainMenu = ({
  authenticated,
  isMobileSized,
  navItems,
}) => (
  <Navbar className="navBar bp3-dark">
    {
          navItems.map((group, index) => (
            <NavbarGroup key={index} className="navBar__group">
              {group.map(({ component: Component = isMobileSized
                ? NavBarItemTablet : NavBarItemDesktop, ...item }) => (
                  <Component
                    key={item.label}
                    iconPath={item.iconPath}
                    {...item}
                    authenticated={authenticated}
                  />
              ))}
            </NavbarGroup>
          ))
        }
  </Navbar>
);

MainMenu.propTypes = {
  isMobileSized: PropTypes.bool,
  authenticated: PropTypes.bool,
  navItems: PropTypes.arrayOf(),
};

MainMenu.defaultProps = {
  isMobileSized: false,
  navItems: [],
  authenticated: false,
};

export default withDeviceSize()(connectAuthProvider('authenticated', 'logoutAction')(MainMenu));
