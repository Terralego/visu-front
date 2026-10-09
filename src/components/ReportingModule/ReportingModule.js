import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import FeatureProperties from '../../terra-front/modules/Map/FeatureProperties';
import { checkTokenValidity } from '../../terra-front/utils/jwt';
import ReportingModuleContent from './ReportingModuleContent';

const ReportingModule = ({
  open = false,
  onClose,
  layer,
  featureGeometry = null,
  fetchProperties = {},
  mainField = null,
  isTableActive = false,
}) => {
  const reportConfigs = layer?.report_configs || [];

  const isAuthenticated = useMemo(() => {
    const token = global.localStorage.getItem('tf:auth:token');
    return token && checkTokenValidity(token);
  }, []);

  if (!isAuthenticated || reportConfigs.length === 0) {
    return null;
  }

  const hasValidFetchProperties = fetchProperties?.id && fetchProperties?.url;

  if (!hasValidFetchProperties) {
    return null;
  }

  return (
    <FeatureProperties {...fetchProperties}>
      {featureProperties => (
        <ReportingModuleContent
          open={open}
          onClose={onClose}
          layer={layer}
          featureGeometry={featureGeometry}
          fetchProperties={fetchProperties}
          mainField={mainField}
          isTableActive={isTableActive}
          reportConfigs={reportConfigs}
          featureProperties={featureProperties}
        />
      )}
    </FeatureProperties>
  );
};

ReportingModule.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  isTableActive: PropTypes.bool,
  layer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    report_configs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        fields: PropTypes.arrayOf(
          PropTypes.shape({
            sourceFieldId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string,
            helptext: PropTypes.string,
            format_type: PropTypes.string,
            required: PropTypes.bool,
            value: PropTypes.string,
          }),
        ),
      }),
    ),
  }),
  featureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  featureGeometry: PropTypes.shape({
    type: PropTypes.string,
    coordinates: PropTypes.arrayOf(PropTypes.number),
  }),
  fetchProperties: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    url: PropTypes.string,
  }),
  mainField: PropTypes.string,
};

ReportingModule.defaultProps = {
  open: false,
  layer: null,
  featureId: null,
  isTableActive: false,
  featureGeometry: null,
  fetchProperties: {},
  mainField: null,
};

export default ReportingModule;
