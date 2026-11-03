import React from 'react';
import { Box, Button } from '@mui/material';

import { interpolateHref } from '../interpolate';
import { BlockIcon, useColorSetting } from './blockStyle';

const customColorStyle = (variant, color) => {
  if (variant === 'contained') {
    return { bgcolor: color, color: theme => theme.palette.getContrastText(color) };
  }
  return { color, ...(variant === 'outlined' && { borderColor: color }) };
};

export const ButtonBlock = ({ block, properties }) => {
  const { label, href, variant = 'contained', icon } = block;
  const { color, customColor } = useColorSetting(block);
  const link = interpolateHref(href, properties);
  const custom = color === 'custom' && customColor;
  const iconElement = icon?.value ? <BlockIcon icon={icon} /> : undefined;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        variant={variant}
        color={color && color !== 'custom' ? color : 'primary'}
        href={link ?? undefined}
        disabled={!link}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={icon?.position !== 'end' ? iconElement : undefined}
        endIcon={icon?.position === 'end' ? iconElement : undefined}
        sx={custom ? customColorStyle(variant, customColor) : undefined}
      >
        {label}
      </Button>
    </Box>
  );
};

export default ButtonBlock;
