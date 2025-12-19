import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'debounce';
import { createPortal } from 'react-dom';
import { Box, Button } from '@mui/material';

import searchService, {
  getExtent,
  getSearchParamFromProperty,
} from '@terralego/core/modules/Visualizer/services/search';
import { extractColumns, prepareData, exportSpreadsheet } from './dataUtils';
import HeaderMui from './HeaderMui';
import DataTableTanstack from '../DataTableTanstack/DataTableTanstack';
import { useTableSelection } from '../../../../contexts/TableSelectionContext';

import './styles.scss';

// Table height configuration (in vh units)
const TABLE_HEIGHT_DEFAULT = 33;
const TABLE_HEIGHT_MIN = 20;
const TABLE_HEIGHT_MAX = 90;

const DataTableMui = ({
  displayedLayer,
  isTableVisible,
  query,
  map,
  visibleBoundingBox,
  exportCallback,
  setLayerState,
  setTableHeight,
  details,
  detailsFunction,
  interactiveMapInstance,
  hideDetails,
}) => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [extent, setExtent] = useState(false);
  const [full, setFull] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [features, setFeatures] = useState([]);
  const [tableHeight, setTableHeightLocal] = useState(TABLE_HEIGHT_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const previousLayerIdRef = React.useRef();
  const previousRowsByIdRef = React.useRef(new Map());

  const rowCacheMemo = useMemo(() => {
    const cache = new Map(previousRowsByIdRef.current);
    rows.forEach(row => {
      if (row && row.id !== undefined && row.id !== null) {
        cache.set(String(row.id), row);
      }
    });
    return cache;
  }, [rows]);

  // Use the centralized selection
  const { rowSelection, setRowSelection, selectedFeatures, clearSelection, setActiveLayer } =
    useTableSelection();

  // Set the active layer when table becomes visible
  useEffect(() => {
    if (isTableVisible && displayedLayer && map) {
      const { filters: { layer: esIndex } = {}, layers = [] } = displayedLayer;

      if (layers && layers.length > 0) {
        const mapboxLayerId = layers[0];
        const mapLayer = map.getLayer(mapboxLayerId);

        if (mapLayer) {
          setActiveLayer({
            mapboxLayerId,
            sourceLayer: mapLayer.sourceLayer,
            source: mapLayer.source,
            esIndex,
          });
        }
      }
    } else {
      setActiveLayer(null);
    }
  }, [isTableVisible, displayedLayer, map, setActiveLayer]);

  // Clear selection when table closes
  useEffect(() => {
    if (!isTableVisible) {
      clearSelection();
    }
  }, [isTableVisible, clearSelection]);

  // Transform 2D array data to rows format for TanStack
  const transformData = useCallback((blueprintColumns, data, hits) => {
    if (!data || !blueprintColumns) return [];

    return data.map((row, rowIndex) => {
      const rowObj = {
        id: hits?.[rowIndex]?._id || `row_${rowIndex}`,
      };
      blueprintColumns.forEach((col, colIndex) => {
        const fieldName = col.value || `col_${colIndex}`;
        rowObj[fieldName] = row[colIndex];
      });
      return rowObj;
    });
  }, []);

  // Load results function
  const loadResults = useCallback(async () => {
    if (!displayedLayer) return;

    const {
      filters: { layer, fields, form } = {},
      state: { filters = {} } = {},
      baseEsQuery,
    } = displayedLayer;

    setLoading(true);

    const boundingBox = extent ? getExtent(map, visibleBoundingBox) : undefined;

    const properties = {
      ...Object.keys(filters).reduce(
        (all, key) => ({
          ...all,
          ...getSearchParamFromProperty(filters, form, key),
        }),
        {},
      ),
    };

    try {
      const resp = await searchService.search({
        index: layer,
        query,
        properties,
        boundingBox,
        baseQuery: baseEsQuery,
        include:
          fields &&
          fields.reduce((all, { value }) => {
            const interpolation = value.match(/\{[^}]+\}/g);
            return [
              ...all,
              ...(interpolation
                ? interpolation.map(match => match.match(/\{([^}]+)\}/)[1])
                : [value]),
            ];
          }, []),
      });

      const {
        hits: {
          hits,
          total: { value: total },
        },
      } = resp;
      const extractedColumns = extractColumns(fields, hits);
      const preparedData = prepareData(extractedColumns, hits);

      setFeatures(hits);
      setColumns(extractedColumns);
      setResultsTotal(total);
      setRows(transformData(extractedColumns, preparedData, hits));
      // Update cache with latest rows
      const newCache = new Map(previousRowsByIdRef.current);
      preparedData.forEach((row, idx) => {
        const rowId = hits?.[idx]?._id || `row_${idx}`;
        newCache.set(String(rowId), {
          id: rowId,
          ...row,
        });
      });
      previousRowsByIdRef.current = newCache;
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [displayedLayer, query, extent, map, visibleBoundingBox, transformData]);

  const debouncedLoadResults = useCallback(
    debounce(() => {
      loadResults();
    }, 500),
    [loadResults],
  );

  useEffect(() => {
    if (displayedLayer) {
      debouncedLoadResults();
    }
  }, [displayedLayer, query, extent, debouncedLoadResults]);

  // Clear data only when switching to a different layer
  useEffect(() => {
    if (!displayedLayer) return;

    const layerId = displayedLayer.id;
    if (previousLayerIdRef.current !== layerId) {
      setLoading(true);
      setRows([]);
      setResultsTotal(0);
      setFeatures([]);
      setRowSelection({});
      previousRowsByIdRef.current = new Map();
    }
    previousLayerIdRef.current = layerId;
  }, [displayedLayer, setRowSelection]);

  const toggleExtent = () => setExtent(prev => !prev);

  const resize = () => {
    setIsResizing(true);
    setFull(prev => !prev);
    setTimeout(() => setIsResizing(false), 300);
  };

  // Calculate selected features for parent components
  const selectedFeaturesMemo = useMemo(() => selectedFeatures, [selectedFeatures]);

  const handleColumnChange = ({ event, index }) => {
    const { checked } = event.target;
    setColumns(prevColumns =>
      prevColumns.map((col, i) => (i === index ? { ...col, display: checked } : col)),
    );
  };

  const handleExport = (format = 'xlsx') => {
    if (!displayedLayer) return;

    const { label: name, filters: { fields = [] } = {} } = displayedLayer;

    const exportableColumnIndexes = columns.reduce((store, { value }, index) => {
      const fieldConfig = fields.find(field => field.value === value);
      const { exportable = false } = fieldConfig || {};
      return exportable ? [...store, index] : store;
    }, []);

    const columnLabels = columns.map(({ value, label = value }) => label);
    const preparedData = prepareData(columns, features);
    const data = [columnLabels, ...preparedData].map(dataLine =>
      exportableColumnIndexes.map(index => dataLine[index]),
    );

    exportSpreadsheet({
      name,
      data,
      callback: exportCallback,
      format,
    });
  };

  // When the displayed layer changes, immediately clear previous data and selection
  useEffect(() => {
    if (!displayedLayer) return;

    setLoading(true);
    setRows([]);
    setResultsTotal(0);
    setFeatures([]);
    setRowSelection({});
  }, [displayedLayer, setRowSelection]);

  // Resize handle drag logic
  const handleResizeStart = useCallback(
    e => {
      e.preventDefault();
      setIsResizing(true);
      setIsDragging(true);
      setDragStartY(e.type === 'mousedown' ? e.clientY : e.touches[0].clientY);
      setDragStartHeight(tableHeight);
    },
    [tableHeight],
  );

  const handleResizeMove = useCallback(
    e => {
      if (!isDragging) return;

      const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
      const deltaY = dragStartY - currentY;
      const viewportHeight = window.innerHeight;
      const deltaVh = (deltaY / viewportHeight) * 100;
      const newHeight = Math.min(
        TABLE_HEIGHT_MAX,
        Math.max(TABLE_HEIGHT_MIN, dragStartHeight + deltaVh),
      );

      setTableHeightLocal(newHeight);
    },
    [isDragging, dragStartY, dragStartHeight],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);
    setTableHeight(tableHeight);
  }, [tableHeight, setTableHeight]);

  // Function to open feature details by ID
  const openFeatureDetails = useCallback(featureId => {
    if (!detailsFunction?.fn || !map || !displayedLayer) return;

    // Find feature by ID
    const esFeature = features.find(f => f._id === featureId);
    if (!esFeature) {
      console.warn(`Feature with ID ${featureId} not found`);
      return;
    }

    const mapboxLayerId = displayedLayer.layers?.[0];
    const mapLayer = map.getLayer(mapboxLayerId);
    
    if (!mapLayer) {
      console.warn(`Layer ${mapboxLayerId} not found in map`);
      return;
    }

    // Transform ES feature to Mapbox feature
    const mapboxFeature = {
      type: 'Feature',
      properties: {
        ...esFeature._source,
        _id: featureId, // Ensure _id is in properties
      },
      geometry: esFeature._source?.geom || null,
      layer: {
        id: mapboxLayerId,
        source: mapLayer.source,
      },
      source: mapLayer.source,
      sourceLayer: mapLayer.sourceLayer,
    };

    // Call the details function
    detailsFunction.fn({
      feature: mapboxFeature,
      map,
      event: {},
      layerId: mapboxLayerId,
      instance: interactiveMapInstance,
    });
  }, [detailsFunction, features, map, displayedLayer, interactiveMapInstance]);

  if (!displayedLayer) return null;

  const {
    label,
    compare,
    filters: { layer, table: { title } = {}, exportable, fields = [] } = {},
  } = displayedLayer;

  const haveExportableField = fields.some(({ exportable: exportableField }) => exportableField);
  const showExportButton = exportable && haveExportableField;

  // Filter visible columns for display
  const visibleColumns = columns.filter(col => col.display !== false);

  return (
    <>
      {isDragging &&
        createPortal(
          <Box
            className="table-resize-overlay"
            onMouseMove={handleResizeMove}
            onMouseUp={handleResizeEnd}
            onTouchMove={handleResizeMove}
            onTouchEnd={handleResizeEnd}
            onMouseLeave={handleResizeEnd}
          />,
          document.body,
        )}

      <Box
        className={classnames({
          'data-table-mui': true,
          'data-table-mui--visible': isTableVisible,
          'data-table-mui--full': full,
        })}
        sx={{
          '--table-height': full ? '100vh' : `${tableHeight}vh`,
        }}
      >
        {!full && (
          <Box
            className="table-resize-handle"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <Box className="table-resize-handle__bar" />
          </Box>
        )}
        <Box
          sx={{
            backgroundColor: 'background.paper',
          }}
          className={classnames({
            'table-container-mui': true,
            'table-container-mui--visible': isTableVisible,
            'table-container-mui--is-resizing': isResizing,
            'table-container-mui--full': full,
          })}
        >
          {isTableVisible && (
            <>
              <HeaderMui
                resultsTotal={resultsTotal}
                toggleExtent={toggleExtent}
                extent={extent}
                layer={layer}
                compare={compare}
                selectedFeatures={selectedFeaturesMemo}
                clearSelection={clearSelection}
                loading={loading}
                title={title || label}
                full={full}
                resize={resize}
                exportData={showExportButton ? handleExport : null}
                columns={columns}
                onChange={handleColumnChange}
                setLayerState={setLayerState}
                displayedLayer={displayedLayer}
              />
              <Box sx={{ height: 'calc(100% - 44px)', width: '100%' }}>
                <DataTableTanstack
                  columns={visibleColumns}
                  rows={rows}
                  loading={loading}
                  rowSelection={rowSelection}
                  details={
                    details?.layerTreeId === displayedLayer.id
                      ? details?.feature?.properties?._id
                      : null
                  }
                  hasDetails={!!detailsFunction}
                  onRowSelectionChange={setRowSelection}
                  onOpenDetails={openFeatureDetails}
                  onHideDetails={hideDetails}
                  pageSize={25}
                  rowCache={rowCacheMemo}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

DataTableMui.propTypes = {
  displayedLayer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    compare: PropTypes.string,
    layers: PropTypes.arrayOf(PropTypes.string),
    filters: PropTypes.shape({
      layer: PropTypes.string.isRequired,
      exportable: PropTypes.bool,
      table: PropTypes.shape({
        title: PropTypes.string,
      }),
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          exportable: PropTypes.bool,
          display: PropTypes.bool,
        }),
      ),
      form: PropTypes.array,
    }),
    state: PropTypes.shape({
      filters: PropTypes.object,
    }),
    baseEsQuery: PropTypes.object,
  }),
  isTableVisible: PropTypes.bool,
  query: PropTypes.string,
  detailsFunction: PropTypes.shape({
    fn: PropTypes.func,
  }),
  map: PropTypes.object,
  visibleBoundingBox: PropTypes.array,
  exportCallback: PropTypes.func,
  setLayerState: PropTypes.func,
  setTableHeight: PropTypes.func,
  details: PropTypes.shape({
    layerTreeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    feature: PropTypes.shape({
      properties: PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    }),
  }),
  interactiveMapInstance: PropTypes.object,
};

DataTableMui.defaultProps = {
  displayedLayer: undefined,
  isTableVisible: true,
  query: '',
  map: null,
  visibleBoundingBox: null,
  exportCallback: () => {},
  setLayerState: () => {},
  setTableHeight: () => {},
  details: undefined,
  detailsFunction: undefined,
  interactiveMapInstance: null,
};

export default DataTableMui;
