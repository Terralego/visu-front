import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import LocationPicker from '../../../../components/ReportingModule/LocationPicker';
import api from '../../Api/services/api';
import FeatureProperties from '../../Map/FeatureProperties';

const statusColors = {
  NEW: 'info',
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
};

const statusLabels = {
  NEW: 'Nouveau',
  PENDING: 'En cours',
  ACCEPTED: 'Accepté',
  REJECTED: 'Rejeté',
};

const ReportDetailsModal = ({ open, onClose, report }) => {
  if (!report) return null;

  const location =
    report.geom && report.geom.type === 'Point'
      ? {
        lat: report.geom.coordinates[1],
        lng: report.geom.coordinates[0],
      }
      : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            mb: 2,
            pb: 1.25,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Détails du signalement
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, mb: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Date de création
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {report.created_at}
              </Typography>
            </Box>
            <Chip
              label={statusLabels[report.status] || report.status}
              color={statusColors[report.status] || 'default'}
              size="small"
            />
          </Box>

          {report.content && report.content.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Contenu du signalement
              </Typography>
              <List sx={{ p: 0 }}>
                {report.content.map((item, index) => (
                  <ListItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    disablePadding
                    sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}
                  >
                    {item.free_comment ? (
                      <>
                        <ListItemText
                          primary="Commentaire libre"
                          secondary="Ajoutez ici tout commentaire supplémentaire"
                          sx={{ my: 0.5 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          type="text"
                          variant="outlined"
                          multiline
                          rows={2}
                          value={item.free_comment}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              cursor: 'default',
                            },
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <ListItemText primary={item.label || 'Champ'} sx={{ my: 0.5 }} />
                        <TextField
                          fullWidth
                          size="small"
                          type="text"
                          variant="outlined"
                          multiline
                          rows={2}
                          value={item.content || ''}
                          helperText={item.value ? `Champ source : ${item.value}` : ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              cursor: 'default',
                            },
                          }}
                        />
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {location && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Localisation
              </Typography>
              <LocationPicker value={location} onChange={() => {}} readOnly />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 0, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Fermer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

ReportDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created_at: PropTypes.string,
    status: PropTypes.string,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        content: PropTypes.string,
        sourceFieldId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        free_comment: PropTypes.string,
      }),
    ),
    geom: PropTypes.shape({
      type: PropTypes.string,
      coordinates: PropTypes.arrayOf(PropTypes.number),
    }),
  }),
};

ReportDetailsModal.defaultProps = {
  report: null,
};

const ReportsListContent = ({ featureId, layerId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchReports = async () => {
      if (!featureId || !layerId) {
        setReports([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.request('geolayer/reports/', {
          querystring: {
            feature: featureId,
            layer: layerId,
            page,
            page_size: pageSize,
            status: ['NEW', 'PENDING'],
            ordering: '-created_at',
          },
        });

        const newReports = data.results || [];

        if (page === 1) {
          setReports(newReports);
        } else {
          setReports(prev => [...prev, ...newReports]);
        }

        setTotalCount(data.count || 0);
        setHasMore(!!data.next);
      } catch (error) {
        console.error('[ReportsList] Error fetching reports:', error);
        if (page === 1) {
          setReports([]);
          setTotalCount(0);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [featureId, layerId, page]);

  // Reset page when featureId or layerId changes
  useEffect(() => {
    setPage(1);
    setReports([]);
  }, [featureId, layerId]);

  const handleReportClick = report => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (!loading && totalCount === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ mt: 2, mb: 1, borderTop: '1px solid #e0e0e0' }} />
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Signalements ({totalCount})
        </Typography>
        <List sx={{ p: 0 }}>
          {reports.map((report, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={`${report.id || index}-${index}`} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleReportClick(report)}
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  py: 1,
                  px: 1.5,
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                }}
              >
                <ListItemText
                  primary={(
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {report.created_at}
                      </Typography>
                      <Chip
                        label={statusLabels[report.status] || report.status}
                        color={statusColors[report.status] || 'default'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  )}
                  sx={{ m: 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="text"
              size="small"
              color="primary"
              onClick={handleLoadMore}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? 'Chargement...' : 'Charger plus'}
            </Button>
          </Box>
        )}
      </Box>
      <ReportDetailsModal open={modalOpen} onClose={handleCloseModal} report={selectedReport} />
    </>
  );
};

ReportsListContent.propTypes = {
  featureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ReportsListContent.defaultProps = {
  featureId: null,
  layerId: null,
};

const ReportsList = ({ feature, fetchProperties, layerId, translate = a => a }) => (
  <FeatureProperties {...fetchProperties} properties={feature}>
    {({ properties: newProperties, ...staticProperties }) => {
      const allProperties = { ...staticProperties, ...newProperties };
      const featureId = allProperties.id;

      return <ReportsListContent featureId={featureId} layerId={layerId} translate={translate} />;
    }}
  </FeatureProperties>
);

ReportsList.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  fetchProperties: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    url: PropTypes.string,
  }),
  layerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  translate: PropTypes.func,
};

ReportsList.defaultProps = {
  feature: {},
  fetchProperties: {},
  layerId: null,
  translate: a => a,
};

export default ReportsList;
