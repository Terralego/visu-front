import { experimental_extendTheme as extendTheme } from '@mui/material';

const WHITE = '#FFFFFF';
const PRIMARY = '#1C4984';
const SECONDARY = '#EF7720';
const CONTRASTED = PRIMARY;

const rgbChannel = hex =>
  [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(' ');

const cssVar = (name, fallback) => `var(--${name}, ${fallback})`;

const overridable = (name, fallback) => {
  const color = cssVar(name, fallback);
  const channel = cssVar(`${name}-channel`, rgbChannel(fallback));

  return {
    main: color,
    light: color,
    dark: color,
    mainChannel: channel,
    lightChannel: channel,
    darkChannel: channel,
    contrastText: cssVar(`${name}-contrast-text`, WHITE),
    contrastTextChannel: cssVar(`${name}-contrast-text-channel`, rgbChannel(WHITE)),
  };
};

const theme = extendTheme({
  typography: {
    button: {
      textTransform: 'unset',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  colorSchemes: {
    light: {
      palette: {
        primary: overridable('primary', PRIMARY),
        secondary: overridable('secondary', SECONDARY),
        contrasted: overridable('contrasted', CONTRASTED),
      },
    },
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 2px 4px 0 rgb(0 0 0 / 0.06)',
    '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
    '0 3px 5px -1px rgb(0 0 0 / 0.07), 0 1px 3px -1px rgb(0 0 0 / 0.05)',
    '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -1px rgb(0 0 0 / 0.05)',
    '0 5px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.05)',
    '0 6px 10px -2px rgb(0 0 0 / 0.08), 0 3px 5px -2px rgb(0 0 0 / 0.06)',
    '0 8px 12px -3px rgb(0 0 0 / 0.09), 0 3px 6px -2px rgb(0 0 0 / 0.06)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 7px -3px rgb(0 0 0 / 0.07)',
    '0 12px 18px -4px rgb(0 0 0 / 0.11), 0 5px 9px -3px rgb(0 0 0 / 0.08)',
    '0 15px 22px -4px rgb(0 0 0 / 0.12), 0 6px 11px -4px rgb(0 0 0 / 0.09)',
    '0 18px 28px -5px rgb(0 0 0 / 0.13), 0 7px 13px -4px rgb(0 0 0 / 0.1)',
    '0 22px 34px -6px rgb(0 0 0 / 0.14), 0 8px 16px -5px rgb(0 0 0 / 0.11)',
    '0 26px 40px -7px rgb(0 0 0 / 0.15), 0 10px 19px -5px rgb(0 0 0 / 0.12)',
    '0 31px 47px -8px rgb(0 0 0 / 0.16), 0 12px 23px -6px rgb(0 0 0 / 0.13)',
    '0 36px 54px -9px rgb(0 0 0 / 0.17), 0 14px 27px -7px rgb(0 0 0 / 0.14)',
    '0 42px 62px -10px rgb(0 0 0 / 0.18), 0 16px 31px -8px rgb(0 0 0 / 0.15)',
    '0 48px 70px -11px rgb(0 0 0 / 0.2), 0 18px 36px -9px rgb(0 0 0 / 0.16)',
    '0 54px 78px -12px rgb(0 0 0 / 0.21), 0 20px 41px -10px rgb(0 0 0 / 0.17)',
    '0 60px 86px -13px rgb(0 0 0 / 0.22), 0 23px 46px -11px rgb(0 0 0 / 0.18)',
    '0 66px 94px -14px rgb(0 0 0 / 0.23), 0 26px 52px -12px rgb(0 0 0 / 0.19)',
    '0 72px 102px -15px rgb(0 0 0 / 0.24), 0 29px 58px -13px rgb(0 0 0 / 0.2)',
    '0 58px 82px -11px rgb(0 0 0 / 0.26), 0 21px 40px -11px rgb(0 0 0 / 0.22)',
  ],
  components: {
    MuiAccordion: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: 'transparent',
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

export const CHART_COLORS = [
  PRIMARY,
  SECONDARY,
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

export const resolveCssVar = value => {
  if (typeof value !== 'string' || !value.startsWith('var(') || typeof window === 'undefined') {
    return value;
  }
  const inner = value.slice('var('.length, -1);
  const separator = inner.indexOf(',');
  const name = (separator === -1 ? inner : inner.slice(0, separator)).trim();
  const fallback = separator === -1 ? undefined : inner.slice(separator + 1).trim();
  const resolved = window.getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return resolved || (fallback ? resolveCssVar(fallback) : value);
};

const selectionHighlightColor = PRIMARY;

export { selectionHighlightColor };

export default theme;
