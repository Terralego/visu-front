import React from 'react';
import PropTypes from 'prop-types';
import FeatureProperties from '../../Map/FeatureProperties';
import ReportsListContent from './ReportsListContent';

const ReportsList = ({ feature, fetchProperties, layerId, translate = a => a }) => (
  <FeatureProperties {...fetchProperties} properties={feature}>
    {({ properties: newProperties, ...staticProperties }) => {
      const allProperties = { ...staticProperties, ...newProperties };
      const featureId = allProperties.id;

      return <ReportsListContent featureId={featureId} layerId={layerId} translate={translate} />;
    }}
  </FeatureProperties>
);

ReportsList.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  fetchProperties: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    url: PropTypes.string,
  }),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  translate: PropTypes.func,
};

ReportsList.defaultProps = {
  feature: {},
  fetchProperties: {},
  layerId: null,
  translate: a => a,
};

export default ReportsList;
