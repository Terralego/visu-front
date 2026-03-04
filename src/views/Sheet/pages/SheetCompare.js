import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useHistory, useParams, Link } from 'react-router-dom';
import Api from '@terralego/core/modules/Api';
import bodybuilder from 'bodybuilder';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import useEsClient from '../utils/useEsClient';
import {
  getEsIndexFromBlocks,
  hideSplashScreen,
  COMPARE_COLORS,
} from '../utils/sheetUtils';
import { SheetLoading, SheetError, SheetInfo } from '../layouts/SheetLoadingStates';

const SheetCompare = () => {
  const { sheetId } = useParams();
  const location = useLocation();
  const history = useHistory();
  const esClient = useEsClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetConfig, setSheetConfig] = useState(null);
  const [sheetsEsData, setSheetsEsData] = useState({});
  const [sheetsTableData, setSheetsTableData] = useState({});
  const [hideEmptyFields, setHideEmptyFields] = useState(false);

  useEffect(() => {
    hideSplashScreen();
  }, []);

  const ids = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const idsParam = params.get('ids');
    return idsParam ? idsParam.split(',').filter(Boolean) : [];
  }, [location.search]);

  useEffect(() => {
    const fetchSheetConfig = async () => {
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

  useEffect(() => {
    if (!sheetConfig || ids.length === 0) {
      setLoading(false);
      return;
    }

    const esIndex = getEsIndexFromBlocks(sheetConfig.blocks);
    const uniqueId = sheetConfig.unique_identifier;
    
    if (!esIndex || !uniqueId) {
      setError('Configuration de la fiche incomplète');
      setLoading(false);
      return;
    }

    const fetchAllEsData = async () => {
      setLoading(true);
      const newSheetsData = {};

      await Promise.all(
        ids.map(async elementId => {
          try {
            const response = await esClient.search({
              index: esIndex,
              body: bodybuilder().filter('term', uniqueId, elementId).size(1).build(),
            });

            if (response.hits?.hits?.length > 0) {
              // eslint-disable-next-line no-underscore-dangle
              newSheetsData[elementId] = response.hits.hits[0]._source;
            }
          } catch (err) {
            // Silent fail
          }
        }),
      );

      setSheetsEsData(newSheetsData);
      setLoading(false);
    };

    fetchAllEsData();
  }, [sheetConfig, ids, esClient]);

  useEffect(() => {
    if (!sheetConfig?.blocks || Object.keys(sheetsEsData).length === 0) return;

    const tableBlocks = sheetConfig.blocks.filter(block => block.type === 'FIELDS_TABLE');
    if (tableBlocks.length === 0) return;

    const fetchAllTableData = async () => {
      const newTableData = {};
      const linkField = sheetConfig.unique_identifier;

      await Promise.all(
        Object.entries(sheetsEsData).map(async ([elementId, esData]) => {
          const linkValue = esData[linkField];
          if (!linkValue) return;

          const tableBlock = tableBlocks[0];
          const tableEsIndex = tableBlock?.fields?.[0]?.field_source;
          if (!tableEsIndex) return;

          try {
            let query = bodybuilder()
              .filter('term', linkField, linkValue)
              .size(tableBlock.limit || 1000);

            if (tableBlock.order_field) {
              query = query.sort(tableBlock.order_field, 'asc');
            }

            const response = await esClient.search({
              index: tableEsIndex,
              body: query.build(),
            });

            // eslint-disable-next-line no-underscore-dangle
            newTableData[elementId] = response.hits?.hits?.map(hit => hit._source) || [];
          } catch (err) {
            newTableData[elementId] = [];
          }
        }),
      );

      setSheetsTableData(newTableData);
    };

    fetchAllTableData();
  }, [sheetConfig, sheetsEsData, esClient]);

  const sheets = useMemo(() => {
    if (!sheetConfig?.blocks) return [];

    return ids
      .filter(id => sheetsEsData[id])
      .map(id => {
        const esData = sheetsEsData[id];
        return {
          id,
          name: esData.nom_officiel || esData.nom_ppal || `Zone ${id}`,
          subtitle: esData.epci || esData.nom_epci || '',
          esData,
          blocks: sheetConfig.blocks.map(block => ({
            ...block,
            fields: block.fields?.map(field => ({
              ...field,
              value: esData[field.field_name],
            })),
          })),
        };
      });
  }, [sheetConfig, ids, sheetsEsData]);

  const getFilteredBlocks = sheet => {
    if (!hideEmptyFields) return sheet.blocks;

    const alwaysVisibleTypes = ['MAP', 'PANORAMAX', 'RADAR_PLOT', 'BAR_PLOT', 'DISTRIB_PLOT', 'BOOLEANS', 'TEXT'];

    return sheet.blocks
      .map(block => {
        if (alwaysVisibleTypes.includes(block.type)) return block;
        if (block.type === 'FIELDS_TABLE') return null;
        if (!block.fields) return block;

        const filteredFields = block.fields.filter(field => {
          const { value } = field;
          if (value === null || value === undefined || value === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        });

        if (filteredFields.length === 0) return null;
        return { ...block, fields: filteredFields };
      })
      .filter(Boolean);
  };

  const handleBack = () => history.push(`/sheet/${sheetId}`);
  const handlePrint = () => window.print();

  const handleRemoveSheet = idToRemove => {
    const newIds = ids.filter(id => id !== idToRemove);
    if (newIds.length > 0) {
      history.replace(`/sheet/${sheetId}/compare?ids=${newIds.join(',')}`);
    } else {
      history.push(`/sheet/${sheetId}`);
    }
  };

  const renderFieldValue = field => {
    const { value } = field;

    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon sx={{ color: 'success.main' }} />
      ) : (
        <CloseIcon sx={{ color: 'grey.400' }} />
      );
    }

    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR');
    }

    return value || <Typography sx={{ fontStyle: 'italic', opacity: 0.4 }}>n/a</Typography>;
  };

  const comparisonData = useMemo(() => {
    if (sheets.length === 0) return [];

    const blocksMap = new Map();

    sheets.forEach(sheet => {
      const blocksToUse = hideEmptyFields ? getFilteredBlocks(sheet) : sheet.blocks;
      blocksToUse?.forEach(block => {
        if (!['FIELDS', 'BOOLEANS'].includes(block.type)) return;

        if (!blocksMap.has(block.title)) {
          blocksMap.set(block.title, {
            title: block.title,
            type: block.type,
            display_title: block.display_title,
            fields: new Map(),
          });
        }

        const blockData = blocksMap.get(block.title);
        block.fields?.forEach(field => {
          if (!blockData.fields.has(field.label)) {
            blockData.fields.set(field.label, {
              label: field.label,
              field_name: field.field_name,
              type: field.type,
            });
          }
        });
      });
    });

    return Array.from(blocksMap.values()).map(block => ({
      ...block,
      fields: Array.from(block.fields.values()),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheets, hideEmptyFields]);

  const getFieldValue = (sheet, blockTitle, fieldLabel) => {
    const block = sheet.blocks?.find(b => b.title === blockTitle);
    if (!block) return null;
    return block.fields?.find(f => f.label === fieldLabel) || null;
  };

  const tableBlocks = useMemo(() => {
    if (!sheetConfig?.blocks) return [];
    return sheetConfig.blocks.filter(block => block.type === 'FIELDS_TABLE');
  }, [sheetConfig]);

  if (loading) return <SheetLoading />;
  if (error) return <SheetError message={error} />;

  if (ids.length === 0) {
    return (
      <SheetInfo message="Aucune fiche sélectionnée pour la comparaison.">
        <br />
        Utilisez le format: /sheet/compare?ids=id1,id2,id3
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          size="small"
        >
          retour à la liste
        </Button>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Comparaison de {sheets.length} fiche{sheets.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      <Box sx={{ p: 3, width: '100%', flex: 1, overflow: 'auto' }}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 0 }}>
              Comparaison
            </Typography>
            <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>
              Imprimer
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControlLabel
              control={(
                <Switch
                  checked={hideEmptyFields}
                  onChange={e => setHideEmptyFields(e.target.checked)}
                />
              )}
              label="Cacher les champs vides"
            />
          </Box>

          <Paper elevation={0} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item sx={{ minWidth: 150 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fiches comparées
                </Typography>
              </Grid>
              {sheets.map(sheet => (
                <Grid item xs key={sheet.id} sx={{ minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link to={`/sheet/${sheetId}/details/${sheet.id}`} style={{ textDecoration: 'none' }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {sheet.name}
                      </Typography>
                    </Link>
                    <IconButton size="small" onClick={() => handleRemoveSheet(sheet.id)} title="Retirer de la comparaison">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {sheet.subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {sheet.subtitle}
                    </Typography>
                  )}
                  <Chip label={`ID: ${sheet.id}`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {comparisonData.map(block => (
            <Paper
              key={block.title}
              elevation={0}
              sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              {block.display_title && (
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
                  <Typography variant="h6" color="primary.main" fontWeight="600">
                    {block.title}
                  </Typography>
                </Box>
              )}
              <TableContainer>
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: 200, backgroundColor: 'grey.50' }}>
                        Champ
                      </TableCell>
                      {sheets.map(sheet => (
                        <TableCell
                          key={sheet.id}
                          sx={{ backgroundColor: 'grey.50', width: `calc((100% - 200px) / ${sheets.length})` }}
                        >
                          {sheet.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {block.fields.map(fieldDef => (
                      <TableRow key={fieldDef.label} hover>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {fieldDef.label}
                        </TableCell>
                        {sheets.map(sheet => {
                          const field = getFieldValue(sheet, block.title, fieldDef.label);
                          return (
                            <TableCell key={sheet.id}>
                              {field ? renderFieldValue(field) : '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}

          {tableBlocks.map(block => (
            <Paper
              key={block.id}
              elevation={0}
              sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
            >
              {block.display_title && (
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
                  <Typography variant="h6" color="primary.main" fontWeight="600">
                    {block.title}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {sheets.map((sheet, idx) => (
                  <Chip
                    key={sheet.id}
                    label={sheet.name}
                    size="small"
                    sx={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length], color: 'white', fontWeight: 500 }}
                  />
                ))}
              </Box>

              <Divider />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.50', width: 40 }}>
                        Fiche
                      </TableCell>
                      {block.fields?.map(field => (
                        <TableCell key={field.id} sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          {field.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sheets.flatMap((sheet, sheetIdx) => {
                      const rows = sheetsTableData[sheet.id] || [];
                      const color = COMPARE_COLORS[sheetIdx % COMPARE_COLORS.length];

                      return rows.map((row, rowIdx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={`${sheet.id}-${rowIdx}`} hover>
                          <TableCell sx={{ borderLeft: `4px solid ${color}`, width: 40 }}>
                            <Chip
                              label={sheet.name.substring(0, 3)}
                              size="small"
                              sx={{ backgroundColor: color, color: 'white', fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                          {block.fields?.map(field => (
                            <TableCell key={field.id}>
                              {row[field.field_name] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ));
                    })}
                    {sheets.every(sheet => (sheetsTableData[sheet.id] || []).length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={(block.fields?.length || 0) + 1}
                          sx={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}
                        >
                          Aucun établissement trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default SheetCompare;
