import React from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';

import NavBarItem from './NavBarItem';
import logo from '../../../images/logo-auran.svg';
import population from '../../../images/population.png';
import habitat from '../../../images/habitat.png';
import mobilite from '../../../images/mobilite.png';
import economie from '../../../images/economie.png';

import './styles.scss';

const navHeader = [
  [
    {
      id: 'welcome',
      label: 'Accueil',
      href: '/',
      iconPath: logo,
    },
    {
      id: 'nav-population',
      label: 'Population',
      href: '/{{VIEW_ROOT_PATH}}/population',
      iconPath: population,
    },
    {
      id: 'nav-habitat',
      label: 'Habitat',
      href: '/{{VIEW_ROOT_PATH}}/habitat',
      iconPath: habitat,
    },
    {
      id: 'nav-mobilite',
      label: 'Mobilité',
      href: '/{{VIEW_ROOT_PATH}}/mobilite',
      iconPath: mobilite,
    },
    {
      id: 'nav-economie',
      label: 'Économie',
      href: '/{{VIEW_ROOT_PATH}}/economie',
      iconPath: economie,
    },
  ], [],
];

/* eslint-disable react/no-array-index-key */
export const Header = () => (
  <div className="main__header">
    <Navbar className="navBar bp3-dark">
      {
        navHeader.map((group, index) => (
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

export default Header;
