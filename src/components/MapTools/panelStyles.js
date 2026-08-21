export const frostedContainer = {
  p: 0.5,
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, .8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(0, 0, 0, .1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, .1)',
};

export const surface = {
  overflow: 'hidden',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, .98)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, .08)',
};

export const toolButton = {
  width: 34,
  height: 34,
  color: 'primary.main',
  transition: 'background-color .12s',
  '&:hover': { backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / .08)' },
};

export const toolButtonActive = {
  backgroundColor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover, &:focus, &.Mui-focusVisible': {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
  },
};
