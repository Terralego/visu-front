import React, { useState, useEffect } from 'react';
import { Box, Tooltip } from '@mui/material';
import { Announcement as AnnouncementIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import FeatureProperties from '../../Map/FeatureProperties';
import api from '../../Api/services/api';

const ReportsIndicatorContent = ({ featureId, layerId, translate, onCountChange }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onCountChange(loading ? 0 : count);
  }, [count, loading, onCountChange]);

  useEffect(() => () => onCountChange(0), [onCountChange]);

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
            ordering: '-created_at',
            status: ['NEW', 'PENDING'],
          },
        });

        setCount(data.count || 0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[ReportsIndicator] Error fetching reports count:', error);
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
          top: 12,
          left: 12,
          zIndex: 80,
          backgroundColor: 'secondary.main',
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
};

ReportsIndicatorContent.propTypes = {
  featureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  translate: PropTypes.func.isRequired,
  onCountChange: PropTypes.func,
};

ReportsIndicatorContent.defaultProps = {
  featureId: null,
  layerId: null,
  onCountChange: () => {},
};

const ReportsIndicator = ({
  feature,
  fetchProperties,
  layerId,
  translate = a => a,
  onCountChange,
}) => (
  <FeatureProperties {...fetchProperties} properties={feature}>
    {({ properties: newProperties, ...staticProperties }) => {
      const featureId = newProperties ? staticProperties.id : null;

      return (
        <ReportsIndicatorContent
          featureId={featureId}
          layerId={layerId}
          translate={translate}
          onCountChange={onCountChange}
        />
      );
    }}
  </FeatureProperties>
);

ReportsIndicator.propTypes = {
  feature: PropTypes.shape(),
  fetchProperties: PropTypes.shape(),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  translate: PropTypes.func,
  onCountChange: PropTypes.func,
};

ReportsIndicator.defaultProps = {
  feature: {},
  fetchProperties: {},
  layerId: null,
  translate: a => a,
  onCountChange: undefined,
};

export default ReportsIndicator;
