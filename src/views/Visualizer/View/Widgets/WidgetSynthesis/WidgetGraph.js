import React, { useCallback } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { blueberryTwilightPalette } from '@mui/x-charts/colorPalettes';
import { Typography, useTheme } from '@mui/material';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import Loading from './Loading';

const GRAPH_WIDTH = 280;

function LoadingOverlay({ height }) {
  return (
    <g>
      <foreignObject width={GRAPH_WIDTH} height={height}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <Loading />
        </div>
      </foreignObject>
    </g>
  );
}

function WidgetGraph({ data: originalData, type, loading, isPercent, unit, decimals }) {
  const theme = useTheme();
  const [highlightedItem, setHighLightedItem] = React.useState(null);

  const graphColorPalette = mode => ([
    theme.palette.primary.main,
    theme.palette.secondary.main,
    ...blueberryTwilightPalette(mode),
  ]);

  let data = originalData;
  if (isPercent) {
    const total = originalData.reduce((prev, curr) => prev + curr.value, 0);
    data = originalData.map(d => ({ label: d.label, value: (d.value / total) * 100 }));
  }

  const valueFormatter = useCallback(value => {
    if (value === null) {
      return null;
    }
    let displayValue = value
    if (decimals !== undefined && decimals !== null) {
      displayValue = value.toFixed(decimals);
    }
    if (isPercent) {
      return `${displayValue} %`;
    }
    if (unit) {
      return `${displayValue} (${unit})`;
    }
    return displayValue;
  }, [decimals, isPercent, unit]);

  let biggestValue = 0;
  let longestLabel = '';
  data.forEach(d => {
    if (d.label.length > longestLabel.length) {
      longestLabel = d.label;
    }
    if (d.value > biggestValue) {
      biggestValue = d.value;
    }
  });
  const biggestValueDigits = biggestValue.toFixed(1).length;
  // Make sure the yAxis legend on bar charts does not overlap with the axis values
  const leftOffset = biggestValueDigits >= 3 ? (biggestValueDigits - 2) * 10 : 0;
  // Automatically adapt graph height to take into account the labels length
  const barGraphHeight = 250 + longestLabel.length * 5;

  const getYLabel = () => {
    if (isPercent) {
      return 'Total (%)';
    }
    if (unit) {
      return `Total (${unit})`;
    }
    return 'Total';
  };

  if (type === 'bars') {
    return (
      <BarChart
        dataset={data}
        xAxis={[{
          scaleType: 'band',
          dataKey: 'label',
          tickLabelStyle: {
            angle: 60,
            textAnchor: 'start',
            fontSize: 10,
          },
        }]}
        yAxis={[{
          label: getYLabel(),
        }]}
        sx={
          {
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              // Move the y-axis label with CSS
              transform: `translateX(-${leftOffset}px)`,
            },
          }
        }
        series={[
          {
            dataKey: 'value',
            highlightScope: { highlight: 'item', fade: 'global' },
            valueFormatter,
          },
        ]}
        height={barGraphHeight}
        width={GRAPH_WIDTH}
        margin={{
          left: 40 + leftOffset,
          right: 40,
          top: 10,
          bottom: 10 + longestLabel.length * 5,
        }}
        slotProps={{ legend: { hidden: true } }}
        slots={{ loadingOverlay: () => <LoadingOverlay height={barGraphHeight} /> }}
        colors={graphColorPalette}
        loading={loading}
        highlightedItem={highlightedItem}
        onHighlightChange={setHighLightedItem}
      />
    );
  }

  if (type === 'stacked-bars') {
    const stackedData = [{ label: '' }];
    data.forEach(d => {
      stackedData[0][d.label] = d.value
    });
    return (
      <BarChart
        dataset={stackedData}
        xAxis={[{
          scaleType: 'band',
          dataKey: 'label',
        }]}
        yAxis={[{
          label: getYLabel(),
        }]}
        sx={
          {
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              // Move the y-axis label with CSS
              transform: `translateX(-${leftOffset}px)`,
            },
          }
        }
        series={data.map(d => ({
          dataKey: d.label,
          label: d.label,
          stack: 'stack',
          highlightScope: { highlight: 'item', fade: 'global' },
          valueFormatter,
        }))}
        tooltip={{ trigger: 'item' }}
        height={barGraphHeight}
        width={GRAPH_WIDTH}
        margin={{
          left: 40 + leftOffset,
          right: 40,
          top: 10,
          bottom: 10 + data.length * 10,
        }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
            itemMarkHeight: 5,
            itemGap: 5,
            labelStyle: {
              fontSize: 12,
            },
          },
        }}
        slots={{ loadingOverlay: () => <LoadingOverlay height={barGraphHeight} /> }}
        colors={graphColorPalette}
        loading={loading}
        highlightedItem={highlightedItem}
        onHighlightChange={setHighLightedItem}
      />
    );
  }

  if (type === 'pie') {
    // Automatically adapt graph graph height totake into account the size of the legend
    const graphHeight = 250 + data.length * 10;
    return (
      <PieChart
        series={[
          {
            data,
            innerRadius: 30,
            paddingAngle: 2,
            cornerRadius: 5,
            highlightScope: { highlight: 'item', fade: 'global' },
            valueFormatter: v => valueFormatter(v.value),
          },
        ]}
        width={GRAPH_WIDTH}
        height={graphHeight}
        margin={{
          left: 40,
          right: 40,
          top: 10,
          bottom: 10 + data.length * 10,
        }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
            itemMarkHeight: 5,
            itemGap: 5,
            labelStyle: {
              fontSize: 12,
            },
          },
        }}
        slots={{ loadingOverlay: () => <LoadingOverlay height={graphHeight} /> }}
        colors={graphColorPalette}
        loading={loading}
        highlightedItem={highlightedItem}
        onHighlightChange={setHighLightedItem}
      />
    );
  }

  return <Typography color="error">Error: Unkown graph type '{type}'</Typography>;
}

export default WidgetGraph;
