import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ShareModule from './ShareModule';
import ShareControl from '../../views/Visualizer/View/ShareControl';

const ShareWrapper = ({ map, isShareModuleVisible, onToggleShareModule }) => {
  const [shareControl, setShareControl] = useState(null);

  // Add share control to map when map is ready
  useEffect(() => {
    if (map && !shareControl) {
      const control = new ShareControl(onToggleShareModule);
      map.addControl(control, 'top-right');
      setShareControl(control);
    }

    return () => {
      if (shareControl && map) {
        try {
          map.removeControl(shareControl);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.debug('Share control already removed:', error);
        }
      }
    };
  }, [map, onToggleShareModule, shareControl]);

  // Update control state when module visibility changes
  useEffect(() => {
    if (shareControl) {
      shareControl.updateState(isShareModuleVisible);
    }
  }, [shareControl, isShareModuleVisible]);

  useEffect(() => {
  }, [onToggleShareModule]);

  return (
    <ShareModule
      open={isShareModuleVisible}
      map={map}
      onClose={onToggleShareModule}
    />
  );
};

ShareWrapper.propTypes = {
  map: PropTypes.shape({
    addControl: PropTypes.func,
    removeControl: PropTypes.func,
  }),
  isShareModuleVisible: PropTypes.bool.isRequired,
  onToggleShareModule: PropTypes.func.isRequired,
};

ShareWrapper.defaultProps = {
  map: null,
};

export default ShareWrapper;
