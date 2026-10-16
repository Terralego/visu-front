import React from 'react';
import PropTypes from 'prop-types';
import DeclarationModule from './DeclarationModule';
import useDeclarationConfig from './useDeclarationConfig';

const DeclarationWrapper = ({
  map,
  isDeclarationModuleVisible,
  onToggleDeclarationModule,
  onMapClick,
  isTableActive,
  selectedLocation,
}) => {
  const declarationConfig = useDeclarationConfig();

  if (!declarationConfig) return null;

  return (
    <DeclarationModule
      isTableActive={isTableActive}
      open={isDeclarationModuleVisible}
      onClose={onToggleDeclarationModule}
      onMapClick={onMapClick}
      selectedLocation={selectedLocation}
      declarationConfig={declarationConfig}
    />
  );
};

DeclarationWrapper.propTypes = {
  map: PropTypes.shape({}),
  isTableActive: PropTypes.bool,
  isDeclarationModuleVisible: PropTypes.bool.isRequired,
  onToggleDeclarationModule: PropTypes.func.isRequired,
  onMapClick: PropTypes.func.isRequired,
  selectedLocation: PropTypes.shape({
    lng: PropTypes.number,
    lat: PropTypes.number,
  }),
};

DeclarationWrapper.defaultProps = {
  isTableActive: false,
  map: null,
  selectedLocation: null,
};

export default DeclarationWrapper;
