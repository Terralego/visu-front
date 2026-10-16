import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const SheetLayout = ({ title, onBack, children, actions }) => (
  <Box
    sx={{
      height: '100vh',
      backgroundColor: 'grey.100',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        backgroundColor: 'primary.dark',
        color: 'white',
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        size="small"
      >
        retour à la liste
      </Button>

      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>

      {actions}
    </Box>

    <Box sx={{ p: 3, width: '100%', flex: 1, overflow: 'auto' }}>
      {children}
    </Box>
  </Box>
);

SheetLayout.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
};

SheetLayout.defaultProps = {
  actions: null,
};

export default SheetLayout;
