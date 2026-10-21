import React from 'react';
import { Typography } from '@mui/material';

import interpolate from '../interpolate';
import { BlockIcon, getColor, useColorSetting } from './blockStyle';

const JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end', justify: 'flex-start' };

export const TypographyBlock = ({ block, properties, sx }) => {
  const { variant = 'body1', text, icon, align = 'left', transform = 'none' } = block;
  const iconAtEnd = icon?.position === 'end';
  const color = getColor(useColorSetting(block));

  return (
    <Typography
      variant={variant}
      sx={{
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY[align],
        gap: 1,
        textAlign: align,
        textTransform: transform,
        whiteSpace: 'pre-line',
        ...sx,
      }}
    >
      {!iconAtEnd && <BlockIcon icon={icon} />}
      <span>{interpolate(text, properties)}</span>
      {iconAtEnd && <BlockIcon icon={icon} />}
    </Typography>
  );
};

export default TypographyBlock;
