import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Api from '@terralego/core/modules/Api';
import bodybuilder from 'bodybuilder';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';

import useEsClient from '../utils/useEsClient';
import { getEsIndexFromBlocks, hideSplashScreen } from '../utils/sheetUtils';
import { SheetLoading, SheetError, SheetWarning } from '../layouts/SheetLoadingStates';
import SheetBlock from '../components/SheetBlock';

const SheetView = () => {
  const { sheetId, elementId } = useParams();
  const history = useHistory();
  const esClient = useEsClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [esData, setEsData] = useState(null);
  const [tableData, setTableData] = useState({});
  const [geometryData, setGeometryData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [hideEmptyFields, setHideEmptyFields] = useState(false);

  useEffect(() => {
    hideSplashScreen();
  }, []);

  useEffect(() => {
    const fetchSheetData = async () => {
      setLoading(true);
      setError(null);

      if (!sheetId) {
        setError('ID de fiche manquant');
        return;
      }

      try {
        const response = await Api.request('feature_sheet');
        if (response.results?.length > 0) {
          const config = response.results.find(
            sheet => String(sheet.id) === String(sheetId),
          );
          if (config) {
            setSheetData(config);
          } else {
            setError(`Fiche non trouvée pour l'ID ${sheetId}`);
          }
        } else {
          setError('Aucune configuration de fiche disponible');
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de la fiche');
      }
    };

    fetchSheetData();
  }, [sheetId]);

  useEffect(() => {
    if (!sheetData || !elementId) return;

    const esIndex = getEsIndexFromBlocks(sheetData.blocks);
    const uniqueId = sheetData.unique_identifier;
    
    if (!esIndex || !uniqueId) {
      setLoading(false);
      return;
    }

    const fetchEsData = async () => {
      try {
        const response = await esClient.search({
          index: esIndex,
          body: bodybuilder()
            .filter('term', uniqueId, elementId)
            .size(1)
            .build(),
        });

        if (response.hits?.hits?.length > 0) {
          // eslint-disable-next-line no-underscore-dangle
          setEsData(response.hits.hits[0]._source);
        }
      } catch (err) {
        // Continue without ES data
      } finally {
        setLoading(false);
      }
    };

    fetchEsData();
  }, [sheetData, esClient, elementId]);

  useEffect(() => {
    if (!sheetData?.blocks || !esData) return;

    const tableBlocks = sheetData.blocks.filter(block => block.type === 'FIELDS_TABLE');
    if (tableBlocks.length === 0) return;

    const linkField = sheetData.unique_identifier;
    const linkValue = esData[linkField];
    if (!linkValue) return;

    const fetchTableData = async () => {
      const newTableData = {};

      await Promise.all(
        tableBlocks.map(async block => {
          const tableEsIndex = block.fields?.[0]?.field_source;
          if (!tableEsIndex) {
            newTableData[block.id] = [];
            return;
          }

          try {
            let query = bodybuilder()
              .filter('term', linkField, linkValue)
              .size(block.limit || 1000);

            if (block.order_field) {
              query = query.sort(block.order_field, 'asc');
            }

            const response = await esClient.search({
              index: tableEsIndex,
              body: query.build(),
            });

            // eslint-disable-next-line no-underscore-dangle
            newTableData[block.id] = response.hits?.hits?.map(hit => hit._source) || [];
          } catch (err) {
            newTableData[block.id] = [];
          }
        }),
      );

      setTableData(newTableData);
    };

    fetchTableData();
  }, [sheetData, esData, esClient]);

  useEffect(() => {
    if (!sheetData?.blocks || !esData) return;

    const geomSources = new Set();

    sheetData.blocks.forEach(block => {
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

    const linkField = sheetData.unique_identifier;
    const linkValue = esData[linkField];
    if (!linkValue) return;

    const fetchGeometryData = async () => {
      const newGeomData = {};

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
            newGeomData[source] = response.hits?.hits?.map(hit => hit._source) || [];
          } catch (err) {
            newGeomData[source] = [];
          }
        }),
      );

      setGeometryData(newGeomData);
    };

    fetchGeometryData();
  }, [sheetData, esData, esClient]);

  const enrichedBlocks = useMemo(() => {
    if (!sheetData?.blocks) return [];

    const featureName = esData?.nom_officiel || esData?.nom_ppal || sheetData.name || 'Feature';

    return sheetData.blocks.map(block => {
      if (block.type === 'FIELDS_TABLE') {
        return { ...block, tableData: tableData[block.id] || [] };
      }

      if (block.type === 'MAP') {
        const firstSource = block.first_geom_source?.source;
        const firstGeometries = firstSource && geometryData[firstSource]
          ? geometryData[firstSource].map(row => row.geom).filter(Boolean)
          : [];

        const secondSource = block.second_geom_source?.source;
        const secondGeometries = secondSource && geometryData[secondSource]
          ? geometryData[secondSource].map(row => row.geom).filter(Boolean)
          : [];

        return {
          ...block,
          firstGeometries,
          secondGeometries,
        };
      }

      if (block.type === 'PANORAMAX') {
        const source = block.first_geom_source?.source;
        const geometries = source && geometryData[source]
          ? geometryData[source].map(row => row.geom).filter(Boolean)
          : [];
        return {
          ...block,
          geometry: geometries[0] || null,
        };
      }

      if (['RADAR_PLOT', 'BAR_PLOT', 'DISTRIB_PLOT'].includes(block.type)) {
        return {
          ...block,
          featureData: esData || {},
          featureName,
        };
      }

      if (!esData) return block;

      return {
        ...block,
        fields: block.fields?.map(field => ({
          ...field,
          value: esData[field.field_name],
        })),
      };
    });
  }, [sheetData, esData, tableData, geometryData]);

  const filteredBlocks = useMemo(() => {
    if (!hideEmptyFields) return enrichedBlocks;

    const alwaysVisibleTypes = ['MAP', 'PANORAMAX', 'RADAR_PLOT', 'BAR_PLOT', 'DISTRIB_PLOT', 'BOOLEANS', 'TEXT'];

    return enrichedBlocks
      .map(block => {
        if (alwaysVisibleTypes.includes(block.type)) return block;

        if (block.type === 'FIELDS_TABLE') {
          if (!block.tableData || block.tableData.length === 0) return null;
          return block;
        }

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
  }, [enrichedBlocks, hideEmptyFields]);

  const handleBack = () => history.push(`/sheet/${sheetId}`);
  const handlePrint = () => window.print();
  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  if (loading) return <SheetLoading />;
  if (error) return <SheetError message={error} />;
  if (!sheetData && !loading) return <SheetWarning message="Fiche non trouvée" />;
  if (!sheetData) return <SheetLoading />;

  const subtitle = esData?.epci || esData?.nom_epci || '';

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
          height: 'auto',
          overflow: 'visible',
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
          '@media print': {
            display: 'none',
          },
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
          {sheetData.name}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          width: '100%',
          flex: 1,
          overflow: 'auto',
          '@media print': {
            overflow: 'visible',
            p: 0,
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 0 }}>
                {esData?.nom_officiel || sheetData.name}
              </Typography>
              {subtitle && (
                <Typography variant="h6" component="h2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>
              Imprimer la fiche
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Description" />
              <Tab label="Toutes les valeurs" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box>
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
              {filteredBlocks.map(block => (
                <SheetBlock key={block.id} block={block} />
              ))}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Affichage de toutes les valeurs brutes - À implémenter
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SheetView;
