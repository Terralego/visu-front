import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FeatureProperties from '../../Map/FeatureProperties';

const ReportsCount = ({ feature, fetchProperties, translate = a => a }) => {
  const extractReportsFromFeature = featureData => {
    // Chercher les données de reports dans les différentes propriétés possibles
    if (featureData?.reports?.count !== undefined) {
      return featureData.reports.count;
    }
    if (featureData?.properties?.reports?.count !== undefined) {
      return featureData.properties.reports.count;
    }
    return 0;
  };

  return (
    <FeatureProperties {...fetchProperties} properties={feature}>
      {({ properties: newProperties, ...staticProperties }) => {
        const allProperties = { ...staticProperties, ...newProperties };
        const count = extractReportsFromFeature(allProperties);

        if (count === 0) {
          return null;
        }

        return (
          <>
            <Box sx={{ mt: 2, mb: 1, borderTop: '1px solid #e0e0e0' }} />
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Box component="span" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                {translate(
                  count > 1
                    ? 'terralego.visualizer.reports.count_text_plural'
                    : 'terralego.visualizer.reports.count_text',
                  { count },
                )}
              </Box>
            </Box>
          </>
        );
      }}
    </FeatureProperties>
  );
};

ReportsCount.propTypes = {
  feature: PropTypes.shape(),
  fetchProperties: PropTypes.shape(),
  translate: PropTypes.func,
};

ReportsCount.defaultProps = {
  feature: {},
  fetchProperties: {},
  translate: a => a,
};

export default ReportsCount;
