import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import api from '../../Api/services/api';
import ReportDetailsModal from './ReportDetailsModal';

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
        // eslint-disable-next-line no-console
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

export default ReportsListContent;
