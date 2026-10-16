import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const TableSelectionContext = createContext(null);

export const TableSelectionProvider = ({ children }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [activeLayer, setActiveLayer] = useState(null); // Track which layer's table is open

  // Clear selection
  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Get selected features as array (memoized)
  const selectedFeatures = useMemo(() => {
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(id => ({ _id: id }));
  }, [rowSelection]);

  const value = useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      selectedFeatures,
      clearSelection,
      activeLayer,
      setActiveLayer,
    }),
    [rowSelection, selectedFeatures, clearSelection, activeLayer],
  );

  return <TableSelectionContext.Provider value={value}>{children}</TableSelectionContext.Provider>;
};

TableSelectionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook to use table selection
export const useTableSelection = () => {
  const context = useContext(TableSelectionContext);

  if (!context) {
    throw new Error('useTableSelection must be used within TableSelectionProvider');
  }

  return context;
};
