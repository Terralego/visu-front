import { SvgIcon } from '@mui/material';
import React from 'react';

const CompassIcon = props => (
  <SvgIcon viewBox="0 0 29 29" {...props}>
    <path d="M10.5 14l4-8 4 8h-8z" />
    <path d="M10.5 16l4 8 4-8h-8z" opacity={0.3} />
  </SvgIcon>
);

export default CompassIcon;
