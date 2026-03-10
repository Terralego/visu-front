import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import FieldLabel from './FieldLabel';
import MapBlock from './MapBlock';
import PanoramaxBlock from './PanoramaxBlock';
import RadarPlotBlock from './RadarPlotBlock';
import BarPlotBlock from './BarPlotBlock';
import DistribPlotBlock from './DistribPlotBlock';

export const FieldsBlock = ({ fields }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {fields?.map(field => (
      <Box
        key={field.id}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" component="span">
          <FieldLabel label={field.label} description={field.description} />
        </Typography>
        <Typography variant="body1">
          {field.value || '-'}
          {field.suffix && ` ${field.suffix}`}
        </Typography>
      </Box>
    ))}
  </Box>
);

FieldsBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
      suffix: PropTypes.string,
    }),
  ),
};

FieldsBlock.defaultProps = {
  fields: [],
};

export const BooleansBlock = ({ fields }) => (
  <Grid container spacing={2}>
    {fields?.map(field => (
      <Grid item xs={6} sm={4} md={3} lg={2} key={field.id}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: field.value ? 'primary.main' : 'grey.300',
              color: field.value ? 'primary.contrastText' : 'grey.500',
            }}
          >
            {field.value ? (
              <CheckIcon />
            ) : (
              <CloseIcon />
            )}
          </Box>
          <Typography
            variant="caption"
            component="span"
            sx={{
              color: field.value ? 'text.primary' : 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            <FieldLabel label={field.label} description={field.description} />
          </Typography>
        </Box>
      </Grid>
    ))}
  </Grid>
);

BooleansBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      value: PropTypes.bool,
    }),
  ),
};

BooleansBlock.defaultProps = {
  fields: [],
};

export const TextBlock = ({ text }) => (
  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
    {text}
  </Typography>
);

TextBlock.propTypes = {
  text: PropTypes.string,
};

TextBlock.defaultProps = {
  text: '',
};

export const FieldsTableBlock = ({ fields, tableData }) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          {fields?.map(field => (
            <TableCell key={field.id} sx={{ fontWeight: 'bold' }}>
              <FieldLabel label={field.label} description={field.description} />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {tableData?.map((row, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <TableRow key={idx}>
            {fields?.map(field => (
              <TableCell key={field.id}>{row[field.field_name] || '-'}</TableCell>
            ))}
          </TableRow>
        ))}
        {(!tableData || tableData.length === 0) && (
          <TableRow>
            <TableCell
              colSpan={fields?.length || 1}
              sx={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}
            >
              Aucune donnée
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

FieldsTableBlock.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      field_name: PropTypes.string.isRequired,
    }),
  ),
  tableData: PropTypes.arrayOf(PropTypes.shape({})),
};

FieldsTableBlock.defaultProps = {
  fields: [],
  tableData: [],
};

export const PlaceholderBlock = ({ type }) => (
  <Alert severity="info" sx={{ mt: 1 }}>
    Bloc de type &quot;{type}&quot; - À implémenter
  </Alert>
);

PlaceholderBlock.propTypes = {
  type: PropTypes.string.isRequired,
};

const renderBlockContent = block => {
  switch (block.type) {
    case 'FIELDS':
      return <FieldsBlock fields={block.fields} />;
    case 'BOOLEANS':
      return <BooleansBlock fields={block.fields} />;
    case 'TEXT':
      return <TextBlock text={block.text} />;
    case 'FIELDS_TABLE':
      return <FieldsTableBlock fields={block.fields} tableData={block.tableData} />;
    case 'MAP':
      return (
        <MapBlock
          firstGeometries={block.firstGeometries}
          secondGeometries={block.secondGeometries}
        />
      );
    case 'PANORAMAX':
      return <PanoramaxBlock geometry={block.geometry} />;
    case 'RADAR_PLOT':
      return (
        <RadarPlotBlock
          fields={block.fields}
          featureData={block.featureData}
          featureName={block.featureName}
          comparisonData={block.comparisonData}
        />
      );
    case 'BAR_PLOT':
      return (
        <BarPlotBlock
          fields={block.fields}
          featureData={block.featureData}
          featureName={block.featureName}
          comparisonData={block.comparisonData}
        />
      );
    case 'DISTRIB_PLOT':
      return (
        <DistribPlotBlock
          fields={block.fields}
          featureData={block.featureData}
        />
      );
    default:
      return <PlaceholderBlock type={block.type || 'unknown'} />;
  }
};

const SheetBlock = ({ block }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      mb: 2,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
    }}
  >
    {block.display_title && (
      <>
        <Typography variant="h6" gutterBottom color="primary.main" fontWeight="600">
          {block.title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </>
    )}
    {renderBlockContent(block)}
  </Paper>
);

SheetBlock.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    display_title: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    text: PropTypes.string,
    tableData: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default SheetBlock;
