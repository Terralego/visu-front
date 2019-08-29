import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';
import { fetchViewList } from '../../../services/visualizer';

import NavBarItem from './NavBarItem';
import logo from '../../../images/terravisu-logo.svg';
import infoSign from '../../../images/info-sign.svg';

import './styles.scss';
import { PartnerButton } from './PartnerButton';

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
export const Header = () => {
  const [navItems, setNavItems] = useState([]);

  let isUnmounted = false;
  const loadViewList = async () => {
    /** Load the view list and add it to base menu only if component mounted */
    if (isUnmounted) return;
    const views = await fetchViewList();
    const newNavItems = JSON.parse(JSON.stringify(navItemsBase));
    newNavItems[0] = newNavItems[0].concat(views);
    setNavItems(newNavItems);
  };

  useEffect(() => {
    loadViewList();

    return () => {
      isUnmounted = true;
    };
  }, []);

  return (
    <div className="main__header">
      <Navbar className="navBar bp3-dark">
        {
          navItems.map((group, index) => (
            <NavbarGroup key={index} className="navBar__group">
              {group.map(({ component: Component = NavBarItem, ...item }) => (
                <Component
                  key={item.label}
                  {...item}
                />
              ))}
            </NavbarGroup>
          ))
        }
      </Navbar>
    </div>
  );
};

export default Header;
