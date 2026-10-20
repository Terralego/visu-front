import React from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, ButtonBase, Collapse, Stack } from '@mui/material';

import { ColorProvider, useColorSetting } from './blockStyle';
import TypographyBlock from './TypographyBlock';

export const AccordionBlock = ({ block, properties, Blocks }) => {
  const { t: translate } = useTranslation();
  const [open, setOpen] = React.useState(Boolean(block.expanded));
  const [initial, setInitial] = React.useState(block.expanded);
  const setting = useColorSetting(block);
  if (initial !== block.expanded) {
    setInitial(block.expanded);
    setOpen(Boolean(block.expanded));
  }

  return (
    <div>
      <ButtonBase
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-label={translate(open ? 'terralego.visualizer.minisheet.collapse' : 'terralego.visualizer.minisheet.expand')}
        sx={{ display: 'block', position: 'relative', width: '100%', textAlign: 'inherit', borderRadius: 1 }}
      >
        <TypographyBlock block={block} properties={properties} sx={{ pr: 4 }} />
        <Box
          component="span"
          sx={{
            position: 'absolute',
            right: 4,
            top: '50%',
            display: 'flex',
            transition: 'transform 150ms',
            transform: `translateY(-50%)${open ? ' rotate(180deg)' : ''}`,
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </Box>
      </ButtonBase>
      <Collapse in={open}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ColorProvider setting={setting}>
            <Blocks blocks={block.children ?? []} properties={properties} />
          </ColorProvider>
        </Stack>
      </Collapse>
    </div>
  );
};

export default AccordionBlock;
