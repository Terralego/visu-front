import React from 'react';
import PropTypes from 'prop-types';

import {
  Position,
  Tooltip,
} from '@blueprintjs/core';

import withEnv from '../../../config/withEnv';
import HeaderLink from './HeaderLink';
import HeaderButton from './HeaderButton';

export const NavBarItemDesktop = ({
  id,
  content,
  iconPath,
  classNameIcon,
  env: { VIEW_ROOT_PATH },
  ...item
}) => (
  <Tooltip
    content={item.label}
    position={Position.RIGHT}
    usePortal={false}
  >
    <HeaderLink
      href={(item.href || '').replace('{{VIEW_ROOT_PATH}}', VIEW_ROOT_PATH)}
      onClick={item.onClick}
      data-link-id={id}
    >
      <HeaderButton
        id={id}
        iconPath={iconPath}
        alt={item.label}
        classNameIcon={classNameIcon}
      >
        {item.content}
      </HeaderButton>
    </HeaderLink>
  </Tooltip>
);

NavBarItemDesktop.propTypes = {
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

NavBarItemDesktop.defaultProps = {
  iconPath: '',
  item: {
    href: '',
    label: '',
    onClick () {},
  },
};

export default withEnv(NavBarItemDesktop);
