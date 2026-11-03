import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { DEFAULT_MAP_HEIGHT } from './MapBlock';

const IframeBlock = ({ url, height, title }) => {
  if (!url) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Aucune URL disponible</Typography>
      </Box>
    );
  }

  return (
    <Box
      component="iframe"
      src={url}
      title={title}
      loading="lazy"
      allowFullScreen
      sx={{
        display: 'block',
        width: '100%',
        height: height > 0 ? height : DEFAULT_MAP_HEIGHT,
        border: 0,
        borderRadius: 1,
      }}
    />
  );
};

IframeBlock.propTypes = {
  url: PropTypes.string,
  height: PropTypes.number,
  title: PropTypes.string,
};

IframeBlock.defaultProps = {
  url: '',
  height: null,
  title: '',
};

export default IframeBlock;
