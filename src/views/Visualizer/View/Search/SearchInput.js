import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material';
import React, { useRef } from 'react';


const SearchInput = ({
  query = '',
  minQueryLength = 0,
  onChange,
  onClose,
  onFocus,
  onKeyPress,
  loading,
  translate = key => key,
}) => {
  const inputRef = useRef(null);
  const hasQuery = query.length > 0;

  const clearOrClose = event => {
    if (!hasQuery) {
      onClose(event);
      return;
    }
    onChange({ target: { value: '' } });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 1.75, pr: 1, py: 1.25 }}>
      <SearchIcon sx={{ fontSize: 19, color: 'text.disabled' }} />
      <InputBase
        autoFocus
        inputRef={inputRef}
        value={query}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyPress}
        placeholder={translate('terralego.map.search_control.button_label')}
        inputProps={{ 'aria-label': translate('terralego.map.search_control.button_label') }}
        sx={{ flex: 1, fontSize: '0.95rem' }}
      />
      {hasQuery && query.length < minQueryLength && !loading && (
        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
          {translate('terralego.map.search_control.min_length', { count: minQueryLength })}
        </Typography>
      )}
      {loading && <CircularProgress size={15} thickness={5} sx={{ color: 'text.disabled' }} />}
      <IconButton
        size="small"
        onClick={clearOrClose}
        aria-label={translate(
          hasQuery ? 'terralego.map.search_control.clear' : 'terralego.map.search_control.close',
        )}
        sx={{
          color: 'text.disabled',
          transition: 'color .15s, background-color .15s',
          '&:hover': { color: 'text.primary', backgroundColor: 'rgba(0, 0, 0, .06)' },
        }}
      >
        <CloseIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Box>
  );
};

export default SearchInput;
