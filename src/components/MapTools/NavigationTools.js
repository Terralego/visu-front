import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import CompassIcon from './CompassIcon';
import ToolButton from './ToolButton';
import ToolGroup from './ToolGroup';
import useToolsContainer from './useToolsContainer';

const ROTATION_THRESHOLD = 0.5;
const BUTTON_SIZE = { width: 29, height: 29 };

const NavigationTools = ({ map, translate }) => {
  const container = useToolsContainer(map, 'bottom-right', 'map-navigation-tools');
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!map) return undefined;

    const update = () => setView({
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      canZoomIn: map.getZoom() < map.getMaxZoom(),
      canZoomOut: map.getZoom() > map.getMinZoom(),
    });

    update();
    map.on('move', update);

    return () => map.off('move', update);
  }, [map]);

  const zoomIn = useCallback(() => map.zoomIn(), [map]);
  const zoomOut = useCallback(() => map.zoomOut(), [map]);
  const resetNorth = useCallback(() => map.easeTo({ bearing: 0, pitch: 0 }), [map]);

  if (!container || !view) return null;

  const isRotated = Math.abs(view.bearing) > ROTATION_THRESHOLD || view.pitch > ROTATION_THRESHOLD;

  return createPortal(
    <ToolGroup light>
      <ToolButton
        label={translate('terralego.map.zoom_in_control.title')}
        icon={<AddIcon sx={{ fontSize: 18 }} />}
        onClick={zoomIn}
        sx={BUTTON_SIZE}
        disabled={!view.canZoomIn}
      />
      <ToolButton
        label={translate('terralego.map.zoom_out_control.title')}
        icon={<RemoveIcon sx={{ fontSize: 18 }} />}
        onClick={zoomOut}
        sx={BUTTON_SIZE}
        disabled={!view.canZoomOut}
      />
      {isRotated && (
        <ToolButton
          label={translate('terralego.map.compass_arrow_control.title')}
          icon={(
            <CompassIcon
              sx={{ fontSize: 20 }}
              style={{ transform: `rotate(${-view.bearing}deg)` }}
            />
          )}
          onClick={resetNorth}
          sx={BUTTON_SIZE}
        />
      )}
    </ToolGroup>,
    container,
  );
};

NavigationTools.propTypes = {
  map: PropTypes.shape({
    addControl: PropTypes.func.isRequired,
    removeControl: PropTypes.func.isRequired,
  }),
  translate: PropTypes.func.isRequired,
};

NavigationTools.defaultProps = {
  map: null,
};

export default NavigationTools;
