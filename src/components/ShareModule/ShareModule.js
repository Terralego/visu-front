import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  Drawer,
  FormControlLabel,
  IconButton,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import PreviewIFrame from './PreviewIFrame';

const ShareModule = ({ map, open = false, onClose, layersTreeState }) => {
  const [iframeWidth, setIframeWidth] = useState(1000);
  const [iframeHeight, setIframeHeight] = useState(700);
  const [activeTab, setActiveTab] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedMessage, setCopiedMessage] = useState('');

  // États des switches - parsés depuis l'URL capturée
  const [includeMapCenter, setIncludeMapCenter] = useState(true);
  const [includeLayers, setIncludeLayers] = useState(true);
  const [includeLayersTree, setIncludeLayersTree] = useState(true);
  const [includeBasemap, setIncludeBasemap] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const hasBasemapInUrl = useMemo(() => {
    try {
      if (!currentUrl) return false;
      const url = new URL(currentUrl);
      return url.hash.includes('basemap');
    } catch {
      return false;
    }
  }, [currentUrl]);

  // Capture URL when module opens
  useEffect(() => {
    if (open) {
      setCurrentUrl(window.location.href);
    }
    try {
      const url = new URL(currentUrl);
      const hash = url.hash.substring(1); // Enlever le #
      const params = new URLSearchParams(hash);

      // Déterminer quels paramètres sont présents
      setIncludeMapCenter(params.has('map'));
      setIncludeLayers(params.has('layers'));
      setIncludeLayersTree(params.get('tree') !== 'false');
      setIncludeBasemap(params.has('basemap'));
    } catch (error) {
      console.error('Error parsing URL:', error); // eslint-disable-line no-console
    }
  }, [open]);

  // Construire l'URL partageable basée sur l'URL capturée
  const shareUrl = useMemo(() => {
    if (!currentUrl || !open) return '';

    try {
      const url = new URL(currentUrl);
      const hash = url.hash.substring(1);
      const params = new URLSearchParams(hash);

      // Créer les nouveaux params selon les switches
      const newParams = new URLSearchParams();

      if (includeMapCenter && params.has('map')) {
        newParams.set('map', params.get('map'));
      }

      if (includeLayers && params.has('layers')) {
        newParams.set('layers', params.get('layers'));
      }

      if (!includeLayersTree) {
        newParams.set('tree', 'false');
      } else if (params.has('tree')) {
        newParams.set('tree', params.get('tree'));
      }

      if (includeBasemap && params.has('basemap')) {
        newParams.set('basemap', params.get('basemap'));
      }

      const baseUrl = `${url.origin}${url.pathname}`;
      const hashString = decodeURIComponent(newParams.toString());
      return hashString ? `${baseUrl}#${hashString}` : baseUrl;
    } catch (error) {
      console.error('Error building share URL:', error); // eslint-disable-line no-console
      return currentUrl;
    }
  }, [currentUrl, includeMapCenter, includeLayers, includeLayersTree, includeBasemap, open]);

  useEffect(() => {
    const handlezoom = () => setCurrentUrl(window.location.href);
    if (map && open) {
      map.on('moveend', handlezoom);
    }
    return () => {
      map && map.off('moveend', handlezoom);
    };
  }, [map, open]);

  useEffect(() => {
    if (open && layersTreeState) {
      setCurrentUrl(window.location.href);
    }
  }, [open, layersTreeState]);

  const embedCode = `<iframe src="${shareUrl}" width="${iframeWidth}" height="${iframeHeight}"></iframe>`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedMessage('url');
    setTimeout(() => setCopiedMessage(''), 2000);
  };

  const handleShareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Carte partagée',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyUrl();
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedMessage('embed');
    setTimeout(() => setCopiedMessage(''), 2000);
  };

  const handlePreviewEmbed = () => {
    setIsPreviewOpen(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="right"
        open={open}
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiModal-backdrop': {
            backgroundColor: 'transparent',
          },
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            margin: 1,
            right: 60,
            maxHeight: 'calc(100vh - 16px)',
            height: 'auto',
            borderRadius: 1,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              px: 2.5,
              pt: 1.5,
            }}
          >
            <Box
              sx={{
                pb: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Partager la carte
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Tabs value={activeTab} sx={{ mb: 2 }} onChange={handleChangeTab}>
                <Tab sx={{ textTransform: 'none' }} label="Lien direct" />
                <Tab sx={{ textTransform: 'none' }} label="iframe" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={shareUrl}
                    InputProps={{
                      readOnly: true,
                    }}
                    onClick={e => e.target.select()}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip
                      title="Copié !"
                      open={copiedMessage === 'url'}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement="top"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCopyUrl}
                        sx={{ flex: 1, textTransform: 'none' }}
                      >
                        Copier
                      </Button>
                    </Tooltip>
                    {navigator.share && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleShareUrl}
                        sx={{ flex: 1, textTransform: 'none' }}
                      >
                        Partager
                      </Button>
                    )}
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Largeur"
                      variant="outlined"
                      type="number"
                      value={iframeWidth}
                      onChange={e => setIframeWidth(Number(e.target.value))}
                      sx={{ flex: 1 }}
                      inputProps={{ min: 100, max: 2000 }}
                    />
                    <TextField
                      size="small"
                      label="Hauteur"
                      variant="outlined"
                      type="number"
                      value={iframeHeight}
                      onChange={e => setIframeHeight(Number(e.target.value))}
                      sx={{ flex: 1 }}
                      inputProps={{ min: 100, max: 2000 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={embedCode}
                    InputProps={{
                      readOnly: true,
                    }}
                    onClick={e => e.target.select()}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip
                      title="Copié !"
                      open={copiedMessage === 'embed'}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement="top"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCopyEmbed}
                        sx={{ flex: 1, textTransform: 'none' }}
                      >
                        Copier
                      </Button>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handlePreviewEmbed}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Prévisualiser
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}
              >
                Options de partage
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={includeMapCenter}
                      onChange={e => setIncludeMapCenter(e.target.checked)}
                      size="small"
                    />
                  )}
                  label="Position sur la carte"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.825rem',
                      fontWeight: 500,
                    },
                    justifyContent: 'space-between',
                    marginLeft: 0,
                  }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={includeLayers}
                      onChange={e => setIncludeLayers(e.target.checked)}
                      size="small"
                    />
                  )}
                  label="Couches actives"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.825rem',
                      fontWeight: 500,
                    },
                    justifyContent: 'space-between',
                    marginLeft: 0,
                  }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={includeLayersTree}
                      onChange={e => setIncludeLayersTree(e.target.checked)}
                      size="small"
                    />
                  )}
                  label="Afficher l'arbre des couches"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.825rem',
                      fontWeight: 500,
                    },
                    justifyContent: 'space-between',
                    marginLeft: 0,
                  }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={includeBasemap}
                      onChange={e => setIncludeBasemap(e.target.checked)}
                      size="small"
                      disabled={!hasBasemapInUrl}
                    />
                  )}
                  label="Fond de carte"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      opacity: hasBasemapInUrl ? 1 : 0.5,
                    },
                    justifyContent: 'space-between',
                    marginLeft: 0,
                  }}
                  labelPlacement="start"
                />
              </Box>
            </Box>
          </Card>
        </Box>
      </Drawer>
      <PreviewIFrame
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        embedCode={embedCode}
        iframeWidth={iframeWidth}
        iframeHeight={iframeHeight}
      />
    </>
  );
};

ShareModule.propTypes = {
  map: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  layersTreeState: PropTypes.instanceOf(Map),
};

ShareModule.defaultProps = {
  open: false,
  onClose: () => {},
  layersTreeState: new Map(),
};

export default ShareModule;
