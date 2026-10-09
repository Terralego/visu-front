import { Box, ButtonBase, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { connectState } from '@terralego/core/modules/State/context';

import { brand, brandIcon, icon as iconStyle, item } from './styles';

const isPlainLink = href => href.startsWith('http') || href.startsWith('#');

const renderIcon = (icon, isBrand) => {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon;
  return <Box component="img" src={icon} alt="" sx={isBrand ? brandIcon : iconStyle} />;
};

export const SidebarItem = ({
  id,
  label,
  icon,
  href,
  exact,
  variant,
  onClick,
  setForceFitBounds,
  sx,
  ...props
}) => {
  const isBrand = variant === 'brand';

  const linkProps = (() => {
    if (!href) return {};
    if (isPlainLink(href)) return { component: 'a', href };
    return { component: NavLink, to: href, exact, activeClassName: 'active' };
  })();

  const handleClick = event => {
    setForceFitBounds(true);
    if (onClick) onClick(event);
  };

  return (
    <Tooltip title={label} placement="right">
      <ButtonBase
        data-link-id={id}
        aria-label={label}
        onClick={handleClick}
        sx={[isBrand ? brand : item, ...(Array.isArray(sx) ? sx : [sx])]}
        {...linkProps}
        {...props}
      >
        {renderIcon(icon, isBrand)}
      </ButtonBase>
    </Tooltip>
  );
};

SidebarItem.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  href: PropTypes.string,
  exact: PropTypes.bool,
  variant: PropTypes.oneOf(['item', 'brand']),
  onClick: PropTypes.func,
  setForceFitBounds: PropTypes.func,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

SidebarItem.defaultProps = {
  id: undefined,
  icon: undefined,
  href: undefined,
  exact: false,
  variant: 'item',
  onClick: undefined,
  setForceFitBounds: () => {},
  sx: undefined,
};

export default connectState('setForceFitBounds')(SidebarItem);
