import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const FieldLabel = ({ label, description }) => {
  if (description) {
    return (
      <Box
        component="abbr"
        title={description}
        sx={{
          textDecoration: 'underline dotted currentColor',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
          cursor: 'help',
        }}
      >
        {label}
      </Box>
    );
  }
  return label;
};

FieldLabel.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
};

FieldLabel.defaultProps = {
  description: '',
};

export default FieldLabel;
