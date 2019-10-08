import React from 'react';
import PropTypes from 'prop-types';
import {
  Navbar,
  NavbarGroup,
} from '@blueprintjs/core';
import classnames from 'classnames';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';

import NavBarItemDesktop from './NavBarItemDesktop';
import NavBarItemTablet from './NavBarItemTablet';
import PartnerButton from './PartnerButton';
import logo from '../../../images/AURAN-logo-blanc.svg';
import population from '../../../images/population.png';
import habitat from '../../../images/habitat.png';
import mobilite from '../../../images/mobilite.png';
import economie from '../../../images/economie.png';
import infoSign from '../../../images/info-sign.svg';

import './styles.scss';

const navHeader = [
  [
    {
      id: 'welcome',
      label: 'Accueil',
      href: '/',
      iconPath: logo,
      icon: null,
    },
    {
      id: 'nav-population',
      label: 'Population',
      href: '/{{VIEW_ROOT_PATH}}/population',
      iconPath: population,
      icon: 'icon',
    },
    {
      id: 'nav-habitat',
      label: 'Habitat',
      href: '/{{VIEW_ROOT_PATH}}/habitat',
      iconPath: habitat,
      icon: 'icon',
    },
    {
      id: 'nav-mobilite',
      label: 'Mobilité',
      href: '/{{VIEW_ROOT_PATH}}/mobilite',
      iconPath: mobilite,
      icon: 'icon',
    },
    {
      id: 'nav-economie',
      label: 'Économie',
      href: '/{{VIEW_ROOT_PATH}}/economie',
      iconPath: economie,
      icon: 'icon',
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
export class Header extends React.Component {
  static propTypes = {
    isHeaderOpen: PropTypes.bool,
    toggleHeader: PropTypes.func,
  };

  static defaultProps = {
    isHeaderOpen: false,
    toggleHeader: () => {},
  }

  containerRef = React.createRef();

  componentDidMount () {
    document.body.addEventListener('touchstart', this.listener);
  }

  componentWillUnmount () {
    document.body.removeEventListener('touchstart', this.listener);
  }

  listener = ({ target }) => {
    const { toggleHeader } = this.props;
    if (this.containerRef.current && this.containerRef.current.contains(target)) {
      toggleHeader();
      return;
    }
    toggleHeader(false);
  }


  render () {
    const { isMobileSized, isHeaderOpen } = this.props;
    const { containerRef } = this;

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
            navHeader.map((group, index) => (
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
  }
}
export default withDeviceSize()(Header);
