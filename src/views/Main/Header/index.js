import React from 'react';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';

import NavBarItem from './NavBarItem';
import PartnerButton from './PartnerButton';
import logo from '../../../images/blason.svg';
import heatmap from '../../../images/heatmap.svg';
import infoSign from '../../../images/info-sign.svg';

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
      id: 'nav-analyser',
      label: 'Analyser',
      href: '/{{VIEW_ROOT_PATH}}/analyse',
      iconPath: heatmap,
    },
  ], [],
  [{
    id: 'nav-partenaires',
    label: 'Partenaires',
    iconPath: infoSign,
    component: PartnerButton,
  }],
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
