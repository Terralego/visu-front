import { ChevronLeft, ChevronRight, Close as CloseIcon } from '@mui/icons-material';
import { Box, Drawer, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import ErrorBoundary from '../../../components/ErrorBoundary';
import FeatureProperties from '../../Map/FeatureProperties';
import Template from '../../Template';

const Details = ({
  features = [],
  feature,
  interaction,
  visible,
  onClose = () => null,
  onChange = () => {},
  enableCarousel = true,
  isTableActive = false,
  translate = a => a,
}) => {
  const [index, setIndex] = useState(-1);

  // Update index when feature ID changes
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    const featureId = feature && feature.properties && feature.properties._id;
    if (featureId && features.length) {
      const newIndex = features.findIndex(({ _id }) => _id === featureId);
      setIndex(newIndex);
    }
  }, [feature, features]);

  const getIndexFeature = currentIndex => {
    const featuresLength = features.length;
    if (currentIndex <= -1) {
      return featuresLength - 1;
    }
    if (currentIndex === featuresLength) {
      return 0;
    }
    return currentIndex;
  };

  const handleChange = direction => {
    const newIndex = getIndexFeature(index + direction);
    const newFeature = features[newIndex];
    if (newFeature) {
      // eslint-disable-next-line no-underscore-dangle
      onChange(newFeature._id);
      setIndex(newIndex);
    }
  };

  const isCarousel = enableCarousel && features.length > 1;
  const featureToDisplay =
    features.length > 0 && index !== -1 ? features[index] : feature && feature.properties;
  const { template, fetchProperties = {}, templates = [] } = interaction || {};

  const normalizedTemplates =
    // eslint-disable-next-line no-nested-ternary
    templates.length > 0 ? templates : template ? [{ template, fetchProperties }] : [];

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={visible}
      sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          zIndex: 79,
          width: 400,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          margin: 1,
          height: isTableActive ? '66vh' : 'calc(100vh - 16px)',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            borderBottom: '1px solid #e0e0e0',
            margin: 1,
            marginBottom: 0,
            paddingBottom: 1,
          }}
        >
          {isCarousel && (
            <>
              <IconButton onClick={() => handleChange(-1)} size="small">
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => handleChange(1)} size="small">
                <ChevronRight />
              </IconButton>
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {featureToDisplay && (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'hidden',
              overflowY: 'auto',
              height: '100%',
            }}
          >
            <Box
              sx={{
                padding: '8px 32px',
                flex: 'auto',
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  '& .details': {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  },
                  '& .details__title': {
                    textAlign: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 300,
                  },
                  '& .details__group': {
                    marginTop: '8px',
                  },
                  '& .details__list': {
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  '& .details__list__amenity': {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 0,
                  },
                  '& .details__list__amenity__img': {
                    width: '36px',
                    height: '36px',
                  },
                  '& .details__times': {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    padding: 0,
                  },
                  '& .details__column': {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                  },
                  '& .details__column-label': {
                    paddingBottom: '8px',
                    paddingRight: '8px',
                    whiteSpace: 'nowrap',
                    opacity: 0.65,
                  },
                  '& .details__column-value': {
                    minWidth: '40%',
                    paddingBottom: '10px',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  },
                  '& .details__link': {
                    marginTop: '56px',
                    textAlign: 'center',
                    '& a': {
                      background: '#fff',
                      padding: '12px',
                      border: '1px solid rgba(10, 6, 77, 0.35)',
                    },
                  },
                  '& .details__subtitle': {
                    color: theme => theme.palette.primary.dark,
                    fontWeight: 700,
                    opacity: 0.8,
                  },
                }}
              >
                {normalizedTemplates.map((templateItem, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Box key={idx} sx={{ mb: idx < normalizedTemplates.length - 1 ? 2 : 0 }}>
                    <FeatureProperties
                      {...templateItem.fetchProperties}
                      properties={featureToDisplay}
                    >
                      {({ properties: newProperties, ...staticProperties }) => (
                        <ErrorBoundary errorMsg={translate('terralego.map.template.render.error')}>
                          <Template
                            template={templateItem.template}
                            {...staticProperties}
                            {...newProperties}
                          />
                        </ErrorBoundary>
                      )}
                    </FeatureProperties>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

const propFeature = PropTypes.shape({
  properties: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    _id: PropTypes.any,
  }),
});
Details.propTypes = {
  feature: propFeature,
  interaction: PropTypes.shape({
    template: PropTypes.string,
    fetchProperties: PropTypes.shape(),
  }),
  features: PropTypes.arrayOf(propFeature),
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  enableCarousel: PropTypes.bool,
  isTableActive: PropTypes.bool,
  visible: PropTypes.bool,
  translate: PropTypes.func,
};

Details.defaultProps = {
  onChange: () => {},
  onClose: () => null,
  enableCarousel: true,
  features: [],
  feature: undefined,
  interaction: undefined,
  isTableActive: false,
  visible: false,
  translate: a => a,
};

export default Details;
