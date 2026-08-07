import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {
  Box,
  Experimental_CssVarsProvider as CssVarsProvider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef } from 'react';

import theme from '../../../../mui-theme';

const splitOnMatch = (text, query) => {
  const value = `${text ?? ''}`;
  const needle = `${query ?? ''}`.trim();
  const normalize = string => string.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const haystack = normalize(value);
  const target = normalize(needle);

  if (!target || haystack.length !== value.length) return [{ value, match: false, offset: 0 }];

  const parts = [];
  let cursor = 0;
  let index = haystack.indexOf(target);
  while (index !== -1) {
    if (index > cursor) {
      parts.push({ value: value.slice(cursor, index), match: false, offset: cursor });
    }
    parts.push({ value: value.slice(index, index + target.length), match: true, offset: index });
    cursor = index + target.length;
    index = haystack.indexOf(target, cursor);
  }
  if (cursor < value.length) {
    parts.push({ value: value.slice(cursor), match: false, offset: cursor });
  }
  return parts;
};

const Highlight = ({ text, query }) => (
  <>
    {splitOnMatch(text, query).map(({ value, match, offset }) => (
      <Box
        key={offset}
        component="span"
        sx={match ? { fontWeight: 600, color: 'text.primary' } : undefined}
      >
        {value}
      </Box>
    ))}
  </>
);

const ResultItem = ({ item, isSelected, query, onClick }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (isSelected && ref.current) ref.current.scrollIntoView({ block: 'nearest' });
  }, [isSelected]);

  return (
    <ListItemButton
      ref={ref}
      selected={isSelected}
      onClick={onClick}
      sx={{
        borderRadius: '8px',
        px: 1.5,
        py: 1,
        transition: 'background-color .12s, box-shadow .12s',
        '&:hover': { backgroundColor: 'rgba(0, 0, 0, .045)' },
        '&.Mui-selected, &.Mui-selected:hover': {
          backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / .1)',
          boxShadow: 'inset 0 0 0 1.5px rgba(var(--mui-palette-primary-mainChannel) / .55)',
        },
      }}
    >
      <ListItemText
        primary={<Highlight text={item.label} query={query} />}
        secondary={
          item.matchedField && (
            <>
              {`${item.matchedField} · `}
              <Highlight text={item.matchedValue} query={query} />
            </>
          )
        }
        primaryTypographyProps={{ variant: 'body2' }}
        secondaryTypographyProps={{ variant: 'caption', component: 'span' }}
        sx={{ my: 0 }}
      />
    </ListItemButton>
  );
};

const SearchResults = ({ results = [], onClick, query = '', translate = key => key, selected = -1 }) => (
  <CssVarsProvider theme={theme} disableStyleSheetGeneration>
    <Box sx={{ borderTop: '1px solid', borderColor: 'rgba(0, 0, 0, .08)' }}>
      <Box
        sx={{
          maxHeight: 'min(72vh, 34rem)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          py: 0.5,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 4,
            border: '2px solid transparent',
            backgroundClip: 'content-box',
            backgroundColor: 'rgba(0, 0, 0, .16)',
          },
        }}
      >
        {results.map(({ group, total, error, results: items = [] }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={`${index}-${group}`} sx={{ px: 1, pb: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.75,
                px: 1.5,
                pt: 1,
                pb: 0.5,
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'rgba(255, 255, 255, .98)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                {group}
              </Typography>
              {!!total && (
                <Typography variant="caption" color="text.disabled">
                  {translate('terralego.map.search_results.group_total', { count: total })}
                </Typography>
              )}
            </Box>

            {!items.length && (
              <Typography
                variant="body2"
                color={error ? 'error.main' : 'text.disabled'}
                sx={{ px: 1.5, pb: 0.5 }}
              >
                {translate(
                  error
                    ? 'terralego.map.search_results.error'
                    : 'terralego.map.search_results.no_result',
                )}
              </Typography>
            )}

            {!!items.length && (
              <List dense disablePadding>
                {items.map(item => (
                  <ResultItem
                    key={`${item.label}${item.id}`}
                    item={item}
                    isSelected={selected === item}
                    query={query}
                    onClick={() => onClick(item)}
                  />
                ))}
                {total > items.length && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: 'block', px: 1.5, pt: 0.75 }}
                  >
                    {translate('terralego.map.search_results.more', {
                      count: total - items.length,
                    })}
                  </Typography>
                )}
              </List>
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'rgba(0, 0, 0, .08)',
          backgroundColor: 'rgba(0, 0, 0, .02)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 0.5,
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, .12)',
            backgroundColor: 'common.white',
          }}
        >
          <KeyboardReturnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {translate('terralego.map.search_results.go_to')}
        </Typography>
      </Box>
    </Box>
  </CssVarsProvider>
);

export default SearchResults;
