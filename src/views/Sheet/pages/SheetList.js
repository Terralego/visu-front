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
  Button,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import { CompareArrows as CompareIcon, Search as SearchIcon } from '@mui/icons-material';

import Api from '@terralego/core/modules/Api';
import useEsClient from '../utils/useEsClient';
import { hideSplashScreen, getEsIndexFromBlocks } from '../utils/sheetUtils';
import { SheetLoading, SheetError, SheetInfo } from '../layouts/SheetLoadingStates';

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
  const [selectedSheetIds, setSelectedSheetIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

        let query = bodybuilder()
          .size(pagination.pageSize)
          .rawOption('from', pagination.pageIndex * pagination.pageSize)
          .rawOption('_source', fieldsToFetch)
          .rawOption('sort', [{ [`${uniqueIdentifier}.keyword`]: { order: 'asc' } }]);

        if (searchQuery.trim()) {
          const textFields = listFields.filter(f => f.type !== 'number').map(f => f.field);
          if (textFields.length > 0) {
            query = query.query('query_string', {
              query: `*${searchQuery.trim()}*`,
              fields: textFields,
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
  }, [esSource, uniqueIdentifier, listFields, esClient, pagination, searchQuery, isInitialLoad]);

  const columns = useMemo(() => {
    if (!listFields || listFields.length === 0) return [];

    const selectColumn = {
      id: 'select',
      // eslint-disable-next-line react/no-unstable-nested-components
      header: () => (
        <Checkbox
          checked={false}
          indeterminate={selectedSheetIds.length > 0}
          onChange={() => setSelectedSheetIds([])}
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
            onChange={e => {
              e.stopPropagation();
              if (isSelected) {
                setSelectedSheetIds(prev => prev.filter(id => id !== rowId));
              } else if (canSelect) {
                setSelectedSheetIds(prev => [...prev, rowId]);
              }
            }}
            onClick={e => e.stopPropagation()}
            size="small"
          />
        );
      },
    };

    const dataColumns = listFields.map(field => ({
      accessorKey: field.field,
      header: field.field,
      cell: info => info.getValue() ?? '-',
    }));

    return [selectColumn, ...dataColumns];
  }, [listFields, selectedSheetIds, uniqueIdentifier]);

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

  if (!listFields || listFields.length === 0) {
    return (
      <SheetInfo message="Aucune configuration de liste trouvée.">
        <br />
        La configuration doit contenir des &quot;list_fields&quot;.
      </SheetInfo>
    );
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

      <Box sx={{ px: 3, py: 2, backgroundColor: 'white', borderBottom: 1, borderColor: 'divider' }}>
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
      </Box>

      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell
                        key={header.id}
                        sx={{ fontWeight: 'bold', backgroundColor: 'grey.100', textTransform: 'capitalize' }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
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
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
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
