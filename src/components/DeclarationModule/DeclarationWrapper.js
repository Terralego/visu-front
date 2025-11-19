import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../terra-front/modules/Api/services/api';
import DeclarationModule from './DeclarationModule';
import DeclarationControl from '../../views/Visualizer/View/DeclarationControl';

const DeclarationWrapper = ({
  map,
  isDeclarationModuleVisible,
  onToggleDeclarationModule,
  onMapClick,
  isTableActive,
  selectedLocation,
}) => {
  const [declarationConfig, setDeclarationConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [declarationControl, setDeclarationControl] = useState(null);

  // Load declaration configuration on mount
  useEffect(() => {
    const loadDeclarationConfig = async () => {
      try {
        setIsLoadingConfig(true);
        const config = await api.request('geolayer/declaration/config');

        // Check if config has declaration fields and they are not empty
        if (config && config.declaration_fields && config.declaration_fields.length > 0) {
          setDeclarationConfig(config);
        } else {
          setDeclarationConfig(null);
        }
      } catch (error) {
        // No config available or error - don't render anything
        // eslint-disable-next-line no-console
        console.debug('No declaration config available:', error);
        setDeclarationConfig(null);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadDeclarationConfig();
  }, []);

  // Add declaration control to map when config is available and map is ready
  useEffect(() => {
    if (map && declarationConfig && !declarationControl) {
      const control = new DeclarationControl(onToggleDeclarationModule);
      map.addControl(control, 'top-right');
      setDeclarationControl(control);
    }

    return () => {
      if (declarationControl && map) {
        try {
          map.removeControl(declarationControl);
        } catch (error) {
          // Control might already be removed
          // eslint-disable-next-line no-console
          console.debug('Declaration control already removed:', error);
        }
      }
    };
  }, [map, declarationConfig, onToggleDeclarationModule, declarationControl]);

  // Update control state when module visibility changes
  useEffect(() => {
    if (declarationControl) {
      declarationControl.updateState(isDeclarationModuleVisible);
    }
  }, [declarationControl, isDeclarationModuleVisible]);

  // Don't render anything if still loading or no config available
  if (isLoadingConfig || !declarationConfig) {
    return null;
  }

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
