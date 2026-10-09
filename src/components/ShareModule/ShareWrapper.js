import React from 'react';
import PropTypes from 'prop-types';
import ShareModule from './ShareModule';

const ShareWrapper = ({ map, isShareModuleVisible, onToggleShareModule, layersTreeState }) => (
  <ShareModule
    open={isShareModuleVisible}
    map={map}
    onClose={onToggleShareModule}
    layersTreeState={layersTreeState}
  />
);

ShareWrapper.propTypes = {
  map: PropTypes.shape({}),
  isShareModuleVisible: PropTypes.bool.isRequired,
  onToggleShareModule: PropTypes.func.isRequired,
  layersTreeState: PropTypes.instanceOf(Map),
};

ShareWrapper.defaultProps = {
  map: null,
  layersTreeState: new Map(),
};

export default ShareWrapper;
