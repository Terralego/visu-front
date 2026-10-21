import React from 'react';
import { Divider } from '@mui/material';

import { getColor, useColorSetting } from './blockStyle';

export const DividerBlock = ({ block }) => {
  const color = getColor(useColorSetting(block));
  return <Divider sx={color ? { borderColor: color } : undefined} />;
};

export default DividerBlock;
