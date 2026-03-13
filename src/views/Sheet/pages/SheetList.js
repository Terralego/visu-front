import React, { useEffect, useState, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import bodybuilder from 'bodybuilder';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Button,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import Api from '@terralego/core/modules/Api';
import useEsClient from '../utils/useEsClient';
import { hideSplashScreen, getEsIndexFromBlocks } from '../utils/sheetUtils';
import { SheetLoading, SheetError, SheetInfo } from '../layouts/SheetLoadingStates';
import { CHART_COLORS } from '../../../mui-theme';

const MAX_COMPARE = 3;

const SheetList = () => {
  const { sheetId } = useParams();
  const history = useHistory();
  const esClient = useEsClient();

  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [sheetConfig, setSheetConfig] = useState(null);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState({ field: null, order: 'asc' });

  const selectedSheetIds = useMemo(() => selectedItems.map(item => item.id), [selectedItems]);
  useEffect(() => {
    hideSplashScreen();
  }, []);

  useEffect(() => {
    const fetchSheetConfig = async () => {
      if (!sheetId) {
        setError('ID de fiche manquant');
        setLoading(false);
        return;
      }

      try {
        const response = await Api.request('feature_sheet');
        if (response.results?.length > 0) {
          const config = response.results.find(
            sheet => String(sheet.id) === String(sheetId),
          );
          if (config) {
            setSheetConfig(config);
          } else {
            setError(`Configuration de fiche non trouvée pour l'ID ${sheetId}`);
          }
        } else {
          setError('Aucune configuration de fiche disponible');
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de la configuration');
      }
    };

    fetchSheetConfig();
  }, [sheetId]);

  const { esSource, listFields, uniqueIdentifier } = useMemo(() => {
    if (!sheetConfig?.list_fields?.length) {
      return { esSource: null, listFields: [], uniqueIdentifier: null };
    }

    const listFieldsToUse = sheetConfig.list_fields;
    const source = listFieldsToUse[0]?.source || getEsIndexFromBlocks(sheetConfig.blocks);
    const uniqueId = sheetConfig.unique_identifier;

    return {
      esSource: source,
      listFields: listFieldsToUse,
      uniqueIdentifier: uniqueId,
    };
  }, [sheetConfig]);

  useEffect(() => {
    if (!esSource || !uniqueIdentifier) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (isInitialLoad) {
        setLoading(true);
      }

      try {
        const fieldsToFetch = [uniqueIdentifier, ...listFields.map(f => f.field)];

        const sortField = sorting.field || uniqueIdentifier;
        const sortFieldConfig = listFields.find(f => f.field === sortField);
        const isNumericField = sortFieldConfig?.type === 'number';
        const sortFieldKey = isNumericField ? sortField : `${sortField}.keyword`;
        const sortOption = [{
          [sortFieldKey]: {
            order: sorting.order || 'asc',
            unmapped_type: isNumericField ? 'long' : 'keyword',
          },
        }];

        let query = bodybuilder()
          .size(pagination.pageSize)
          .rawOption('from', pagination.pageIndex * pagination.pageSize)
          .rawOption('_source', fieldsToFetch)
          .rawOption('sort', sortOption);

        if (searchQuery.trim()) {
          const nameField = listFields[1]?.field;
          if (nameField) {
            query = query.query('query_string', {
              query: `*${searchQuery.trim()}*`,
              fields: [nameField],
              default_operator: 'AND',
            });
          }
        }

        const response = await esClient.search({
          index: esSource,
          body: query.build(),
        });

        if (response.hits) {
          setTotalCount(
            typeof response.hits.total === 'object'
              ? response.hits.total.value
              : response.hits.total,
          );
          // eslint-disable-next-line no-underscore-dangle
          setData(response.hits.hits.map(hit => ({ _id: hit._id, ...hit._source })));
        }
      } catch (err) {
        if (isInitialLoad) {
          setError('Erreur lors du chargement des données');
        }
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, [
    esSource, uniqueIdentifier, listFields, esClient,
    pagination, searchQuery, isInitialLoad, sorting,
  ]);

  const columns = useMemo(() => {
    if (!listFields || listFields.length === 0) return [];

    const nameField = listFields[1]?.field;

    const selectColumn = {
      id: 'select',
      size: 50,
      meta: { isSelectColumn: true },
      // eslint-disable-next-line react/no-unstable-nested-components
      header: () => (
        <Checkbox
          checked={false}
          indeterminate={selectedSheetIds.length > 0}
          onChange={() => setSelectedItems([])}
          disabled={selectedSheetIds.length === 0}
          size="small"
          title="Tout désélectionner"
        />
      ),
      // eslint-disable-next-line react/no-unstable-nested-components
      cell: ({ row }) => {
        const rowId = row.original[uniqueIdentifier];
        const isSelected = selectedSheetIds.includes(rowId);
        const canSelect = isSelected || selectedSheetIds.length < MAX_COMPARE;

        return (
          <Checkbox
            checked={isSelected}
            disabled={!canSelect}
            size="small"
            sx={{ pointerEvents: 'none' }}
          />
        );
      },
      getToggleHandler: row => {
        const rowId = row.original[uniqueIdentifier];
        const rowName = row.original[nameField] || rowId;
        const isSelected = selectedSheetIds.includes(rowId);
        const canSelect = isSelected || selectedSheetIds.length < MAX_COMPARE;
        return () => {
          if (isSelected) {
            setSelectedItems(prev => prev.filter(item => item.id !== rowId));
          } else if (canSelect) {
            setSelectedItems(prev => [...prev, { id: rowId, name: rowName }]);
          }
        };
      },
    };

    const dataColumns = listFields.map(field => ({
      accessorKey: field.field,
      header: field.field,
      cell: info => info.getValue() ?? '-',
      enableSorting: true,
    }));

    return [selectColumn, ...dataColumns];
  }, [listFields, selectedSheetIds, uniqueIdentifier]);

  const handleSort = fieldName => {
    setSorting(prev => {
      if (prev.field === fieldName) {
        if (prev.order === 'asc') {
          return { field: fieldName, order: 'desc' };
        }
        return { field: null, order: 'asc' };
      }
      return { field: fieldName, order: 'asc' };
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const handleRowClick = row => {
    const id = row.original[uniqueIdentifier];
    if (id) {
      history.push(`/sheet/${sheetId}/details/${id}`);
    }
  };

  const handleCompare = () => {
    if (selectedSheetIds.length >= 2 && selectedSheetIds.length <= MAX_COMPARE) {
      history.push(`/sheet/${sheetId}/compare?ids=${selectedSheetIds.join(',')}`);
    }
  };

  if (loading && data.length === 0) return <SheetLoading />;
  if (error) return <SheetError message={error} />;

  if (!loading && sheetConfig && (!listFields || listFields.length === 0)) {
    return (
      <SheetInfo message="Aucune configuration de liste trouvée.">
        <br />
        La configuration doit contenir des &quot;list_fields&quot;.
      </SheetInfo>
    );
  }

  if (!listFields || listFields.length === 0) {
    return <SheetLoading />;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: 'grey.100',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'primary.dark',
          color: 'white',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {sheetConfig?.name || 'Liste des fiches'}
        </Typography>

        <Chip
          label={`${totalCount} résultat${totalCount > 1 ? 's' : ''}`}
          size="small"
          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />

        {selectedSheetIds.length >= 2 && selectedSheetIds.length <= MAX_COMPARE && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CompareIcon />}
            onClick={handleCompare}
            size="small"
          >
            Comparer ({selectedSheetIds.length}/{MAX_COMPARE})
          </Button>
        )}
      </Box>

      <Box sx={{
        px: 3,
        py: 2,
        backgroundColor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          minHeight: 32,
        }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            Sélection :
          </Typography>
          {selectedItems.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              Aucune (max {MAX_COMPARE})
            </Typography>
          ) : (
            selectedItems.map((item, index) => {
              const chipColor = CHART_COLORS[index % CHART_COLORS.length];
              return (
                <Chip
                  key={item.id}
                  label={item.name}
                  size="small"
                  sx={{
                    borderColor: chipColor,
                    color: chipColor,
                    '& .MuiChip-deleteIcon': {
                      color: chipColor,
                      '&:hover': { color: chipColor },
                    },
                  }}
                  variant="outlined"
                  avatar={(
                    <Box
                      component="span"
                      sx={{
                        '&&': {
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: chipColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}
                  onDelete={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                  deleteIcon={<CloseIcon fontSize="small" />}
                />
              );
            })
          )}
        </Box>
      </Box>

      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const isSortable = header.column.columnDef.enableSorting;
                      const fieldName = header.column.columnDef.accessorKey;
                      const isCurrentSort = sorting.field === fieldName;
                      const sortDirection = isCurrentSort ? sorting.order : 'asc';
                      const isSelectColumn = header.column.columnDef.meta?.isSelectColumn;

                      return (
                        <TableCell
                          key={header.id}
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: 'grey.100',
                            textTransform: 'capitalize',
                            ...(isSelectColumn && {
                              width: 50,
                              minWidth: 50,
                              maxWidth: 50,
                              textAlign: 'center',
                              p: 0,
                            }),
                          }}
                          sortDirection={isCurrentSort ? sorting.order : false}
                        >
                          {(() => {
                            if (header.isPlaceholder) return null;
                            const content = flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            );
                            if (!isSortable) return content;
                            return (
                              <TableSortLabel
                                active={isCurrentSort}
                                direction={sortDirection}
                                onClick={() => handleSort(fieldName)}
                              >
                                {content}
                              </TableSortLabel>
                            );
                          })()}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {loading && isInitialLoad ? (
                  Array.from({ length: pagination.pageSize }).map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={`skeleton-${index}`}>
                      {columns.map((col, colIndex) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableCell key={`skeleton-${index}-${colIndex}`}>
                          <Skeleton variant="text" width={colIndex === 0 ? 24 : '80%'} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <>
                    {table.getRowModel().rows.map(row => {
                      const rowId = row.original[uniqueIdentifier];
                      const isSelected = selectedSheetIds.includes(rowId);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => handleRowClick(row)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'action.selected' : 'inherit',
                          }}
                        >
                          {row.getVisibleCells().map(cell => {
                            const isSelectCell = cell.column.columnDef.meta?.isSelectColumn;
                            const toggleHandler = cell.column.columnDef.getToggleHandler?.(row);
                            return (
                              <TableCell
                                key={cell.id}
                                onClick={isSelectCell ? (e => {
                                  e.stopPropagation();
                                  toggleHandler?.();
                                }) : undefined}
                                sx={isSelectCell ? {
                                  width: 50,
                                  minWidth: 50,
                                  maxWidth: 50,
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  p: 0,
                                } : {
                                  '&:hover': {
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                  },
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          sx={{ textAlign: 'center', py: 4, fontStyle: 'italic' }}
                        >
                          Aucune donnée trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={pagination.pageIndex}
            onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, pageIndex: newPage }))}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={e => {
              setPagination({ pageIndex: 0, pageSize: parseInt(e.target.value, 10) });
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => (
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            )}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default SheetList;
