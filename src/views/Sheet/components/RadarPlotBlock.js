import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveRadar } from '@nivo/radar';
import { Box, Typography } from '@mui/material';
import { CHART_COLORS } from '../../../mui-theme';

const RadarPlotBlock = ({
  fields,
  extraFields = [],
  featureData,
  featureName,
  comparisonData = [],
  isPrintMode = false,
}) => {
  const { data, keys, colors } = useMemo(() => {
    const hasExtraDim = extraFields.length > 0 && extraFields.length === fields.length;

    const allFeatures = [
      { name: featureName, data: featureData, color: CHART_COLORS[0] },
      ...comparisonData,
    ];

    const seriesEntries = hasExtraDim
      ? allFeatures.flatMap((f, idx) => [
        {
          key: f.name,
          fieldSet: fields,
          scale: 100,
          data: f.data,
          color: f.color || CHART_COLORS[(idx * 2) % CHART_COLORS.length],
        },
        {
          key: 'Médiane',
          fieldSet: extraFields,
          scale: 1,
          data: f.data,
          color: CHART_COLORS[(idx * 2 + 1) % CHART_COLORS.length],
        },
      ])
      : allFeatures.map((f, idx) => ({
        key: f.name,
        fieldSet: fields,
        scale: 100,
        data: f.data,
        color: f.color || CHART_COLORS[idx % CHART_COLORS.length],
      }));

    const radarData = fields
      .map((field, i) => {
        const axis = { label: field.label };

        seriesEntries.forEach(s => {
          const fieldRef = s.fieldSet[i];
          if (!fieldRef) return;
          const value = Number(s.data[fieldRef.field_name]) || 0;
          axis[s.key] = Math.round(value * s.scale * 100) / 100;
        });

        return axis;
      });

    const filtered = radarData.filter(axis => !Object.values(axis).some(
      v => typeof v === 'number' && (Number.isNaN(v) || v < 0 || v > 100),
    ));

    return {
      data: filtered,
      keys: seriesEntries.map(s => s.key),
      colors: seriesEntries.map(s => s.color),
    };
  }, [fields, extraFields, featureData, featureName, comparisonData]);

  if (!data.length || !keys.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Données insuffisantes pour le radar</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: isPrintMode ? 300 : 400,
        width: isPrintMode ? 650 : 'auto',
        '@media print': {
          width: '650px',
          height: '300px',
          maxWidth: '100%',
        },
      }}
    >
      <ResponsiveRadar
        data={data}
        keys={keys}
        indexBy="label"
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        maxValue={100}
        gridLevels={5}
        gridShape="circular"
        colors={colors}
        colorBy="key"
        borderWidth={2}
        borderColor="inherit"
        dotSize={8}
        dotColor="inherit:darker(0.3)"
        dotBorderWidth={2}
        dotBorderColor="inherit"
        enableDots={false}
        enableDotLabel={false}
        fillOpacity={0.25}
        animate
        motionStiffness={90}
        motionDamping={15}
        legends={[
          {
            anchor: 'top-left',
            direction: 'column',
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: '#999',
            symbolSize: 12,
            symbolShape: 'circle',
          },
        ]}
      />
    </Box>
  );
};

RadarPlotBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  extraFields: PropTypes.arrayOf(
    PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  featureData: PropTypes.shape({}).isRequired,
  featureName: PropTypes.string.isRequired,
  comparisonData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.shape({}).isRequired,
      color: PropTypes.string,
    }),
  ),
  isPrintMode: PropTypes.bool,
};

RadarPlotBlock.defaultProps = {
  extraFields: [],
  comparisonData: [],
  isPrintMode: false,
};

export default RadarPlotBlock;
