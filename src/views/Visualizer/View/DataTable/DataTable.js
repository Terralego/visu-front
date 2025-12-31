import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info } from '@mui/icons-material';

import './styles.scss';

const EmptyHeader = () => null;

const SelectionCell = ({ row, rowSelection, onRowSelectionChange }) => {
  const sourceId = row.original?.pinnedSourceId
    ? String(row.original.pinnedSourceId)
    : String(row.id);
  const isPinnedDuplicate = Boolean(row.original && row.original.pinnedSourceId);

  const checked = isPinnedDuplicate
    ? Boolean(rowSelection && rowSelection[sourceId])
    : row.getIsSelected();
  const indeterminate = isPinnedDuplicate ? false : row.getIsSomeSelected();

  const handleChange = () => {
    if (!onRowSelectionChange) return;
    const nextSelection = { ...(rowSelection || {}) };
    if (nextSelection[sourceId]) {
      delete nextSelection[sourceId];
    } else {
      nextSelection[sourceId] = true;
    }
    onRowSelectionChange(nextSelection);
  };

  return (
    <Checkbox
      checked={checked}
      disabled={!onRowSelectionChange}
      indeterminate={indeterminate}
      onChange={handleChange}
      size="small"
      sx={{ padding: '2px' }}
    />
  );
};

SelectionCell.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    getIsSelected: PropTypes.func.isRequired,
    getCanSelect: PropTypes.func.isRequired,
    getIsSomeSelected: PropTypes.func.isRequired,
    getToggleSelectedHandler: PropTypes.func.isRequired,
    original: PropTypes.shape({
      pinnedSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }).isRequired,
  rowSelection: PropTypes.objectOf(PropTypes.bool),
  onRowSelectionChange: PropTypes.func,
};

SelectionCell.defaultProps = {
  rowSelection: {},
  onRowSelectionChange: null,
};

const MiniFicheCell = ({ row, details, onOpenDetails, onHideDetails }) => {
  const sourceId = row.original?.pinnedSourceId
    ? String(row.original.pinnedSourceId)
    : String(row.id);
  const isDetailsRow = details && sourceId === String(details);
  const handleClick = () => {
    if (onOpenDetails && !isDetailsRow) {
      onOpenDetails(sourceId);
    } else if (onHideDetails) {
      onHideDetails();
    }
  };

  return (
    <IconButton sx={{ padding: '2px' }} size="small" onClick={handleClick}>
      {isDetailsRow ? <Info fontSize="small" color="primary" /> : <Info fontSize="small" color="disabled" />}
    </IconButton>
  );
};

MiniFicheCell.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    original: PropTypes.shape({
      pinnedSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }).isRequired,
  details: PropTypes.string,
  onOpenDetails: PropTypes.func,
  onHideDetails: PropTypes.func,
};

MiniFicheCell.defaultProps = {
  details: null,
  onOpenDetails: null,
  onHideDetails: null,
};

const renderDataCell = (info, formatType) => {
  const value = info.getValue();
  if (value == null) return '';

  let displayValue = value;
  switch (formatType) {
    case 'number':
      displayValue = new Intl.NumberFormat().format(value);
      break;
    case 'integer': {
      const asInt = Number.parseInt(value, 10);
      displayValue = Number.isNaN(asInt) ? '' : asInt;
      break;
    }
    case 'date':
      displayValue = new Date(value).toLocaleDateString();
      break;
    default:
      displayValue = value;
  }

  const stringValue = String(displayValue);
  return (
    <Tooltip title={stringValue} enterDelay={500} disableInteractive>
      <Box
        component="span"
        sx={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {stringValue}
      </Box>
    </Tooltip>
  );
};

// eslint-disable-next-line no-unused-vars
const TableRowMemo = React.memo(({ row, isPinned, hasDetails, rowSelection, columnVisibility }) => {
  const baseId = row.original?.pinnedSourceId
    ? String(row.original.pinnedSourceId)
    : String(row.id);
  const isSelected = rowSelection ? Boolean(rowSelection[baseId]) : row.getIsSelected();

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        height: '24px',
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        },
        ...(isPinned && {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
          borderBottom: '2px solid rgba(25, 118, 210, 0.3)',
        }),
      }}
      selected={isSelected}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        const isFirstColumn = cellIndex === 0;
        const isSecondColumn = cellIndex === 1;
        const isSticky = hasDetails ? isFirstColumn || isSecondColumn : isFirstColumn;
        let stickyLeft = 'auto';
        if (isFirstColumn) {
          stickyLeft = 0;
        } else if (isSecondColumn && hasDetails) {
          stickyLeft = '32px';
        }

        return (
          <TableCell
            key={cell.id}
            sx={{
              padding: isFirstColumn ? 0 : '1px 4px',
              fontSize: '0.75rem',
              borderRight: '1px solid rgba(224, 224, 224, 1)',
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              height: '24px',
              width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
              position: isSticky ? 'sticky' : 'relative',
              left: stickyLeft,
              zIndex: isSticky ? 1 : 'auto',
              backgroundColor: isSticky ? '#f5f5f5' : 'transparent',
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
});

TableRowMemo.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    getIsSelected: PropTypes.func.isRequired,
    getVisibleCells: PropTypes.func.isRequired,
    original: PropTypes.shape({
      pinnedSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }).isRequired,
  isPinned: PropTypes.bool,
  hasDetails: PropTypes.bool,
  rowSelection: PropTypes.objectOf(PropTypes.bool),
  columnVisibility: PropTypes.objectOf(PropTypes.bool),
};

TableRowMemo.defaultProps = {
  isPinned: false,
  hasDetails: false,
  rowSelection: {},
  columnVisibility: {},
};

// eslint-disable-next-line no-unused-vars
const TableBodyContent = ({ table, hasDetails, rowSelection, columnVisibility }) => {
  const topPinnedRows = table.getTopRows();
  const centerRows = table.getCenterRows();
  const visibleColumnsCount = table.getVisibleLeafColumns().length;

  return (
    <TableBody>
      {topPinnedRows.map(row => (
        <TableRowMemo
          key={row.id}
          row={row}
          isPinned
          hasDetails={hasDetails}
          rowSelection={rowSelection}
          columnVisibility={columnVisibility}
        />
      ))}
      {topPinnedRows.length > 0 && (
        <TableRow>
          <TableCell
            colSpan={visibleColumnsCount}
            sx={{
              padding: 0,
              borderBottom: '3px solid rgba(25, 118, 210, 0.35)',
            }}
          />
        </TableRow>
      )}
      {centerRows.map(row => (
        <TableRowMemo
          key={row.id}
          row={row}
          isPinned={false}
          hasDetails={hasDetails}
          rowSelection={rowSelection}
          columnVisibility={columnVisibility}
        />
      ))}
    </TableBody>
  );
};

TableBodyContent.propTypes = {
  table: PropTypes.shape({
    getTopRows: PropTypes.func.isRequired,
    getCenterRows: PropTypes.func.isRequired,
    getVisibleLeafColumns: PropTypes.func.isRequired,
  }).isRequired,
  hasDetails: PropTypes.bool,
  rowSelection: PropTypes.objectOf(PropTypes.bool),
  columnVisibility: PropTypes.objectOf(PropTypes.bool),
};

TableBodyContent.defaultProps = {
  hasDetails: false,
  rowSelection: {},
  columnVisibility: {},
};

const MemoTableBodyContent = React.memo(
  TableBodyContent,
  (prev, next) =>
    prev.table.options.data === next.table.options.data &&
    prev.rowSelection === next.rowSelection &&
    prev.columnVisibility === next.columnVisibility,
);

const DataTable = ({
  columns: blueprintColumns,
  rows: data,
  loading,
  rowSelection,
  onRowSelectionChange,
  pageSize,
  hasDetails,
  onOpenDetails,
  onHideDetails,
  details,
  rowCache,
  columnVisibility,
  onColumnVisibilityChange,
}) => {
  const baseRows = useMemo(() => data || [], [data]);
  const cacheMap = useMemo(() => rowCache || new Map(), [rowCache]);

  const pinnedSourceIds = useMemo(() => {
    const ids = new Set();
    if (rowSelection) {
      Object.keys(rowSelection).forEach(key => {
        if (rowSelection[key]) ids.add(String(key));
      });
    }
    if (details) {
      ids.add(String(details));
    }
    return Array.from(ids);
  }, [rowSelection, details]);

  const currentMap = useMemo(() => {
    const m = new Map();
    baseRows.forEach(row => {
      if (row && row.id !== undefined && row.id !== null) {
        m.set(String(row.id), row);
      }
    });
    return m;
  }, [baseRows]);

  const pinnedRows = useMemo(
    () =>
      pinnedSourceIds
        .map(sourceId => {
          const row = currentMap.get(sourceId) || cacheMap.get(sourceId);
          if (!row) return null;
          return {
            ...row,
            id: `${sourceId}__pinned`,
            pinnedSourceId: sourceId,
          };
        })
        .filter(Boolean),
    [pinnedSourceIds, currentMap, cacheMap],
  );

  const tableData = useMemo(() => [...baseRows, ...pinnedRows], [baseRows, pinnedRows]);

  const validPinnedIds = useMemo(() => pinnedRows.map(row => String(row.id)), [pinnedRows]);

  const renderSelectionCell = useCallback(
    cellInfo => (
      <SelectionCell
        row={cellInfo.row}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
      />
    ),
    [onRowSelectionChange, rowSelection],
  );

  const renderMiniFicheCell = useCallback(
    ({ row }) => (
      <MiniFicheCell
        row={row}
        details={details}
        onOpenDetails={onOpenDetails}
        onHideDetails={onHideDetails}
      />
    ),
    [details, onHideDetails, onOpenDetails],
  );

  const columns = useMemo(() => {
    if (!blueprintColumns || !blueprintColumns.length) return [];

    return [
      {
        id: 'select',
        header: EmptyHeader,
        cell: renderSelectionCell,
        enableSorting: false,
        enableResizing: false,
        size: 32,
        minSize: 32,
        maxSize: 32,
      },
      hasDetails
        ? {
          id: 'minifiche',
          header: EmptyHeader,
          cell: renderMiniFicheCell,
          enableSorting: false,
          enableResizing: false,
          size: 32,
          minSize: 32,
          maxSize: 32,
        }
        : null,
      ...blueprintColumns.map((col, index) => {
        const field = col.value || `col_${index}`;
        const { format_type: formatType, customSortColumn, sortable = true } = col;

        let sortingFn = 'alphanumeric';
        if (customSortColumn) {
          sortingFn = (rowA, rowB) => customSortColumn(rowA.getValue(field), rowB.getValue(field));
        } else if (formatType === 'number' || formatType === 'integer') {
          sortingFn = 'basic';
        }

        return {
          accessorKey: field,
          id: field,
          header: col.label || col.value || `Column ${index}`,
          enableSorting: sortable,
          enableResizing: true,
          minSize: 60,
          size: 150,
          maxSize: 1000,
          sortingFn,
          cell: info => renderDataCell(info, formatType),
        };
      }),
    ].filter(col => col !== null);
  }, [blueprintColumns, hasDetails, renderMiniFicheCell, renderSelectionCell]);

  const table = useReactTable({
    data: tableData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange,
    onColumnVisibilityChange,
    columnResizeMode: 'onChange',
    state: {
      rowSelection,
      columnVisibility: columnVisibility || {},
      rowPinning: { top: validPinnedIds, bottom: [] },
    },
    enableRowSelection: true,
    getRowCanSelect: () => true,
    enableColumnResizing: true,
    enableRowPinning: true,
    keepPinnedRows: true,
    autoResetPageIndex: false,
    autoResetAll: false,
    defaultColumn: {
      size: 200,
    },
    initialState: {
      pagination: {
        pageSize: pageSize || 25,
      },
    },
    getRowId: row => String(row.id),
  });

  const { columnSizingInfo, columnSizing } = table.getState();

  const [columnSizeVars, setColumnSizeVars] = React.useState({});

  useEffect(() => {
    const colSizes = {};
    const headers = table.getFlatHeaders();
    headers.forEach(header => {
      const headerSize = header.getSize();
      const colSize = header.column.getSize();
      if (headerSize && headerSize > 0) {
        colSizes[`--header-${header.id}-size`] = headerSize;
      }
      if (colSize && colSize > 0) {
        colSizes[`--col-${header.column.id}-size`] = colSize;
      }
    });
    if (Object.keys(colSizes).length > 0) {
      setColumnSizeVars(colSizes);
    }
  }, [columnSizingInfo, columnSizing, tableData.length, table, columnVisibility]);

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const paginationState = table.getState().pagination;

  useEffect(() => {
    const maxPageIndex = Math.max(
      Math.ceil(filteredRowCount / paginationState.pageSize) - 1,
      0,
    );
    if (paginationState.pageIndex > maxPageIndex) {
      table.setPageIndex(maxPageIndex);
    }
  }, [filteredRowCount, paginationState.pageIndex, paginationState.pageSize, table]);

  useEffect(() => {
    if (data && data.length > 0 && rowSelection && Object.keys(rowSelection).length > 0) {
      const currentDataIds = new Set(data.map(row => String(row.id)));
      const validSelectedIds = Object.keys(rowSelection).filter(
        id => rowSelection[id] && currentDataIds.has(id),
      );

      if (
        Object.keys(rowSelection).filter(k => rowSelection[k]).length !== validSelectedIds.length
      ) {
        const newSelection = validSelectedIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        onRowSelectionChange(newSelection);
      }
    } else if (!data || data.length === 0) {
      if (rowSelection && Object.keys(rowSelection).length > 0) {
        onRowSelectionChange({});
      }
    }
  }, [data, onRowSelectionChange, rowSelection]);

  if (loading && (!data || data.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      className="data-table-tanstack"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', ...columnSizeVars }}>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const isFirstColumn = headerIndex === 0;
                  const isSecondColumn = headerIndex === 1;
                  const isSticky = hasDetails ? isFirstColumn || isSecondColumn : isFirstColumn;
                  let headerLeft = 'auto';
                  if (isFirstColumn) {
                    headerLeft = 0;
                  } else if (isSecondColumn && hasDetails) {
                    headerLeft = '32px';
                  }

                  const renderHeaderContent = () => {
                    if (header.isPlaceholder) return null;
                    if (header.column.id === 'select' || header.column.id === 'minifiche') {
                      return <Box sx={{ minHeight: '20px' }} />;
                    }

                    return (
                      <Tooltip
                        title={String(header.column.columnDef.header)}
                        enterDelay={500}
                        disableInteractive
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            minHeight: '20px',
                          }}
                        >
                          {header.column.getCanSort() ? (
                            <TableSortLabel
                              active={!!header.column.getIsSorted()}
                              direction={header.column.getIsSorted() || 'asc'}
                              onClick={header.column.getToggleSortingHandler()}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                '& .MuiTableSortLabel-icon': {
                                  fontSize: '0.875rem',
                                  marginLeft: '2px',
                                },
                              }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableSortLabel>
                          ) : (
                            <Box
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  };

                  return (
                    <TableCell
                      key={header.id}
                      sx={{
                        width: `calc(var(--header-${header.id}-size) * 1px)`,
                        position: 'sticky',
                        top: 0,
                        left: headerLeft,
                        zIndex: isSticky ? 4 : 3,
                        padding: isFirstColumn ? 0 : '2px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        backgroundColor: '#f5f5f5',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                      }}
                    >
                      {renderHeaderContent()}
                      {header.column.getCanResize() && (
                        <Box
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            width: '4px',
                            cursor: 'col-resize',
                            userSelect: 'none',
                            touchAction: 'none',
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                            ...(header.column.getIsResizing() && {
                              backgroundColor: 'primary.main',
                              opacity: 1,
                            }),
                          }}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          {table.getState().columnSizingInfo.isResizingColumn ? (
            <MemoTableBodyContent
              table={table}
              hasDetails={hasDetails}
              columnVisibility={columnVisibility}
            />
          ) : (
            <TableBodyContent
              table={table}
              hasDetails={hasDetails}
              columnVisibility={columnVisibility}
            />
          )}
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={baseRows.length}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        rowsPerPage={table.getState().pagination.pageSize}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Éléments par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        sx={{
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          '.MuiTablePagination-toolbar': {
            minHeight: '40px',
            padding: '0 8px',
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.75rem',
            margin: 0,
          },
          '.MuiTablePagination-select': {
            fontSize: '0.75rem',
          },
        }}
      />
    </Box>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
      format_type: PropTypes.string,
      customSortColumn: PropTypes.func,
      sortable: PropTypes.bool,
    }),
  ),
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  loading: PropTypes.bool,
  rowSelection: PropTypes.objectOf(PropTypes.bool),
  onRowSelectionChange: PropTypes.func,
  pageSize: PropTypes.number,
  hasDetails: PropTypes.bool,
  onOpenDetails: PropTypes.func,
  onHideDetails: PropTypes.func,
  details: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowCache: PropTypes.instanceOf(Map),
  columnVisibility: PropTypes.objectOf(PropTypes.bool),
  onColumnVisibilityChange: PropTypes.func,
};

DataTable.defaultProps = {
  columns: [],
  rows: [],
  loading: false,
  rowSelection: {},
  onRowSelectionChange: () => {},
  pageSize: 25,
  hasDetails: false,
  onOpenDetails: () => {},
  onHideDetails: () => {},
  details: null,
  rowCache: null,
  columnVisibility: {},
  onColumnVisibilityChange: () => {},
};

export default DataTable;
