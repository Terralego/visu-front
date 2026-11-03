import { blueberryTwilightPalette } from '@mui/x-charts/colorPalettes';

import { resolveCssVar } from '../../../../../../mui-theme';

export const GRAPH_TYPES = ['bars', 'stacked-bars', 'pie'];
export const GRAPH_ORIENTATIONS = ['vertical', 'horizontal'];

export const graphPalette = (theme, mode = 'light') => [
  resolveCssVar(theme.palette.primary.main),
  resolveCssVar(theme.palette.secondary.main),
  ...blueberryTwilightPalette(mode),
];

export const toPercent = data => {
  const total = data.reduce((sum, { value }) => sum + value, 0);
  return data.map(item => ({ ...item, value: total ? (item.value / total) * 100 : 0 }));
};

export const formatGraphValue = (value, { decimals, percent, unit } = {}) => {
  if (value === null || value === undefined) {
    return null;
  }
  const displayValue = decimals !== undefined && decimals !== null && decimals !== ''
    ? value.toFixed(decimals)
    : value;
  if (percent) {
    return `${displayValue} %`;
  }
  if (unit) {
    return `${displayValue} (${unit})`;
  }
  return displayValue;
};

export const getValueAxisLabel = ({ percent, unit } = {}) => {
  if (percent) {
    return 'Total (%)';
  }
  if (unit) {
    return `Total (${unit})`;
  }
  return 'Total';
};
