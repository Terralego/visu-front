import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';
import classnames from 'classnames';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';

import { fetchAllViews } from '../../../services/visualizer';

import NavBarItemDesktop from './NavBarItemDesktop';
import NavBarItemTablet from './NavBarItemTablet';
import PartnerButton from './PartnerButton';
import logo from '../../../images/terravisu-logo.svg';

import infoSign from '../../../images/info-sign.svg';

import './styles.scss';

const navItemsBase = [
  [
    {
      id: 'welcome',
      label: 'Accueil',
      href: '/',
      iconPath: logo,
      icon: null,
    },
  ], [],
  [{
    id: 'nav-partenaires',
    label: 'Mentions légales',
    iconPath: infoSign,
    component: PartnerButton,
  }],

];

/* eslint-disable react/no-array-index-key */
export const Header = ({
  isHeaderOpen = false,
  toggleHeader = () => { },
  isMobileSized,
}) => {
  const [navItems, setNavItems] = useState([]);
  const containerRef = React.useRef();

  useEffect(() => {
    let isUnmounted = false;

    const loadViewList = async () => {
      /** Load the view list and add it to base menu only if component mounted */
      if (isUnmounted) return;
      const views = await fetchAllViews();
      const newNavItems = JSON.parse(JSON.stringify(navItemsBase));
      newNavItems[0] = newNavItems[0].concat(views);
      setNavItems(newNavItems);
    };

    loadViewList();

    return () => {
      isUnmounted = true;
    };
  }, []);


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
                    {...item}
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

export default withDeviceSize()(Header);
