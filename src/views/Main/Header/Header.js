import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';
import classnames from 'classnames';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';
import { connectAuthProvider } from '@terralego/core/modules/Auth';
import PropTypes from 'prop-types';

import { fetchAllViews } from '../../../services/visualizer';

import NavBarItemDesktop from './NavBarItemDesktop';
import NavBarItemTablet from './NavBarItemTablet';
import LoginButton from './LoginButton';
import PartnerButton from './PartnerButton';

import infoSign from '../../../images/info-sign.svg';
import logIn from '../../../images/log-in.svg';
import logOut from '../../../images/log-out.svg';

import './styles.scss';

const generateMenus = (authenticated, views, { theme: { logo = '', logoUrl = '/' } = {}, extraMenuItems = [] } = {}) => {
  const navItems = [
    [
      {
        id: 'welcome',
        label: 'Accueil',
        href: logoUrl,
        iconPath: logo,
      },
    ],
    extraMenuItems,
    [{
      id: 'nav-partenaires',
      label: 'Mentions légales',
      iconPath: infoSign,
      component: PartnerButton,
    }, {
      id: 'nav-connexion',
      label: authenticated ? 'Déconnexion' : 'Connexion',
      iconPath:  authenticated ? logOut : logIn,
      component: LoginButton,
      classNameIcon: authenticated ? 'icon_out' : 'icon',
    }],
  ];
  navItems[0] = navItems[0].concat(views);
  return navItems;
};

/* eslint-disable react/no-array-index-key */
export const Header = ({
  isHeaderOpen = false,
  toggleHeader = () => { },
  isMobileSized,
  authenticated,
  settings,
}) => {
  const [navItems, setNavItems] = useState([]);
  const containerRef = React.useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadViewList = async () => {
      /** Load the view list and add it to base menu only if component mounted */
      if (!isMounted) return;
      const views = await fetchAllViews();
      setNavItems(generateMenus(authenticated, views, settings));
    };

    loadViewList();

    return () => {
      isMounted = false;
    };
  }, [authenticated, settings]);

  useEffect(() => {
    const listener = ({ target }) => {
      if (containerRef.current && containerRef.current.contains(target)) {
        toggleHeader();
        return;
      }
      toggleHeader(false);
    };

    document.body.addEventListener('click', listener);

    return () => {
      document.body.removeEventListener('click', listener);
    };
  }, [toggleHeader]);

  return (
    <div
      className={classnames(
        'main__header',
        { 'main__header--mobile': isMobileSized },
        { 'main__header--mobile--open': isMobileSized && isHeaderOpen },
      )}
      ref={containerRef}
    >
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
      {isMobileSized && !isHeaderOpen
        && <div ref={containerRef} className="main__header__target" />
      }
    </div>
  );
};

Header.propTypes = {
  isHeaderOpen: PropTypes.bool,
  isMobileSized: PropTypes.bool,
  toggleHeader: PropTypes.func,
  authenticated: PropTypes.bool,
};

Header.defaultProps = {
  isHeaderOpen: false,
  isMobileSized: false,
  toggleHeader: () => {},
  authenticated: false,
};

export default withDeviceSize()(connectAuthProvider('authenticated', 'logoutAction')(Header));
