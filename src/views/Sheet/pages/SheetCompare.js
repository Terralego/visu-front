import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import useEsClient from '../utils/useEsClient';
import {
  getEsIndexFromBlocks,
  hideSplashScreen,
} from '../utils/sheetUtils';
import { CHART_COLORS } from '../../../mui-theme';
import { SheetLoading, SheetError, SheetInfo } from '../layouts/SheetLoadingStates';
import MapBlock from '../components/MapBlock';
import PanoramaxBlock from '../components/PanoramaxBlock';
import RadarPlotBlock from '../components/RadarPlotBlock';
import BarPlotBlock from '../components/BarPlotBlock';
import DistribPlotBlock from '../components/DistribPlotBlock';
import { TextBlock } from '../components/SheetBlock';

const printStyles = {
  hideOnPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  blockPrint: {
    '@media print': {
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      mb: 0.5,
      boxShadow: 'none',
      border: 'none',
      borderBottom: '1px solid #ddd',
      borderRadius: 0,
    },
  },
  blockHeaderPrint: {
    '@media print': {
      p: 0.5,
      backgroundColor: 'transparent !important',
      borderBottom: 'none',
    },
  },
  blockTitlePrint: {
    '@media print': {
      fontSize: '12px !important',
      fontWeight: '600 !important',
    },
  },
  tablePrint: {
    '@media print': {
      '& th, & td': {
        border: '1px solid #ddd !important',
        padding: '2px 4px !important',
        fontSize: '9px !important',
      },
    },
  },
  chipPrint: {
    '@media print': {
      height: '14px !important',
      fontSize: '8px !important',
      minWidth: '14px !important',
      '& .MuiChip-label': {
        padding: '0 4px !important',
      },
    },
  },
  forceColors: {
    '@media print': {
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      colorAdjust: 'exact',
    },
  },
};

const blockPaperSx = {
  mb: 3,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  overflow: 'hidden',
  ...printStyles.blockPrint,
};

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
  const [sheetsGeometryData, setSheetsGeometryData] = useState({});
  const [panoramaxEmptyStates, setPanoramaxEmptyStates] = useState({});
  const [hideEmptyFields, setHideEmptyFields] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

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
        tableBlocks.map(async tableBlock => {
          const tableEsIndex = tableBlock?.fields?.[0]?.field_source;
          if (!tableEsIndex) return;

          newTableData[tableBlock.id] = {};

          await Promise.all(
            Object.entries(sheetsEsData).map(async ([elementId, esData]) => {
              const linkValue = esData[linkField];
              if (!linkValue) return;

              try {
                let query = bodybuilder()
                  .filter('term', linkField, linkValue);

                if (tableBlock.limit) {
                  query = query.size(tableBlock.limit);
                } else {
                  query = query.size(10000);
                }

                if (tableBlock.order_field) {
                  query = query.sort(tableBlock.order_field, 'asc');
                }

                const response = await esClient.search({
                  index: tableEsIndex,
                  body: query.build(),
                });

                // eslint-disable-next-line no-underscore-dangle
                const rows = response.hits?.hits?.map(hit => hit._source) || [];
                newTableData[tableBlock.id][elementId] = rows;
              } catch (err) {
                newTableData[tableBlock.id][elementId] = [];
              }
            }),
          );
        }),
      );

      setSheetsTableData(newTableData);
    };

    fetchAllTableData();
  }, [sheetConfig, sheetsEsData, esClient]);

  useEffect(() => {
    if (!sheetConfig?.blocks || Object.keys(sheetsEsData).length === 0) return;

    const geomSources = new Set();
    sheetConfig.blocks.forEach(block => {
      if (block.type === 'MAP') {
        if (block.first_geom_source?.source) {
          geomSources.add(block.first_geom_source.source);
        }
        if (block.second_geom_source?.source) {
          geomSources.add(block.second_geom_source.source);
        }
      }
      if (block.type === 'PANORAMAX' && block.first_geom_source?.source) {
        geomSources.add(block.first_geom_source.source);
      }
    });

    if (geomSources.size === 0) return;

    const linkField = sheetConfig.unique_identifier;

    const fetchAllGeometryData = async () => {
      const newGeomData = {};

      await Promise.all(
        Object.entries(sheetsEsData).map(async ([elementId, esData]) => {
          const linkValue = esData[linkField];
          if (!linkValue) return;

          newGeomData[elementId] = {};

          await Promise.all(
            Array.from(geomSources).map(async source => {
              try {
                const response = await esClient.search({
                  index: source,
                  body: bodybuilder()
                    .filter('term', linkField, linkValue)
                    .size(10000)
                    .build(),
                });

                // eslint-disable-next-line no-underscore-dangle
                newGeomData[elementId][source] = response.hits?.hits?.map(hit => hit._source) || [];
              } catch (err) {
                newGeomData[elementId][source] = [];
              }
            }),
          );
        }),
      );

      setSheetsGeometryData(newGeomData);
    };

    fetchAllGeometryData();
  }, [sheetConfig, sheetsEsData, esClient]);

  const sheets = useMemo(() => {
    if (!sheetConfig?.blocks) return [];

    // todo : change with name field from config when implemented
    const nameField = sheetConfig.list_fields?.[1]?.field;

    return ids
      .filter(id => sheetsEsData[id])
      .map(id => {
        const esData = sheetsEsData[id];
        return {
          id,
          name: (nameField && esData[nameField]) || `Fiche ${id}`,
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
  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 500);
  };

  const handleRemoveSheet = sheetIdToRemove => {
    const newIds = ids.filter(id => id !== sheetIdToRemove);
    if (newIds.length >= 2) {
      history.replace(`/sheet/${sheetId}/compare?ids=${newIds.join(',')}`);
    } else if (newIds.length === 1) {
      history.push(`/sheet/${sheetId}/details/${newIds[0]}`);
    } else {
      history.push(`/sheet/${sheetId}`);
    }
  };

  const handlePanoramaxEmpty = useCallback(sheetItemId => {
    setPanoramaxEmptyStates(prev => ({ ...prev, [sheetItemId]: true }));
  }, []);

  const renderFieldValue = (field, isBooleanBlock = false) => {
    const { value } = field;

    const isBooleanField = isBooleanBlock
      || field.type === 'boolean'
      || field.type === 'BOOLEAN'
      || typeof value === 'boolean';

    if (isBooleanField) {
      const boolValue = value === true || value === 1 || value === '1' || value === 'true' || value === 'Oui' || value === 'oui';

      const pictoUrl = boolValue ? field.picto_true : field.picto_false;
      if (pictoUrl) {
        return (
          <Box
            component="img"
            src={pictoUrl}
            alt={field.label}
            sx={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              '@media print': {
                width: 16,
                height: 16,
              },
            }}
          />
        );
      }

      return (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: boolValue ? 'primary.main' : 'grey.300',
            color: boolValue ? 'primary.contrastText' : 'grey.500',
            ...printStyles.forceColors,
            '@media print': {
              width: 16,
              height: 16,
            },
          }}
        >
          {boolValue ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        </Box>
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
              isBooleanBlock: block.type === 'BOOLEANS',
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
        '@media print': {
          height: 'auto !important',
          minHeight: '0 !important',
          maxHeight: 'none !important',
          backgroundColor: 'white',
          overflow: 'visible !important',
          display: 'block',
          fontSize: '9px',
          padding: 0,
          margin: 0,
          ...printStyles.forceColors['@media print'],
        },
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
          ...printStyles.hideOnPrint,
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

      <Box
        sx={{
          p: 3,
          width: '100%',
          flex: 1,
          overflow: 'auto',
          '@media print': {
            p: 0,
            overflow: 'visible !important',
            flex: 'none',
            width: 'auto',
            height: 'auto !important',
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            '@media print': {
              p: 0.5,
              boxShadow: 'none',
              overflow: 'visible !important',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                mt: 0,
                '@media print': { fontSize: '18px', mb: 1 },
              }}
            >
              Comparaison
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={printStyles.hideOnPrint}
            >
              Imprimer
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, ...printStyles.hideOnPrint }}>
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

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={0}>
              {sheets.map((sheet, idx) => (
                <Grid
                  item
                  xs={12}
                  md={Math.floor(12 / sheets.length)}
                  key={sheet.id}
                  sx={{
                    borderRight: idx < sheets.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'grey.50',
                      ...printStyles.blockHeaderPrint,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={idx + 1}
                        size="small"
                        sx={{
                          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                          color: 'white',
                          fontWeight: 600,
                          minWidth: 24,
                          ...printStyles.forceColors,
                          ...printStyles.chipPrint,
                        }}
                      />
                      <Typography
                        component={Link}
                        to={`/sheet/${sheetId}/details/${sheet.id}`}
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: 'inherit',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                          '@media print': { fontSize: '10px' },
                        }}
                      >
                        {sheet.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSheet(sheet.id)}
                      title="Retirer de la comparaison"
                      sx={{ color: 'error.main', ...printStyles.hideOnPrint }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {sheetConfig?.blocks?.map(block => {
            if (block.type === 'TEXT') {
              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <TextBlock text={block.text} />
                  </Box>
                </Paper>
              );
            }

            if (block.type === 'MAP') {
              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={{ ...blockPaperSx, ...printStyles.hideOnPrint }}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <Typography variant="h6" color="primary.main" fontWeight="600">
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    {sheets.map((sheet, idx) => {
                      const geomData = sheetsGeometryData[sheet.id] || {};
                      const firstSource = block.first_geom_source?.source;
                      const secondSource = block.second_geom_source?.source;

                      const firstGeometries = firstSource && geomData[firstSource]
                        ? geomData[firstSource].map(row => row.geom).filter(Boolean)
                        : [];
                      const secondGeometries = secondSource && geomData[secondSource]
                        ? geomData[secondSource].map(row => row.geom).filter(Boolean)
                        : [];

                      return (
                        <Grid
                          item
                          xs={12}
                          md={Math.max(4, Math.floor(12 / sheets.length))}
                          key={sheet.id}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={idx + 1}
                              size="small"
                              sx={{
                                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                color: 'white',
                                fontWeight: 600,
                                minWidth: 24,
                              }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {sheet.name}
                            </Typography>
                          </Box>
                          <MapBlock
                            firstGeometries={firstGeometries}
                            secondGeometries={secondGeometries}
                            color={CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              );
            }

            if (block.type === 'PANORAMAX') {
              const source = block?.first_geom_source?.source;

              const allEmpty = sheets.every(sheet => {
                const geomData = sheetsGeometryData[sheet.id];
                const geometry = source ? geomData?.[source]?.[0]?.geom || null : null;
                return !geometry || panoramaxEmptyStates[sheet.id];
              });

              if (allEmpty) return null;

              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    ...printStyles.hideOnPrint,
                  }}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <Typography variant="h6" color="primary.main" fontWeight="600">
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    {sheets.map((sheet, idx) => {
                      const geomData = sheetsGeometryData[sheet.id];
                      const geometry = source ? geomData?.[source]?.[0]?.geom || null : null;

                      return (
                        <Grid
                          item
                          xs={12}
                          md={Math.max(4, Math.floor(12 / sheets.length))}
                          key={sheet.id}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={idx + 1}
                              size="small"
                              sx={{
                                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                color: 'white',
                                fontWeight: 600,
                                minWidth: 24,
                              }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {sheet.name}
                            </Typography>
                          </Box>
                          {geometry ? (
                            <PanoramaxBlock
                              geometry={geometry}
                              onEmpty={() => handlePanoramaxEmpty(sheet.id)}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 400,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'grey.100',
                                borderRadius: 1,
                                color: 'text.secondary',
                              }}
                            >
                              <Typography>Pas d&apos;image disponible</Typography>
                            </Box>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              );
            }

            if (block.type === 'RADAR_PLOT') {
              const comparisonDataForRadar = sheets.slice(1).map((sheet, idx) => ({
                name: sheet.name,
                data: sheet.esData,
                color: CHART_COLORS[(idx + 1) % CHART_COLORS.length],
              }));

              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <RadarPlotBlock
                      fields={block.fields}
                      featureData={sheets[0]?.esData || {}}
                      featureName={sheets[0]?.name || ''}
                      comparisonData={comparisonDataForRadar}
                      isPrintMode={isPrintMode}
                    />
                  </Box>
                </Paper>
              );
            }

            if (block.type === 'BAR_PLOT') {
              const comparisonDataForBar = sheets.slice(1).map((sheet, idx) => ({
                name: sheet.name,
                data: sheet.esData,
                color: CHART_COLORS[(idx + 1) % CHART_COLORS.length],
              }));

              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <BarPlotBlock
                      fields={block.fields}
                      featureData={sheets[0]?.esData || {}}
                      featureName={sheets[0]?.name || ''}
                      comparisonData={comparisonDataForBar}
                      isPrintMode={isPrintMode}
                    />
                  </Box>
                </Paper>
              );
            }

            if (block.type === 'DISTRIB_PLOT') {
              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    {sheets.map((sheet, idx) => (
                      <Grid
                        item
                        xs={12}
                        md={Math.max(4, Math.floor(12 / sheets.length))}
                        key={sheet.id}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={idx + 1}
                            size="small"
                            sx={{
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                              color: 'white',
                              fontWeight: 600,
                              minWidth: 24,
                              ...printStyles.forceColors,
                              ...printStyles.chipPrint,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {sheet.name}
                          </Typography>
                        </Box>
                        <Box>
                          <DistribPlotBlock
                            fields={block.fields}
                            featureData={sheet.esData}
                            isPrintMode={isPrintMode}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              );
            }

            if (['FIELDS', 'BOOLEANS'].includes(block.type)) {
              const blockComparisonData = comparisonData.find(b => b.title === block.title);
              if (!blockComparisonData) return null;

              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}
                  <TableContainer>
                    <Table size="small" sx={{ tableLayout: 'fixed', ...printStyles.tablePrint }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 'bold', width: 200, backgroundColor: 'grey.50' }}
                          >
                            Champ
                          </TableCell>
                          {sheets.map((sheet, idx) => (
                            <TableCell
                              key={sheet.id}
                              sx={{
                                backgroundColor: 'grey.50',
                                width: `calc((100% - 200px) / ${sheets.length})`,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={idx + 1}
                                  size="small"
                                  sx={{
                                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    height: 20,
                                    minWidth: 20,
                                    ...printStyles.forceColors,
                                    ...printStyles.chipPrint,
                                  }}
                                />
                                {sheet.name}
                              </Box>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {blockComparisonData.fields.map(fieldDef => (
                          <TableRow key={fieldDef.label} hover>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {fieldDef.label}
                            </TableCell>
                            {sheets.map(sheet => {
                              const field = getFieldValue(sheet, block.title, fieldDef.label);
                              return (
                                <TableCell key={sheet.id}>
                                  {field
                                    ? renderFieldValue(field, fieldDef.isBooleanBlock)
                                    : '-'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            }

            if (block.type === 'FIELDS_TABLE') {
              return (
                <Paper
                  key={block.id}
                  elevation={0}
                  sx={blockPaperSx}
                >
                  {block.display_title && (
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                        ...printStyles.blockHeaderPrint,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight="600"
                        sx={printStyles.blockTitlePrint}
                      >
                        {block.title}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {sheets.map((sheet, idx) => (
                      <Box
                        key={sheet.id}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Chip
                          label={idx + 1}
                          size="small"
                          sx={{
                            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                            color: 'white',
                            fontWeight: 500,
                            minWidth: 24,
                            ...printStyles.forceColors,
                            ...printStyles.chipPrint,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sheet.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider />

                  <TableContainer>
                    <Table size="small" sx={printStyles.tablePrint}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 'bold', backgroundColor: 'grey.50', width: 40 }}
                          >
                            Fiche
                          </TableCell>
                          {block.fields?.map(field => (
                            <TableCell
                              key={field.id}
                              sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
                            >
                              {field.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sheets.flatMap((sheet, sheetIdx) => {
                          const blockData = sheetsTableData[block.id] || {};
                          const rows = blockData[sheet.id] || [];
                          const color = CHART_COLORS[sheetIdx % CHART_COLORS.length];

                          return rows.map((row, rowIdx) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <TableRow key={`${sheet.id}-${rowIdx}`} hover>
                              <TableCell
                                sx={{ borderLeft: `4px solid ${color}`, width: 40 }}
                              >
                                <Chip
                                  label={sheetIdx + 1}
                                  size="small"
                                  sx={{
                                    backgroundColor: color,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    height: 20,
                                    ...printStyles.forceColors,
                                    ...printStyles.chipPrint,
                                  }}
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
                        {sheets.every(sheet => {
                          const blockData = sheetsTableData[block.id] || {};
                          return (blockData[sheet.id] || []).length === 0;
                        }) && (
                          <TableRow>
                            <TableCell
                              colSpan={(block.fields?.length || 0) + 1}
                              sx={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}
                            >
                              Aucun élément trouvé
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            }

            return null;
          })}
        </Paper>
      </Box>
    </Box>
  );
};

export default SheetCompare;
