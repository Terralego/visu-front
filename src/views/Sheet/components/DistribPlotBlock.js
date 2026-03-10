import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ResponsivePie } from '@nivo/pie';
import { Box, Typography } from '@mui/material';
import { CHART_COLORS } from '../../../mui-theme';

const LegendItem = ({ color, label, isActive, onMouseEnter, onMouseLeave }) => (
  <Box
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    sx={{
      display: 'flex',
      alignItems: 'center',
      mx: 0.5,
      opacity: isActive ? 1 : 0.5,
      transition: 'opacity 250ms ease',
      cursor: 'default',
      fontSize: '0.8em',
    }}
  >
    <Box
      sx={{
        width: 12,
        height: 12,
        backgroundColor: color,
        mr: 0.75,
        borderRadius: 0.5,
      }}
    />
    {label}
  </Box>
);

LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
};

const DistribPlotBlock = ({ fields, featureData }) => {
  const [activeId, setActiveId] = useState(null);

  const { data, colorMap } = useMemo(() => {
    let total = 0;
    const counts = {};

    fields.forEach(field => {
      const value = Number(featureData[field.field_name]) || 0;
      if (value > 0) {
        counts[field.field_name] = value;
        total += value;
      }
    });

    const pieData = fields
      .filter(field => counts[field.field_name] > 0)
      .map((field, index) => ({
        id: field.field_name,
        label: field.label,
        value: Number(((counts[field.field_name] / total) * 100).toFixed(1)),
        realValue: counts[field.field_name],
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

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
    <Box>
      <Box sx={{ height: 300 }}>
        <ResponsivePie
          data={data}
          sortByValue
          padAngle={1}
          cornerRadius={3}
          innerRadius={0.7}
          margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
          colorBy={d => getColor(d.id)}
          borderWidth={1}
          borderColor="inherit:darker(0.5)"
          enableRadialLabels
          radialLabel={d => `${d.value} %`}
          radialLabelsSkipAngle={15}
          enableSlicesLabels
          sliceLabel={d => d.label}
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333"
          onMouseEnter={(d, e) => setActiveId(d.id)}
          onMouseLeave={() => setActiveId(null)}
          animate
          motionStiffness={90}
          motionDamping={15}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: 700,
          mx: 'auto',
          p: 2,
          justifyContent: 'center',
        }}
      >
        {fields.map(field => (
          <LegendItem
            key={field.field_name}
            color={colorMap[field.field_name]}
            label={field.label}
            isActive={!activeId || activeId === field.field_name}
            onMouseEnter={() => setActiveId(field.field_name)}
            onMouseLeave={() => setActiveId(null)}
          />
        ))}
      </Box>
    </Box>
  );
};

DistribPlotBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  featureData: PropTypes.shape({}).isRequired,
};

export default DistribPlotBlock;
