import { ExpandMoreRounded as ExpandMoreIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  ClickAwayListener,
  Grow,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const HeaderDropdownButton = ({ icon, title, options, disabled, enabled }) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  if (!enabled) return null;

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleClickItem = onClick => {
    setOpen(false);
    onClick();
  };

  return (
    <>
      <Tooltip disableInteractive placement="top" title={title}>
        <Box sx={{ display: 'flex' }}>
          <Button
            disabled={disabled}
            ref={anchorRef}
            sx={{
              minWidth: 0,
              padding: '2px 6px',
              '& .MuiSvgIcon-root': {
                fontSize: '1.3rem',
              },
            }}
            onClick={handleToggle}
            endIcon={(
              <ExpandMoreIcon
                sx={{
                  fontSize: '1.3rem !important',
                }}
              />
            )}
            color="primary"
            size="small"
            variant={open ? 'contained' : 'text'}
          >
            {icon}
          </Button>
        </Box>
      </Tooltip>
      <Popper
        sx={{ zIndex: 91 }}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper variant="outlined">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem dense>
                  {options.map(option => (
                    <MenuItem key={option.title} onClick={() => handleClickItem(option.onClick)}>
                      <ListItemIcon>{option.icon}</ListItemIcon>
                      <ListItemText>{option.title}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

HeaderDropdownButton.defaultProps = {
  disabled: false,
  enabled: true,
};
HeaderDropdownButton.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
  disabled: PropTypes.bool,
  enabled: PropTypes.bool,
};

export default HeaderDropdownButton;
