import LayersIcon from '@mui/icons-material/Layers';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Radio,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import ToolButton from './ToolButton';
import { frostedContainer, surface } from './panelStyles';

const BackgroundTool = ({ styles, interactiveMapInstance, translate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);

  const open = !!anchorEl;
  const close = useCallback(() => setAnchorEl(null), []);

  const openMenu = useCallback(({ currentTarget }) => {
    setSelected(interactiveMapInstance?.state?.selectedBackgroundStyle);
    setAnchorEl(currentTarget);
  }, [interactiveMapInstance]);

  const choose = useCallback(url => {
    setSelected(url);
    interactiveMapInstance.onBackgroundChange(url);
    close();
  }, [close, interactiveMapInstance]);

  if (!styles.length || !interactiveMapInstance) return null;

  return (
    <>
      <ToolButton
        label={translate('terralego.map.backgroundstyles_control.button_label')}
        icon={<LayersIcon sx={{ fontSize: 20 }} />}
        isActive={open}
        onClick={openMenu}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            ...frostedContainer,
            ml: -1.25,
            width: 240,
            maxWidth: 'calc(100vw - 2rem)',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={surface}>
          <Typography variant="subtitle2" sx={{ px: 1.5, py: 1 }}>
            {translate('terralego.map.backgroundstyles_control.button_label')}
          </Typography>

          <List dense disablePadding>
            {styles.map(({ id, label, url }) => (
              <ListItemButton
                key={id || url}
                selected={url === selected}
                onClick={() => choose(url)}
                sx={{ py: 0.25 }}
              >
                <Radio size="small" checked={url === selected} tabIndex={-1} disableRipple />
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};

BackgroundTool.propTypes = {
  styles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    url: PropTypes.string,
  })),
  interactiveMapInstance: PropTypes.shape({
    onBackgroundChange: PropTypes.func.isRequired,
  }),
  translate: PropTypes.func.isRequired,
};

BackgroundTool.defaultProps = {
  styles: [],
  interactiveMapInstance: null,
};

export default BackgroundTool;
