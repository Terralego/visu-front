import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Popover,
  Box,
  FormControlLabel,
  Checkbox,
  Divider,
  Typography,
} from '@mui/material';
import { ViewColumn as ColumnIcon } from '@mui/icons-material';

const getToggleState = columns => {
  // 1 is all checked
  // 0 is none checked
  // null is indeterminate
  const states = columns.reduce((prev, { display }) => {
    if (prev === null) return null;
    if (prev !== undefined && prev !== +display) return null;
    return +display;
  }, undefined);

  return states;
};

const ColumnsSelectorMui = ({ columns, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const toggleState = useMemo(() => getToggleState(columns), [columns]);

  const toggleAll = useCallback(
    event => {
      const { checked } = event.target;
      columns.forEach((col, index) => {
        if (col.display === checked) return;
        onChange({ event: { target: { checked } }, index });
      });
    },
    [columns, onChange],
  );

  const handleColumnToggle = useCallback(
    index => event => {
      onChange({ event, index });
    },
    [onChange],
  );

  const visibleCount = columns.filter(col => col.display !== false).length;

  return (
    <>
      <IconButton onClick={handleClick} color="primary" size="small">
        <ColumnIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ py: 1, px: 1.5, minWidth: 200, maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Checkbox
              checked={toggleState > 0}
              indeterminate={toggleState === null}
              onChange={toggleAll}
              size="small"
              sx={{ p: 0.5 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
              Tout sélectionner
            </Typography>
            <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
              {visibleCount}/{columns.length}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          {columns.map(({ value, display, label = value }, index) => (
            <Box key={value} sx={{ py: 0 }}>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={display !== false}
                    onChange={handleColumnToggle(index)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                )}
                label={<Typography variant="body2">{label}</Typography>}
                sx={{ m: 0, py: 0.25 }}
              />
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

ColumnsSelectorMui.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string,
      display: PropTypes.bool,
    }),
  ).isRequired,
  onChange: PropTypes.func,
};

ColumnsSelectorMui.defaultProps = {
  onChange: () => {},
};

export default ColumnsSelectorMui;
