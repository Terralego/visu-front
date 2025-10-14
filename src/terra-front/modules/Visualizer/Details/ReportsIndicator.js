import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { Announcement as AnnouncementIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import FeatureProperties from '../../Map/FeatureProperties';

const ReportsIndicator = ({ feature, fetchProperties, translate = a => a }) => {
  const extractReportsFromFeature = featureData => {
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
          <Tooltip
            title={translate(
              count > 1
                ? 'terralego.visualizer.reports.count_text_plural'
                : 'terralego.visualizer.reports.count_text',
              { count },
            )}
            arrow
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 80,
                backgroundColor: 'warning.main',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <AnnouncementIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
            </Box>
          </Tooltip>
        );
      }}
    </FeatureProperties>
  );
};

ReportsIndicator.propTypes = {
  feature: PropTypes.shape(),
  fetchProperties: PropTypes.shape(),
  translate: PropTypes.func,
};

ReportsIndicator.defaultProps = {
  feature: {},
  fetchProperties: {},
  translate: a => a,
};

export default ReportsIndicator;
