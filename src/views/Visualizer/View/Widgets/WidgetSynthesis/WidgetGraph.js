import React from 'react';
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

function WidgetGraph({ data, type, loading }) {
  const theme = useTheme();
  const [highlightedItem, setHighLightedItem] = React.useState(null);

  const graphColorPalette = mode => ([
    theme.palette.primary.main,
    theme.palette.secondary.main,
    ...blueberryTwilightPalette(mode),
  ]);

  if (type === 'bar') {
    let biggestValue = 0;
    let longestLabel = '';
    data.forEach(d => {
      if (d.key.length > longestLabel.length) {
        longestLabel = d.key;
      }
      if (d.doc_count > biggestValue) {
        biggestValue = d.doc_count;
      }
    });
    const biggestValueDigits = biggestValue.toString().length;
    // Make sure the yAxis legend does not overlap with the axis values
    const leftOffset = biggestValueDigits >= 3 ? (biggestValueDigits - 2) * 10 : 0;
    // Automatically adapt graph height to take into account the labels length
    const graphHeight = 250 + longestLabel.length * 5;
    return (
      <BarChart
        dataset={data}
        xAxis={[{
          scaleType: 'band',
          dataKey: 'key',
          tickLabelStyle: {
            angle: 60,
            textAnchor: 'start',
            fontSize: 10,
          },
        }]}
        yAxis={[{
          label: 'Total',
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
            dataKey: 'doc_count',
            highlightScope: { highlight: 'item', fade: 'global' },
          },
        ]}
        height={graphHeight}
        width={GRAPH_WIDTH}
        margin={{
          left: 40 + leftOffset,
          right: 40,
          top: 10,
          bottom: 10 + longestLabel.length * 5,
        }}
        slotProps={{ legend: { hidden: true } }}
        slots={{ loadingOverlay: () => <LoadingOverlay height={graphHeight} /> }}
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
            data: data.map(d => ({ value: d.doc_count, label: d.key })),
            innerRadius: 30,
            paddingAngle: 2,
            cornerRadius: 5,
            highlightScope: { highlight: 'item', fade: 'global' },
          },
        ]}
        width={GRAPH_WIDTH}
        height={graphHeight}
        margin={{
          left: 40,
          right: 40,
          top: 10 + data.length * 10,
          bottom: 10,
        }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
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
