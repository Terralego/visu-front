import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import GraphChart from '../GraphChart';
import getChartData from '../chartData';

export const ChartBlock = ({ block: { label, graph, series }, properties }) => {
  const { t: translate } = useTranslation();
  const data = getChartData(series, properties);

  return (
    <Box>
      {label && <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{label}</Typography>}
      {data.length
        ? <GraphChart graph={graph} data={data} />
        : (
          <Typography variant="caption" color="text.secondary" component="p" sx={{ textAlign: 'center' }}>
            {translate('terralego.visualizer.minisheet.no_data')}
          </Typography>
        )}
    </Box>
  );
};

export default ChartBlock;
