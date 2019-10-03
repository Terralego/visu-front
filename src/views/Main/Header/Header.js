import React from 'react';
import PropTypes from 'prop-types';
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
import logo from '../../../images/AURAN-logo-blanc.svg';
import population from '../../../images/population.png';
import habitat from '../../../images/habitat.png';
import mobilite from '../../../images/mobilite.png';
import economie from '../../../images/economie.png';
import infoSign from '../../../images/info-sign.svg';

import './styles.scss';

const logos = {
  population,
  habitat,
  economie,
  mobilite,
};

/* eslint-disable react/no-array-index-key */
export class Header extends React.Component {
  static propTypes = {
    isHeaderOpen: PropTypes.bool,
    toggleHeader: PropTypes.func,
  };

  static defaultProps = {
    isHeaderOpen: false,
    toggleHeader: () => {},
  };

  state = {
    navItems: [],
  };

  containerRef = React.createRef();

  componentDidMount () {
    document.body.addEventListener('touchstart', this.listener);
    this.getAllViews();
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
  };

  getAllViews = async () => {
    const allViews = await fetchAllViews();
    const navViews = allViews.map(({
      name,
      slug,
      custom_icon: customIcon,
    }) => ({
      id: `nav-${slug}`,
      label: name,
      href: `/{{VIEW_ROOT_PATH}}/${slug}`,
      // Todo: Remove logos[slug] when terra-admin is able to interact with this app
      iconPath: customIcon || logos[slug],
      icon: 'icon',
    }));

    const navItems = [
      [
        {
          id: 'welcome',
          label: 'Accueil',
          href: '/',
          iconPath: logo,
          icon: null,
        },
        ...navViews,
      ],
      [],
      [{
        id: 'nav-partenaires',
        label: 'Mentions légales',
        iconPath: infoSign,
        component: PartnerButton,
      }],
    ];

    this.setState({
      navItems,
    });
  };


  render () {
    const { isMobileSized, isHeaderOpen } = this.props;
    const { navItems } = this.state;
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
  }
}
export default withDeviceSize()(Header);
