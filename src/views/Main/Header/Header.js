import React, { useState, useEffect } from 'react';

import classnames from 'classnames';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';
import { connectAuthProvider } from '@terralego/core/modules/Auth';
import PropTypes from 'prop-types';

import { fetchAllViews } from '../../../services/visualizer';

import MainMenu from './MainMenu';

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
      label: 'Informations',
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

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className={classnames(
        'main__header',
        { 'main__header--mobile': isMobileSized },
        { 'main__header--mobile--open': isMobileSized && isHeaderOpen },
      )}
      onClick={() => toggleHeader()}
      role="button"
      tabIndex="-1"
    >
      <MainMenu navItems={navItems} isMobileSized={isMobileSized} authenticated={authenticated} />
      {isMobileSized && !isHeaderOpen
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        && <div className="main__header__target" role="button" tabIndex="-1" onClick={() => toggleHeader(false)} />
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
