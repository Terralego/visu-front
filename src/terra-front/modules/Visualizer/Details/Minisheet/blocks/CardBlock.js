import React from 'react';
import { Paper, Stack } from '@mui/material';

import { ColorProvider, getColor, resolveColor, useColorSetting } from './blockStyle';

const cardStyle = ({ border, background, accent }, color) => theme => ({
  border: border ? 1 : 'none',
  borderColor: color ?? 'divider',
  ...(accent && { borderLeft: 4, borderLeftColor: color ?? 'info.main' }),
  bgcolor: (background && color && `color-mix(in srgb, ${resolveColor(theme, color)} 8%, transparent)`)
    || (background ? 'action.hover' : 'transparent'),
});

export const CardBlock = ({ block, properties, Blocks }) => {
  const { children = [] } = block;
  const setting = useColorSetting(block);

  return (
    <Paper elevation={0} sx={[{ p: 2, display: 'flex', flexDirection: 'column' }, cardStyle(block, getColor(setting))]}>
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        <ColorProvider setting={setting}>
          <Blocks blocks={children} properties={properties} />
        </ColorProvider>
      </Stack>
    </Paper>
  );
};

export default CardBlock;
