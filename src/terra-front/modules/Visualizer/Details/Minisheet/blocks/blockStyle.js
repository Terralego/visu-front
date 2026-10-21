import React from 'react';
import { Box } from '@mui/material';

export const InheritedColorContext = React.createContext({});

export const useColorSetting = block => {
  const inherited = React.useContext(InheritedColorContext);
  return block.color === 'inherit' ? inherited : block;
};

export const ColorProvider = ({ setting: { color, customColor }, children }) => {
  const value = React.useMemo(() => ({ color, customColor }), [color, customColor]);
  return <InheritedColorContext.Provider value={value}>{children}</InheritedColorContext.Provider>;
};

export const getColor = ({ color, customColor } = {}) => {
  if (!color) {
    return undefined;
  }
  return color === 'custom' ? customColor || undefined : `${color}.main`;
};

export const resolveColor = (theme, color) => {
  const [key, shade] = color.split('.');
  return theme.palette[key]?.[shade] ?? color;
};

const isImageLink = value => /^(https?:|data:|\/)/i.test(value);

export const BlockIcon = ({ icon }) => {
  const value = icon?.value?.trim();
  if (!value) {
    return null;
  }
  return isImageLink(value)
    ? <Box component="img" src={value} alt="" sx={{ height: '1.2em', maxWidth: '100%', objectFit: 'contain', verticalAlign: 'middle' }} />
    : <Box component="span" aria-hidden>{value}</Box>;
};
