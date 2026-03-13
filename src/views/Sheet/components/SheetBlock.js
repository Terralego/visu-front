import React, { useState, useCallback, useEffect } from 'react';
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
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      '@media print': {
        gap: 0.5,
      },
    }}
  >
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
          '@media print': {
            py: 0.25,
          },
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          component="span"
          sx={{
            '@media print': {
              fontSize: '11px',
            },
          }}
        >
          <FieldLabel label={field.label} description={field.description} />
        </Typography>
        <Typography
          variant="body1"
          sx={{
            '@media print': {
              fontSize: '11px',
            },
          }}
        >
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

const BooleanIcon = ({ field }) => {
  const pictoUrl = field.value ? field.picto_true : field.picto_false;

  if (pictoUrl) {
    return (
      <Box
        component="img"
        src={pictoUrl}
        alt={field.label}
        sx={{
          width: 48,
          height: 48,
          objectFit: 'contain',
          '@media print': {
            width: 24,
            height: 24,
          },
        }}
      />
    );
  }

  return (
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
      {field.value ? <CheckIcon /> : <CloseIcon />}
    </Box>
  );
};

BooleanIcon.propTypes = {
  field: PropTypes.shape({
    value: PropTypes.bool,
    label: PropTypes.string,
    picto_true: PropTypes.string,
    picto_false: PropTypes.string,
  }).isRequired,
};

export const BooleansBlock = ({ fields }) => (
  <Grid
    container
    spacing={2}
    sx={{
      '@media print': {
        spacing: 1,
      },
    }}
  >
    {fields?.map(field => (
      <Grid item xs={6} sm={4} md={3} lg={2} key={field.id}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 0.5,
            '@media print': {
              gap: 0.25,
            },
          }}
        >
          <BooleanIcon field={field} />
          <Typography
            variant="caption"
            component="span"
            sx={{
              color: field.value ? 'text.primary' : 'text.secondary',
              lineHeight: 1.2,
              '@media print': {
                fontSize: '9px',
              },
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
  <Typography
    variant="body1"
    sx={{
      whiteSpace: 'pre-wrap',
      '@media print': {
        fontSize: '11px',
      },
    }}
  >
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
    <Table
      size="small"
      sx={{
        '@media print': {
          '& th, & td': {
            border: '1px solid #ddd !important',
            padding: '2px 4px !important',
            fontSize: '10px !important',
          },
        },
      }}
    >
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

const renderBlockContent = (block, { onPanoramaxEmpty, isPrintMode } = {}) => {
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
      return <PanoramaxBlock geometry={block.geometry} onEmpty={onPanoramaxEmpty} />;
    case 'RADAR_PLOT':
      return (
        <RadarPlotBlock
          fields={block.fields}
          featureData={block.featureData}
          featureName={block.featureName}
          comparisonData={block.comparisonData}
          isPrintMode={isPrintMode}
        />
      );
    case 'BAR_PLOT':
      return (
        <BarPlotBlock
          fields={block.fields}
          featureData={block.featureData}
          featureName={block.featureName}
          comparisonData={block.comparisonData}
          isPrintMode={isPrintMode}
        />
      );
    case 'DISTRIB_PLOT':
      return (
        <DistribPlotBlock
          fields={block.fields}
          featureData={block.featureData}
          isPrintMode={isPrintMode}
        />
      );
    default:
      return <PlaceholderBlock type={block.type || 'unknown'} />;
  }
};

const SheetBlock = ({ block, isPrintMode }) => {
  const [isPanoramaxHidden, setIsPanoramaxHidden] = useState(false);

  const handlePanoramaxEmpty = useCallback(() => {
    setIsPanoramaxHidden(true);
  }, []);

  useEffect(() => {
    if (block.type === 'PANORAMAX' && block.geometry) {
      setIsPanoramaxHidden(false);
    }
  }, [block.type, block.geometry]);

  if (block.type === 'PANORAMAX' && isPanoramaxHidden) {
    return null;
  }

  const hideOnPrint = ['MAP', 'PANORAMAX'].includes(block.type);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '@media print': {
          display: hideOnPrint ? 'none' : 'block',
          p: 1.5,
          mb: 1,
          boxShadow: 'none',
          border: 'none',
          borderBottom: '1px solid #ddd',
          borderRadius: 0,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        },
      }}
    >
      {block.display_title && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            color="primary.main"
            fontWeight="600"
            sx={{
              '@media print': {
                fontSize: '14px',
                mb: 0.5,
              },
            }}
          >
            {block.title}
          </Typography>
          <Divider
            sx={{
              mb: 2,
              '@media print': {
                mb: 1,
              },
            }}
          />
        </>
      )}
      {renderBlockContent(block, { onPanoramaxEmpty: handlePanoramaxEmpty, isPrintMode })}
    </Paper>
  );
};

SheetBlock.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    display_title: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    text: PropTypes.string,
    tableData: PropTypes.arrayOf(PropTypes.shape({})),
    // eslint-disable-next-line react/forbid-prop-types
    geometry: PropTypes.object,
  }).isRequired,
  isPrintMode: PropTypes.bool,
};

SheetBlock.defaultProps = {
  isPrintMode: false,
};

export default SheetBlock;
