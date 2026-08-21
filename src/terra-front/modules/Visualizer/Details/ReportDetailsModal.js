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
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import LocationPicker from '../../../../components/ReportingModule/LocationPicker';

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
          borderRadius: 1,
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
                        <ListItemText primary={item.helpText || item.label || 'Champ'} sx={{ my: 0.5 }} />
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
    status: PropTypes.oneOf(['NEW', 'PENDING', 'ACCEPTED', 'REJECTED']),
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

export default ReportDetailsModal;
