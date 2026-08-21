import { Box, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { frostedContainer, surface } from './panelStyles';

const ToolGroup = ({ children }) => {
  const tools = React.Children.toArray(children).filter(Boolean);

  if (!tools.length) return null;

  return (
    <Box sx={frostedContainer}>
      <Box sx={{ ...surface, display: 'flex', flexDirection: 'column' }}>
        {tools.map((tool, index) => (
          <React.Fragment key={tool.key}>
            {index > 0 && <Divider />}
            {tool}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

ToolGroup.propTypes = {
  children: PropTypes.node,
};

ToolGroup.defaultProps = {
  children: null,
};

export default ToolGroup;
