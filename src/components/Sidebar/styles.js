const onRail = alpha => `rgba(var(--mui-palette-sidebar-contrastTextChannel, 255 255 255) / ${alpha})`;

const FOREGROUND = 'var(--mui-palette-sidebar-contrastText) !important';
const SELECTED_FOREGROUND = 'var(--mui-palette-sidebar-selectedContrastText) !important';
const BACKGROUND = 'var(--mui-palette-sidebar-main) !important';

export const RAIL_WIDTH = 56;

export const rail = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: `0 0 ${RAIL_WIDTH}px`,
  width: RAIL_WIDTH,
  height: '100vh',
  position: 'sticky',
  top: 0,
  py: 1,
  gap: 1,
  zIndex: 100,
  backgroundColor: 'sidebar.main',
  color: 'sidebar.contrastText',
  '@media print': { display: 'none' },
};

const FADE_HEIGHT = 32;

export const scrollArea = {
  position: 'relative',
  flex: '0 1 auto',
  minHeight: 0,
  width: '100%',
  display: 'flex',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
    pointerEvents: 'none',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity .15s',
  },
  '&::before': {
    top: 0,
    background: 'linear-gradient(to bottom, var(--mui-palette-sidebar-main), transparent)',
  },
  '&::after': {
    bottom: 0,
    background: 'linear-gradient(to top, var(--mui-palette-sidebar-main), transparent)',
  },
  '&[data-fade-top="true"]::before': { opacity: 1 },
  '&[data-fade-bottom="true"]::after': { opacity: 1 },
};

const scrollButton = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  width: 32,
  height: 20,
  borderRadius: 10,
  color: BACKGROUND,
  backgroundColor: onRail(0.92),
  boxShadow: '0 2px 6px rgba(0, 0, 0, .25)',
  transition: 'background-color .12s',
  '&:hover': { backgroundColor: onRail(1) },
};

export const scrollUp = { ...scrollButton, top: 2 };

export const scrollDown = { ...scrollButton, bottom: 2 };

export const scrollButtonIcon = { fontSize: 18 };

export const scroller = {
  flex: 1,
  minHeight: 0,
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  py: 1,
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const spacer = {
  flex: '1 1 0',
  minHeight: 8,
};

export const group = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
};

export const item = {
  position: 'relative',
  width: 40,
  height: 40,
  borderRadius: 2,
  color: FOREGROUND,
  flexShrink: 0,
  transition: 'background-color .12s, color .12s',
  '&:hover': { backgroundColor: onRail(0.16) },
  '&.Mui-focusVisible, &:focus-visible': {
    outline: '2px solid',
    outlineColor: 'currentColor',
    outlineOffset: 2,
  },
  '&.active': {
    backgroundColor: 'sidebar.selected',
    color: SELECTED_FOREGROUND,
    '&:hover': { backgroundColor: 'sidebar.selected' },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: -8,
      top: 6,
      bottom: 6,
      width: 3,
      borderRadius: 3,
      backgroundColor: 'sidebar.selected',
    },
  },
};

export const signedIn = {
  backgroundColor: 'sidebar.contrastText',
  color: BACKGROUND,
  '&:hover': { backgroundColor: 'sidebar.contrastText' },
};

export const brand = {
  ...item,
  width: 44,
  height: 44,
  '&.active': { backgroundColor: 'transparent', '&::before': { display: 'none' } },
};

export const icon = {
  width: 22,
  height: 22,
  objectFit: 'contain',
  display: 'block',
};

export const brandIcon = {
  width: 38,
  height: 'auto',
  maxHeight: 38,
  objectFit: 'contain',
  display: 'block',
};

export const skeleton = {
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: onRail(0.18),
  flexShrink: 0,
};
