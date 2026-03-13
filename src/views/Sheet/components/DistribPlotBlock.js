import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ResponsivePie } from '@nivo/pie';
import { Box, Typography } from '@mui/material';
import { CHART_COLORS } from '../../../mui-theme';

const DistribPlotBlock = ({ fields, featureData, isPrintMode = false }) => {
  const [activeId, setActiveId] = useState(null);

  const commonSuffix = useMemo(() => {
    const suffixes = fields.map(f => f.suffix).filter(Boolean);
    if (suffixes.length > 0 && suffixes.every(s => s === suffixes[0])) {
      return suffixes[0];
    }
    return '%';
  }, [fields]);

  const { data, colorMap } = useMemo(() => {
    const rawValues = fields.map(field => ({
      field,
      value: Number(featureData[field.field_name]) || 0,
    })).filter(item => item.value > 0);

    const total = rawValues.reduce((sum, item) => sum + item.value, 0);

    const pieData = rawValues.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      return {
        id: item.field.field_name,
        label: item.field.label,
        value: Math.round(percentage * 10) / 10,
        rawValue: item.value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    const colors = {};
    fields.forEach((field, index) => {
      colors[field.field_name] = CHART_COLORS[index % CHART_COLORS.length];
    });

    return { data: pieData, colorMap: colors };
  }, [fields, featureData]);

  const getColor = id => {
    if (activeId && activeId !== id) {
      return 'rgb(200, 200, 200)';
    }
    return colorMap[id] || CHART_COLORS[0];
  };

  if (!data.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: isPrintMode ? 250 : 300,
        width: isPrintMode ? 350 : 'auto',
        '@media print': {
          width: '350px',
          height: '250px',
          maxWidth: '100%',
        },
      }}
    >
      <ResponsivePie
        data={data}
        sortByValue
        padAngle={1}
        cornerRadius={3}
        innerRadius={0.7}
        margin={{ top: 60, right: 120, bottom: 60, left: 120 }}
        colorBy={d => getColor(d.id)}
        borderWidth={1}
        borderColor="inherit:darker(0.5)"
        enableRadialLabels
        radialLabel={d => d.label}
        radialLabelsSkipAngle={15}
        enableSlicesLabels
        sliceLabel={d => `${d.value}${commonSuffix}`}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#fff"
        radialLabelsTextColor="#333"
        onMouseEnter={(d, e) => setActiveId(d.id)}
        onMouseLeave={() => setActiveId(null)}
        animate
        motionStiffness={90}
        motionDamping={15}
      />
    </Box>
  );
};

DistribPlotBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      suffix: PropTypes.string,
    }),
  ).isRequired,
  featureData: PropTypes.shape({}).isRequired,
  isPrintMode: PropTypes.bool,
};

DistribPlotBlock.defaultProps = {
  isPrintMode: false,
};

export default DistribPlotBlock;
