import React, { useContext } from 'react';
import { Switch } from '@mui/material';
import { Intent } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import { processWarningAccordingToZoom } from '../../services/warningZoom';
import context from '../LayersTreeProvider/context';
import Tooltip from '../../../../components/Tooltip';
import translateMock from '../../../../utils/translate';

const DEFAULT_TRANSLATE = translateMock({
  'terralego.visualizer.layerstree.warningzoom.message': 'Visible from zoom {{minzoom}}',
});

const useWarningZoom = (layer, isActive) => {
  const { map, translate = DEFAULT_TRANSLATE } = useContext(context) || {};

  if (!isActive || !layer?.fetched || !map) {
    return { showWarning: false, minZoomLayer: null, translate };
  }

  const { showWarning, minZoomLayer } = processWarningAccordingToZoom(map, layer);
  return { showWarning, minZoomLayer, translate };
};

const LayerSwitch = ({ checked, onChange, id, loading, layer, isActive }) => {
  const { showWarning, minZoomLayer, translate } = useWarningZoom(layer, isActive);

  const switchEl = (
    <span>
      <Switch
        checked={checked}
        onChange={onChange}
        id={id}
        size="small"
        color={showWarning ? 'warning' : 'primary'}
        variant="contained"
        disabled={loading}
        sx={{
          opacity: loading ? 0.5 : 1,
          '& .MuiSwitch-thumb': {
            ...(loading && {
              animation: 'pulse 2s infinite 2s',
              '@keyframes pulse': {
                '0%': { transform: 'translateX(0px)' },
                '50%': { transform: 'translateX(-10px)' },
                '100%': { transform: 'translateX(0px)' },
              },
            }),
          },
        }}
      />
    </span>
  );

  if (showWarning) {
    return (
      <Tooltip
        className="layerstree-node-content__item-tooltip-warning"
        content={(
          <span>
            {translate('terralego.visualizer.layerstree.warningzoom.message', { minzoom: minZoomLayer })}
          </span>
        )}
        intent={Intent.WARNING}
        usePortal={false}
      >
        {switchEl}
      </Tooltip>
    );
  }

  return switchEl;
};

LayerSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  id: PropTypes.string,
  loading: PropTypes.bool,
  layer: PropTypes.object,
  isActive: PropTypes.bool,
};

LayerSwitch.defaultProps = {
  checked: false,
  onChange: () => {},
  id: undefined,
  loading: false,
  layer: null,
  isActive: false,
};

export default LayerSwitch;
