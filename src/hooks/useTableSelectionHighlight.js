import { useEffect } from 'react';
import { useTableSelection } from '../contexts/TableSelectionContext';
import { selectionHighlightColor } from '../mui-theme';

const TABLE_SELECTION_HIGHLIGHT_LAYER_PREFIX = 'table-selection-highlight';
const HIGHLIGHT_COLOR = selectionHighlightColor || '#00da12';

/**
 * Hook that manages table selection highlights on the map in a declarative way.
 * Automatically adds/removes highlight layers based on the current selection state.
 */
export const useTableSelectionHighlight = map => {
  const { rowSelection, activeLayer } = useTableSelection();

  useEffect(() => {
    if (!map || !activeLayer) {
      return;
    }

    const { mapboxLayerId, sourceLayer, source } = activeLayer;

    if (!mapboxLayerId || !source) {
      return;
    }

    // Get selected IDs
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);

    // Create unique layer IDs for this table's highlights
    const fillLayerId = `${TABLE_SELECTION_HIGHLIGHT_LAYER_PREFIX}-fill-${mapboxLayerId}`;
    const lineLayerId = `${TABLE_SELECTION_HIGHLIGHT_LAYER_PREFIX}-line-${mapboxLayerId}`;

    // Get the original layer to check its type
    const originalLayer = map.getLayer(mapboxLayerId);

    if (!originalLayer) {
      return;
    }

    const { type: layerType } = originalLayer;

    // Remove existing highlight layers if they exist
    const cleanupLayers = () => {
      if (map.getLayer(fillLayerId)) {
        map.removeLayer(fillLayerId);
      }
      if (map.getLayer(lineLayerId)) {
        map.removeLayer(lineLayerId);
      }
    };

    cleanupLayers();

    // Only add highlight layers if there are selected features
    if (selectedIds.length === 0) {
      return;
    }

    // Create filter for selected features
    const filter = ['in', '_id', ...selectedIds];

    // Add highlight layers based on original layer type
    if (layerType === 'fill' || layerType === 'line') {
      // Add fill highlight
      const fillLayer = {
        id: fillLayerId,
        type: 'fill',
        source,
        paint: {
          'fill-color': HIGHLIGHT_COLOR,
          'fill-opacity': 0.3,
        },
        filter,
      };

      if (sourceLayer) {
        fillLayer['source-layer'] = sourceLayer;
      }

      map.addLayer(fillLayer);

      // Add line highlight for border
      const lineLayer = {
        id: lineLayerId,
        type: 'line',
        source,
        paint: {
          'line-color': HIGHLIGHT_COLOR,
          'line-width': 2,
          'line-opacity': 1,
        },
        filter,
      };

      if (sourceLayer) {
        lineLayer['source-layer'] = sourceLayer;
      }

      map.addLayer(lineLayer);
    } else if (layerType === 'circle') {
      // For circle layers, just add a circle highlight
      const circleLayer = {
        id: fillLayerId,
        type: 'circle',
        source,
        paint: {
          'circle-color': HIGHLIGHT_COLOR,
          'circle-radius': 8,
          'circle-opacity': 0.4,
          'circle-stroke-color': HIGHLIGHT_COLOR,
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 1,
        },
        filter,
      };

      if (sourceLayer) {
        circleLayer['source-layer'] = sourceLayer;
      }

      map.addLayer(circleLayer);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      cleanupLayers();
    };
  }, [map, rowSelection, activeLayer]);
};

export default useTableSelectionHighlight;
