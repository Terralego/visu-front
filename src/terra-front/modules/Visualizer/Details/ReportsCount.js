import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FeatureProperties from '../../Map/FeatureProperties';
import api from '../../Api/services/api';

const ReportsCountContent = ({ featureId, layerId, translate }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReportsCount = async () => {
      if (!featureId || !layerId) {
        setCount(0);
        return;
      }

      setLoading(true);
      try {
        const data = await api.request('geolayer/reports/', {
          querystring: {
            feature: featureId,
            layer: layerId,
            status: ['NEW', 'PENDING'],
            ordering: '-created_at',
          },
        });

        setCount(data.count || 0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[ReportsCount] Error fetching reports count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsCount();
  }, [featureId, layerId]);

  if (loading || count === 0) {
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
};

ReportsCountContent.propTypes = {
  featureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  translate: PropTypes.func.isRequired,
};

ReportsCountContent.defaultProps = {
  featureId: null,
  layerId: null,
};

const ReportsCount = ({ feature, fetchProperties, layerId, translate = a => a }) => (
  <FeatureProperties {...fetchProperties} properties={feature}>
    {({ properties: newProperties, ...staticProperties }) => {
      const allProperties = { ...staticProperties, ...newProperties };
      const featureId = allProperties.id;

      return <ReportsCountContent featureId={featureId} layerId={layerId} translate={translate} />;
    }}
  </FeatureProperties>
);

ReportsCount.propTypes = {
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

ReportsCount.defaultProps = {
  feature: {},
  fetchProperties: {},
  layerId: null,
  translate: a => a,
};

export default ReportsCount;
