import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { createPortal } from 'react-dom';
import { Box } from '@mui/material';

import bbox from '@turf/bbox';

import { extractColumns, prepareData, exportSpreadsheet } from './dataUtils';
import { fetchTableData, fetchGeometriesByIds, getExtent } from './tableService';
import HeaderMui from './HeaderMui';
import DataTable from '../DataTable';
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
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rows, setRows] = useState([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [totalWithoutFilter, setTotalWithoutFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [extent, setExtent] = useState(false);
  const [full, setFull] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [features, setFeatures] = useState([]);
  const [tableHeight, setTableHeightLocal] = useState(TABLE_HEIGHT_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [mapBoundsKey, setMapBoundsKey] = useState('');
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

  const { rowSelection, setRowSelection, selectedFeatures, clearSelection, setActiveLayer } =
    useTableSelection();

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

  useEffect(() => {
    if (!isTableVisible) {
      clearSelection();
    }
  }, [isTableVisible, clearSelection]);

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

  const loadResults = useCallback(async currentVisibleBoundingBox => {
    if (!displayedLayer) return;

    const {
      filters: { layer, fields, form } = {},
      state: { filters = {} } = {},
      baseEsQuery,
    } = displayedLayer;

    setLoading(true);

    const boundingBox = extent && currentVisibleBoundingBox
      ? getExtent(map, currentVisibleBoundingBox)
      : undefined;

    try {
      const { hits, total, unfilteredTotal } = await fetchTableData({
        layer,
        fields,
        form,
        filters,
        baseEsQuery,
        query,
        boundingBox,
      });

      const extractedColumns = extractColumns(fields, hits);
      const preparedData = prepareData(extractedColumns, hits);

      setFeatures(hits);
      setColumns(extractedColumns);
      setResultsTotal(total);
      setTotalWithoutFilter(unfilteredTotal);
      setRows(transformData(extractedColumns, preparedData, hits));
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
  }, [displayedLayer, query, extent, map, transformData]);

  const loadResultsRef = React.useRef(loadResults);
  loadResultsRef.current = loadResults;

  const previousValuesRef = React.useRef({
    displayedLayerId: null,
    query: null,
    extent: false,
    bboxKey: null,
    filtersKey: null,
  });

  const bboxKey = useMemo(() => {
    if (!extent) return null;
    return mapBoundsKey || null;
  }, [extent, mapBoundsKey]);

  const filtersKey = useMemo(
    () => JSON.stringify(displayedLayer?.state?.filters || {}),
    [displayedLayer?.state?.filters],
  );

  useEffect(() => {
    if (!displayedLayer) return;

    const prev = previousValuesRef.current;
    const layerChanged = prev.displayedLayerId !== displayedLayer.id;
    const queryChanged = prev.query !== query;
    const extentChanged = prev.extent !== extent;
    const bboxChanged = extent && prev.bboxKey !== bboxKey;
    const filtersChanged = prev.filtersKey !== filtersKey;

    const shouldRefetch =
      layerChanged || queryChanged || extentChanged || bboxChanged || filtersChanged;

    if (!shouldRefetch) return;

    previousValuesRef.current = {
      displayedLayerId: displayedLayer.id,
      query,
      extent,
      bboxKey,
      filtersKey,
    };

    loadResultsRef.current(extent ? visibleBoundingBox : null);
  }, [displayedLayer, query, extent, bboxKey, filtersKey, visibleBoundingBox]);

  useEffect(() => {
    if (!map) return;

    const updateBoundsKey = () => {
      const bounds = map.getBounds();
      const key = `${bounds.getWest().toFixed(6)},${bounds.getSouth().toFixed(6)},${bounds.getEast().toFixed(6)},${bounds.getNorth().toFixed(6)}`;
      setMapBoundsKey(key);
    };

    // Set initial bounds
    if (map.loaded()) {
      updateBoundsKey();
    } else {
      map.once('load', updateBoundsKey);
    }

    map.on('moveend', updateBoundsKey);
    return () => {
      map.off('moveend', updateBoundsKey);
    };
  }, [map]);

  useEffect(() => {
    if (!displayedLayer) return;

    const layerId = displayedLayer.id;
    if (previousLayerIdRef.current !== layerId) {
      setLoading(true);
      setRows([]);
      setResultsTotal(0);
      setFeatures([]);
      setRowSelection({});
      setColumnVisibility({});
      previousRowsByIdRef.current = new Map();
    }
    previousLayerIdRef.current = layerId;
  }, [displayedLayer, setRowSelection]);

  useEffect(() => {
    if (columns.length > 0 && Object.keys(columnVisibility).length === 0) {
      const initialVisibility = {};
      columns.forEach(col => {
        if (col.value && col.display === false) {
          initialVisibility[col.value] = false;
        }
      });
      if (Object.keys(initialVisibility).length > 0) {
        setColumnVisibility(initialVisibility);
      }
    }
  }, [columns, columnVisibility]);

  const toggleExtent = () => setExtent(prev => !prev);

  const resize = () => {
    setIsResizing(true);
    setFull(prev => !prev);
    setTimeout(() => setIsResizing(false), 300);
  };

  const selectedFeaturesMemo = useMemo(() => selectedFeatures, [selectedFeatures]);

  const handleColumnChange = ({ event, index }) => {
    const { checked } = event.target;
    const colId = columns[index]?.value;
    if (colId) {
      setColumnVisibility(prev => ({
        ...prev,
        [colId]: checked,
      }));
    }
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

  const handleZoomToSelection = useCallback(async selectedFeaturesList => {
    if (!displayedLayer || !map || selectedFeaturesList.length === 0) return;

    const { filters: { layer: esIndex } = {}, baseEsQuery } = displayedLayer;
    const ids = selectedFeaturesList.map(f => f._id);

    try {
      const geometries = await fetchGeometriesByIds({
        layer: esIndex,
        ids,
        baseEsQuery,
      });

      if (geometries.length === 0) {
        return;
      }

      const featureCollection = {
        type: 'FeatureCollection',
        features: geometries.map(geom => ({
          type: 'Feature',
          geometry: geom,
          properties: {},
        })),
      };

      const bounds = bbox(featureCollection);

      const mapContainer = map.getContainer();
      const mapRect = mapContainer.getBoundingClientRect();
      const mapWidth = mapContainer.offsetWidth;
      const mapHeight = mapContainer.offsetHeight;

      let fitPadding = { top: 50, bottom: 50, left: 50, right: 50 };

      if (visibleBoundingBox) {
        const visibleLeft = Math.max(0, visibleBoundingBox.left - mapRect.left);
        const visibleTop = Math.max(0, visibleBoundingBox.top - mapRect.top);
        const visibleRight = Math.min(mapWidth, visibleBoundingBox.right - mapRect.left);
        const visibleBottom = Math.min(mapHeight, visibleBoundingBox.bottom - mapRect.top);

        fitPadding = {
          top: visibleTop + 20,
          left: visibleLeft + 20,
          right: mapWidth - visibleRight + 20,
          bottom: mapHeight - visibleBottom + 20,
        };
      }

      map.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: fitPadding },
      );
    } catch (error) {
      console.error('Error fetching geometries for zoom:', error);
    }
  }, [displayedLayer, map, visibleBoundingBox]);

  useEffect(() => {
    if (!map) return;

    const extentSourceId = 'extent-indicator-source';
    const extentLayerId = 'extent-indicator-layer';
    const padding = 2;

    const updateExtentRect = () => {
      if (!extent || !visibleBoundingBox) return;

      const paddedBbox = {
        ...visibleBoundingBox,
        left: visibleBoundingBox.left + padding,
        top: visibleBoundingBox.top + padding,
        width: visibleBoundingBox.width - (padding * 2),
        height: visibleBoundingBox.height - (padding * 2),
      };

      const [[lngMin, latMax], [lngMax, latMin]] = getExtent(map, paddedBbox);

      const source = map.getSource(extentSourceId);
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lngMin, latMin],
              [lngMax, latMin],
              [lngMax, latMax],
              [lngMin, latMax],
              [lngMin, latMin],
            ]],
          },
        });
      }
    };

    const cleanup = () => {
      map.off('moveend', updateExtentRect);
      if (map.getLayer(extentLayerId)) map.removeLayer(extentLayerId);
      if (map.getSource(extentSourceId)) map.removeSource(extentSourceId);
    };

    if (extent && visibleBoundingBox) {
      cleanup();

      const paddedBbox = {
        ...visibleBoundingBox,
        left: visibleBoundingBox.left + padding,
        top: visibleBoundingBox.top + padding,
        width: visibleBoundingBox.width - (padding * 2),
        height: visibleBoundingBox.height - (padding * 2),
      };

      const [[lngMin, latMax], [lngMax, latMin]] = getExtent(map, paddedBbox);

      map.addSource(extentSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lngMin, latMin],
              [lngMax, latMin],
              [lngMax, latMax],
              [lngMin, latMax],
              [lngMin, latMin],
            ]],
          },
        },
      });

      map.addLayer({
        id: extentLayerId,
        type: 'line',
        source: extentSourceId,
        paint: {
          'line-color': '#000000',
          'line-width': 3,
          'line-dasharray': [4, 2],
          'line-opacity': 0.4,
        },
      });

      map.on('moveend', updateExtentRect);
    } else {
      cleanup();
    }

    return cleanup;
  }, [extent, map, visibleBoundingBox]);

  const openFeatureDetails = useCallback(featureId => {
    if (!detailsFunction?.fn || !map || !displayedLayer) return;

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

    const mapboxFeature = {
      type: 'Feature',
      properties: {
        ...esFeature._source,
        _id: featureId,
      },
      geometry: esFeature._source?.geom || null,
      layer: {
        id: mapboxLayerId,
        source: mapLayer.source,
      },
      source: mapLayer.source,
      sourceLayer: mapLayer.sourceLayer,
    };

    detailsFunction.fn({
      feature: mapboxFeature,
      map,
      event: {},
      layerId: mapboxLayerId,
      instance: interactiveMapInstance,
    });
  }, [detailsFunction, features, map, displayedLayer, interactiveMapInstance]);

  const columnsWithDisplay = useMemo(
    () =>
      columns.map(col => ({
        ...col,
        display: columnVisibility[col.value] !== false,
      })),
    [columns, columnVisibility],
  );

  if (!displayedLayer) return null;

  const {
    label,
    compare,
    filters: { layer, table: { title } = {}, exportable, fields = [] } = {},
  } = displayedLayer;

  const haveExportableField = fields.some(({ exportable: exportableField }) => exportableField);
  const showExportButton = exportable && haveExportableField;

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
                totalWithoutFilter={totalWithoutFilter}
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
                columns={columnsWithDisplay}
                onChange={handleColumnChange}
                setLayerState={setLayerState}
                displayedLayer={displayedLayer}
                onZoomToSelection={handleZoomToSelection}
              />
              <Box sx={{ height: 'calc(100% - 44px)', width: '100%' }}>
                <DataTable
                  columns={columns}
                  rows={rows}
                  loading={loading}
                  rowSelection={rowSelection}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={setColumnVisibility}
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
