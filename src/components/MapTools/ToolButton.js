import { ButtonBase, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { toolButton, toolButtonActive } from './panelStyles';

const ToolButton = React.forwardRef((
  { label, icon, isActive, disabled, onClick, sx, ...props },
  ref,
) => (
  <Tooltip title={label} placement="left">
    <span>
      <ButtonBase
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        sx={{
          ...toolButton,
          ...(isActive ? toolButtonActive : {}),
          ...(disabled ? { opacity: 0.4 } : {}),
          ...sx,
        }}
        {...props}
      >
        {icon}
      </ButtonBase>
    </span>
  </Tooltip>
));

ToolButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  sx: PropTypes.shape({}),
};

ToolButton.defaultProps = {
  isActive: false,
  disabled: false,
  onClick: undefined,
  sx: undefined,
};

export default ToolButton;
