import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

import interpolate from '../interpolate';

export const AlertBlock = ({ block: { severity = 'info', title, text }, properties }) => {
  const titleText = interpolate(title, properties);

  return (
    <Alert severity={severity} sx={{ whiteSpace: 'pre-line' }}>
      {titleText && <AlertTitle>{titleText}</AlertTitle>}
      {interpolate(text, properties)}
    </Alert>
  );
};

export default AlertBlock;
