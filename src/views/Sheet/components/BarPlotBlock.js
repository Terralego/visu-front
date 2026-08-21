import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveBar } from '@nivo/bar';
import { Box, Typography } from '@mui/material';
import { CHART_COLORS } from '../../../mui-theme';

const BarPlotBlock = ({
  fields,
  featureData,
  featureName,
  comparisonData = [],
  isPrintMode = false,
}) => {
  const { data, keys } = useMemo(() => {
    const allFeatures = [
      { name: featureName, data: featureData, color: CHART_COLORS[0] },
      ...comparisonData,
    ];

    const barData = allFeatures.map((feature, idx) => {
      const item = {
        feature: feature.name,
        featureColor: feature.color || CHART_COLORS[idx % CHART_COLORS.length],
      };

      fields.forEach(field => {
        const rawValue = feature.data[field.field_name];
        const value = typeof rawValue === 'string'
          ? Number(rawValue.replace(/\s/g, ''))
          : Number(rawValue) || 0;
        item[field.label] = value;
      });

      return item;
    });

    return {
      data: barData,
      keys: fields.map(f => f.label),
    };
  }, [fields, featureData, featureName, comparisonData]);

  const renderTick = tick => (
    <g transform={`translate(${tick.x},${tick.y + 22})`}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: 12,
          fill: '#333',
        }}
      >
        {tick.value}
      </text>
    </g>
  );

  if (!data.length || !keys.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Données insuffisantes pour le graphique</Typography>
      </Box>
    );
  }

  const legendHeight = (20 + 2) * keys.length;

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
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy="feature"
        groupMode="stacked"
        layout="vertical"
        margin={{
          top: 20 + legendHeight,
          right: 20,
          bottom: 50,
          left: 70,
        }}
        padding={0.3}
        borderRadius={1}
        colors={CHART_COLORS}
        colorBy="id"
        borderColor="inherit:darker(1.6)"
        axisLeft={{
          legend: 'Effectifs',
          legendPosition: 'middle',
          legendOffset: -50,
        }}
        axisBottom={{
          tickPadding: 15,
          renderTick,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-left',
            direction: 'column',
            translateX: 0,
            translateY: -legendHeight - 10,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            symbolSize: 12,
          },
        ]}
        animate
        motionStiffness={90}
        motionDamping={15}
      />
    </Box>
  );
};

BarPlotBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
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

BarPlotBlock.defaultProps = {
  comparisonData: [],
  isPrintMode: false,
};

export default BarPlotBlock;
