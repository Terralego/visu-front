import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Popover, Box, FormControlLabel, Checkbox, Divider } from '@mui/material';
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
        <Box sx={{ p: 2, minWidth: 250 }}>
          <FormControlLabel
            control={(
              <Checkbox
                checked={toggleState > 0}
                indeterminate={toggleState === null}
                onChange={toggleAll}
              />
            )}
            label={toggleState ? 'Cacher toutes les colonnes' : 'Afficher toutes les colonnes'}
          />
          <Divider sx={{ my: 1 }} />
          {columns.map(({ value, display, label = value }, index) => (
            <Box key={value}>
              <FormControlLabel
                control={<Checkbox checked={display} onChange={handleColumnToggle(index)} />}
                label={label}
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
