import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import formatValue from '../formatValue';
import { RepeatTurnContext } from '../repeatTurns';
import { BlockIcon, getColor, useColorSetting } from './blockStyle';

const CHARACTER_WIDTH = 0.6;
const MIN_HIGHLIGHT_SIZE = '0.875rem';

const highlightSize = (theme, { text, icon }) => {
  const length = icon ? 1 : Math.max(1, text.length);
  return `clamp(${MIN_HIGHLIGHT_SIZE}, calc(100cqi / ${length * CHARACTER_WIDTH}), ${theme.typography.h5.fontSize})`;
};

const Value = ({ value: { text, icon, dimmed }, color, variant = 'body2', align, iconScale = 1, sx }) => (
  <Typography variant={variant} component="span" sx={[{ color, overflowWrap: 'anywhere', textAlign: align }, sx ?? false]}>
    {icon
      ? <Box component="span" sx={{ fontSize: `${iconScale}em`, opacity: dimmed ? 0.3 : 1 }}><BlockIcon icon={{ value: icon }} /></Box>
      : text}
  </Typography>
);

const HIGHLIGHT_ICON_SCALE = 1.6;

export const FieldBlock = ({ block: model, properties }) => {
  const { i18n: { language: locale } } = useTranslation();
  const turn = React.useContext(RepeatTurnContext);
  const block = turn ? { ...model, field: turn.field, label: turn.label, format: turn.format, default: turn.default } : model;
  const value = formatValue(properties[block.field], block, locale);
  const color = getColor(useColorSetting(block));
  if (!value) {
    return null;
  }
  const { label, style = 'simple' } = block;

  if (style === 'highlight') {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'center', containerType: 'inline-size' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Value
            value={value}
            color={color}
            variant="h5"
            align="center"
            iconScale={HIGHLIGHT_ICON_SCALE}
            sx={theme => ({ display: 'block', fontSize: highlightSize(theme, value) })}
          />
        </Box>
        {label && <Typography variant="body2" color="text.secondary" component="div">{label}</Typography>}
      </Box>
    );
  }

  if (style === 'stacked') {
    return (
      <Box>
        {label && <Typography variant="caption" color="text.secondary" component="div">{label}</Typography>}
        <Value value={value} color={color} variant="body1" />
      </Box>
    );
  }

  const spread = style === 'spread';
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, alignItems: 'baseline' }}>
      {label && <Typography variant="body2" sx={{ opacity: 0.65 }}>{label}</Typography>}
      <Value value={value} color={color} align={spread ? 'right' : undefined} sx={spread ? { ml: 'auto' } : undefined} />
    </Box>
  );
};

export default FieldBlock;
