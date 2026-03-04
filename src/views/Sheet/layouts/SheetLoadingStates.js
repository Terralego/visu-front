import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert } from '@mui/material';

export const SheetLoading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: 'grey.100',
    }}
  >
    <CircularProgress />
  </Box>
);

export const SheetError = ({ message }) => (
  <Box sx={{ p: 4, backgroundColor: 'grey.100', height: '100vh', width: '100%' }}>
    <Alert severity="error">{message}</Alert>
  </Box>
);

SheetError.propTypes = {
  message: PropTypes.string.isRequired,
};

export const SheetWarning = ({ message }) => (
  <Box sx={{ p: 4, backgroundColor: 'grey.100', height: '100vh', width: '100%' }}>
    <Alert severity="warning">{message}</Alert>
  </Box>
);

SheetWarning.propTypes = {
  message: PropTypes.string.isRequired,
};

export const SheetInfo = ({ message, children }) => (
  <Box sx={{ p: 4, backgroundColor: 'grey.100', height: '100vh', width: '100%' }}>
    <Alert severity="info">
      {message}
      {children}
    </Alert>
  </Box>
);

SheetInfo.propTypes = {
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SheetInfo.defaultProps = {
  children: null,
};
