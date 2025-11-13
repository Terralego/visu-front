import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const PreviewIFrame = ({ open, onClose, embedCode, iframeWidth, iframeHeight }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={false}
    PaperProps={{
      sx: {
        width: iframeWidth + 80,
        height: iframeHeight + 140,
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 40px)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(4px)',
      },
    }}
  >
    <DialogTitle
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      Prévisualisation de l'iframe
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box
        sx={{
          width: iframeWidth,
          height: iframeHeight,
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </DialogContent>
  </Dialog>
);

PreviewIFrame.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  embedCode: PropTypes.string.isRequired,
  iframeWidth: PropTypes.number.isRequired,
  iframeHeight: PropTypes.number.isRequired,
};

export default PreviewIFrame;
