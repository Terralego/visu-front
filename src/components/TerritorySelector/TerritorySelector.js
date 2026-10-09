import PublicIcon from '@mui/icons-material/Public';
import { Box, ButtonBase, Popover, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { frostedContainer, surface, toolButton, toolButtonActive } from '../MapTools/panelStyles';
import { ExtentProps } from './extentUtils';

const ExtentIcon = ({ extent: { icon, adaptToTheme }, size }) => {
  if (!icon) return <PublicIcon sx={{ fontSize: size }} />;

  if (adaptToTheme) {
    return (
      <Box
        aria-hidden="true"
        sx={{
          width: size,
          height: size,
          flex: 'none',
          backgroundColor: 'currentColor',
          maskImage: `url(${icon})`,
          WebkitMaskImage: `url(${icon})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={icon}
      alt=""
      sx={{ width: size, height: size, flex: 'none', display: 'block', objectFit: 'contain' }}
    />
  );
};

const TerritorySelector = ({ extents, current, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = !!anchorEl;
  const close = useCallback(() => setAnchorEl(null), []);

  const goToExtent = useCallback(
    extent => {
      close();
      onSelect(extent);
    },
    [close, onSelect],
  );

  return (
    <>
      <Tooltip title={`Territoire : ${current.label}`} placement="left">
        <ButtonBase
          onClick={({ currentTarget }) => setAnchorEl(open ? null : currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Territoire affiché : ${current.label}. Changer de territoire`}
          sx={{ ...toolButton, ...(open ? toolButtonActive : {}) }}
        >
          <ExtentIcon extent={current} size={22} />
        </ButtonBase>
      </Tooltip>

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
            width: 296,
            maxWidth: 'calc(100vw - 2rem)',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={surface}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'rgba(0, 0, 0, .08)',
            }}
          >
            <Typography variant="subtitle2">Territoires</Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0.5,
              p: 1,
              maxHeight: 'min(60vh, 25rem)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            {extents.map(extent => {
              const isCurrent = extent.id === current.id;
              return (
                <ButtonBase
                  key={extent.id}
                  onClick={() => goToExtent(extent)}
                  autoFocus={isCurrent}
                  aria-current={isCurrent ? 'true' : undefined}
                  sx={{
                    flexDirection: 'column',
                    gap: 0.5,
                    px: 0.5,
                    py: 1,
                    borderRadius: '8px',
                    color: 'primary.main',
                    transition: 'background-color .12s, box-shadow .12s',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, .045)' },
                    ...(isCurrent && {
                      backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / .1)',
                      boxShadow:
                        'inset 0 0 0 1.5px rgba(var(--mui-palette-primary-mainChannel) / .55)',
                    }),
                  }}
                >
                  <ExtentIcon extent={extent} size={30} />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.primary', lineHeight: 1.2, textAlign: 'center' }}
                  >
                    {extent.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

ExtentIcon.propTypes = {
  extent: ExtentProps.isRequired,
  size: PropTypes.number.isRequired,
};

TerritorySelector.propTypes = {
  extents: PropTypes.arrayOf(ExtentProps).isRequired,
  current: ExtentProps.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default TerritorySelector;
