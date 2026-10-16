import { Box, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { frostedContainer, lightContainer, surface } from './panelStyles';

const ToolGroup = ({ children, light }) => {
  const tools = React.Children.toArray(children).filter(Boolean);

  if (!tools.length) return null;

  const content = (
    <Box sx={{
      ...(light ? lightContainer : surface),
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      {tools.map((tool, index) => (
        <React.Fragment key={tool.key}>
          {index > 0 && <Divider />}
          {tool}
        </React.Fragment>
      ))}
    </Box>
  );

  if (light) return content;

  return <Box sx={frostedContainer}>{content}</Box>;
};

ToolGroup.propTypes = {
  children: PropTypes.node,
  light: PropTypes.bool,
};

ToolGroup.defaultProps = {
  children: null,
  light: false,
};

export default ToolGroup;
