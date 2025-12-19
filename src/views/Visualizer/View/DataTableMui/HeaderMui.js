import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Chip, Tooltip } from '@mui/material';
import {
  FileDownloadRounded as FileDownloadIcon,
  MapRounded as MapIcon,
  FactCheckOutlined as FactCheckIcon,
  CloseFullscreenRounded as CloseFullscreenIcon,
  OpenInFullRounded as OpenInFullIcon,
  Close as CloseIcon,
  ZoomInMap,
} from '@mui/icons-material';
import classnames from 'classnames';
import bbox from '@turf/bbox';

import ColumnsSelectorMui from './ColumnsSelectorMui';
import HeaderButton from './HeaderButton';
import HeaderDropdownButton from './HeaderDropdownButton';

const getIds = features => features.map(({ _id }) => _id).join(',');

const close = (setLayerState, layer) => () => {
  if (setLayerState && layer) {
    setLayerState({ layer, state: { table: false } });
  }
};

const HeaderMui = ({
  loading,
  title,
  resultsTotal,
  toggleExtent,
  extent,
  columns,
  onChange,
  resize,
  full,
  exportData,
  selectedFeatures = [],
  clearSelection,
  compare = '',
  setLayerState,
  displayedLayer,
}) => {
  // Get the original layer reference for setLayerState
  const layerRef = displayedLayer?.layerRef;

  const compareDisabled = selectedFeatures.length < 2 || selectedFeatures.length > 3;
  const compareHref = compare ? compare.replace(/\{\{ids\}\}/, getIds(selectedFeatures)) : '#';

  return (
    <Box
      className={classnames({
        'table-header-mui': true,
        'table-header-mui--is-loading': loading,
      })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 0.5,
        paddingX: 1,
        gap: 1,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 500, flexGrow: 1, flexBasis: 0 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {loading && <CircularProgress size={20} />}
        {selectedFeatures.length > 0 ? (
          <Chip
            label={
              selectedFeatures.length > 0
                ? `${selectedFeatures.length} sélectionné${selectedFeatures.length > 1 ? 's' : ''}`
                : ''
            }
            sx={{
              height: 24,
              '& .MuiChip-icon': {
                marginLeft: 0,
              },
              '& .MuiChip-deleteIcon': {
                fontSize: '16px',
              },
            }}
            icon={(
              <Chip
                label={`${resultsTotal} résultat${resultsTotal > 1 ? 's' : ''}`}
                color="primary"
                size="small"
              />
            )}
            onDelete={() => clearSelection()}
          />
        ) : (
          <Chip
            label={`${resultsTotal} résultat${resultsTotal > 1 ? 's' : ''}`}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Actions Section */}
      <Box
        sx={{ display: 'flex', flexBasis: 0, flexGrow: 1, justifyContent: 'flex-end', gap: 0.5 }}
      >
        <HeaderDropdownButton
          enabled={!!exportData}
          disabled={!resultsTotal || loading}
          icon={<FileDownloadIcon />}
          options={[
            {
              title: 'Exporter en XLSX',
              icon: <FileDownloadIcon />,
              onClick: () => exportData('xlsx'),
            },
            {
              title: 'Exporter en CSV',
              icon: <FileDownloadIcon />,
              onClick: () => exportData('csv'),
            },
          ]}
          title="Exporter"
        />
        <HeaderButton
          title="Zoomer sur la sélection"
          icon={<ZoomInMap />}
          disabled={selectedFeatures.length === 0}
          onClick={() => {
            const features = window.__map__
              .querySourceFeatures('terra_36', {
                sourceLayer: 'zae',
                filter: ['in', ['get', '_id'], ['literal', selectedFeatures.map(e => e._id)]],
              })
              .map(e => ({ type: 'feature', geometry: e.geometry }));
            console.log({ type: 'FeatureCollection', features });
            window.__map__.fitBounds(bbox({ type: 'FeatureCollection', features }), {
              zoom: 13,
              padding: 20,
            });
          }}
        />
        <HeaderButton
          title="Comparer ces données"
          titleDisabled="Sélectionnez entre 2 et 3 données pour les comparer"
          href={compareHref}
          enabled={compare}
          disabled={compareDisabled}
          icon={<FactCheckIcon />}
        />
        <HeaderButton
          title="Filter selon l'emprise de la carte"
          titleActive="Afficher toutes les données"
          onClick={toggleExtent}
          active={extent}
          icon={<MapIcon />}
        />
        {/* Columns Selector */}
        <Tooltip title="Filtrer les propriétés">
          <span>
            <ColumnsSelectorMui columns={columns} onChange={onChange} />
          </span>
        </Tooltip>
        <HeaderButton
          title="Agrandir"
          titleActive="Réduire"
          onClick={resize}
          active={full}
          icon={<OpenInFullIcon />}
          iconActive={<CloseFullscreenIcon />}
        />
        {/* Close Button */}
        <HeaderButton
          title="Fermer"
          onClick={close(setLayerState, layerRef)}
          icon={<CloseIcon />}
        />
      </Box>
    </Box>
  );
};

HeaderMui.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.string,
  resultsTotal: PropTypes.number,
  toggleExtent: PropTypes.func,
  extent: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  resize: PropTypes.func,
  full: PropTypes.bool,
  exportData: PropTypes.func,
  selectedFeatures: PropTypes.arrayOf(PropTypes.object),
  compare: PropTypes.string,
  setLayerState: PropTypes.func,
  displayedLayer: PropTypes.object,
};

HeaderMui.defaultProps = {
  loading: false,
  title: '',
  resultsTotal: 0,
  toggleExtent: () => {},
  extent: false,
  columns: [],
  onChange: () => {},
  resize: () => {},
  full: false,
  exportData: null,
  selectedFeatures: [],
  compare: '',
  setLayerState: () => {},
  displayedLayer: null,
};

export default HeaderMui;
