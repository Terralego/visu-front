/* eslint-disable react/require-default-props */
import { QuestionMarkRounded } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const HeaderButton = ({
  active = false,
  disabled = false,
  enabled = true,
  onClick,
  href,
  title,
  titleActive,
  titleDisabled,
  icon = <QuestionMarkRounded />,
  iconActive,
}) => {
  if (!enabled) return null;
  const currentTitle = titleActive && active ? titleActive : title;
  const currentIcon = iconActive && active ? iconActive : icon;
  return (
    <Tooltip placement="top" disableInteractive title={disabled ? titleDisabled : currentTitle}>
      <Box sx={{ display: 'flex' }}>
        <Button
          sx={{
            minWidth: 0,
            padding: '2px 6px',
            '& .MuiSvgIcon-root': {
              fontSize: '1.3rem',
            },
          }}
          color="primary"
          href={href}
          target={href ? '_blank' : undefined}
          disabled={disabled}
          variant={active && !iconActive ? 'contained' : 'text'}
          onClick={onClick}
          size="small"
        >
          {currentIcon}
        </Button>
      </Box>
    </Tooltip>
  );
};

HeaderButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  enabled: PropTypes.bool,
  onClick: PropTypes.func,
  href: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleActive: PropTypes.string,
  titleDisabled: PropTypes.string,
  icon: PropTypes.node,
  iconActive: PropTypes.node,
};

export default HeaderButton;
