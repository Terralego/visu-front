import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';

import repeatTurns, { RepeatTurnContext } from '../repeatTurns';

const GAP = 16;

export const RepeatBlock = ({ block, properties, Blocks }) => {
  const { direction = 'vertical', columns, stretch = false, children = [] } = block;
  const horizontal = direction === 'horizontal';
  const turnSx = horizontal && columns
    ? { width: `calc((100% - ${columns - 1} * ${GAP}px) / ${columns})` }
    : { maxWidth: '100%' };
  const stretchSx = horizontal && stretch ? { '& > :last-child': { flexGrow: 1 } } : {};
  const { i18n: { language: locale } } = useTranslation();
  const turns = repeatTurns(block, properties, locale);
  if (!turns.length || !children.length) {
    return null;
  }

  const items = turns.map(({ item, properties: turnProperties }, index) => (
    <RepeatTurnContext.Provider key={index} value={item}>
      <Stack spacing={1} sx={{ ...turnSx, ...stretchSx }}>
        <Blocks blocks={children} properties={turnProperties} />
      </Stack>
    </RepeatTurnContext.Provider>
  ));

  return horizontal
    ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${GAP}px` }}>{items}</Box>
    : <Stack spacing={1}>{items}</Stack>;
};

export default RepeatBlock;
