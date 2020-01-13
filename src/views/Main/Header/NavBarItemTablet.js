import React from 'react';
import PropTypes from 'prop-types';

import withEnv from '../../../config/withEnv';
import HeaderLink from './HeaderLink';
import HeaderButton from './HeaderButton';

export const NavBarItemTablet = ({
  id,
  iconPath,
  env: { VIEW_ROOT_PATH },
  ...item
}) => (
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
    />
  </HeaderLink>
);

NavBarItemTablet.propTypes = {
  env: PropTypes.shape({
    VIEW_ROOT_PATH: PropTypes.string,
  }).isRequired,
  id: PropTypes.string.isRequired,
  iconPath: PropTypes.string,
  item: PropTypes.shape({
    href: PropTypes.string,
    label: PropTypes.string,
  }),
};

NavBarItemTablet.defaultProps = {
  iconPath: '',
  item: {
    href: '',
    label: '',
    onClick () {},
  },
};

export default withEnv(NavBarItemTablet);
