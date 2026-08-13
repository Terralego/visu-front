import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, ButtonBase, Chip, Collapse, Tooltip, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ConnectedLayersTreeGroup from '.';
import LayersTreeItem from '../LayersTreeItem';
import LayersTreeVariableItem from '../LayersTreeItem/LayersTreeVariableItem';
import translateMock from '../../../../utils/translate';
import { getNodesKeys } from './utils';

const persistedOpenStates = new WeakMap();

export const LayersTreeGroup = ({
  title,
  layer,
  isHidden,
  peek,
  totalCount,
  activeCount,
  activeNodes,
  setLayerState,
  layersExtent = {},
  isDetailsVisible,
  translate,
}) => {
  const { layers } = layer;
  const [open, setOpen] = useState(() =>
    (persistedOpenStates.has(layer) ? persistedOpenStates.get(layer) : !layer.closedByDefault));
  const [openWhilePeeked, setOpenWhilePeeked] = useState(false);

  useEffect(() => {
    if (!peek) setOpenWhilePeeked(false);
  }, [peek]);

  if (isHidden) return null;

  const isOpen = peek ? openWhilePeeked : open;
  const isPreviewing = !isOpen && activeCount > 0;
  const keys = getNodesKeys(layers);

  const handleClick = () => {
    if (peek) {
      setOpenWhilePeeked(!openWhilePeeked);
      return;
    }
    persistedOpenStates.set(layer, !open);
    setOpen(!open);
  };

  const deactivateAll = () => setLayerState({ layer, state: { active: false, table: false } });

  const renderNodeContent = node => {
    if (node.group && !node.exclusive) {
      return (
        <ConnectedLayersTreeGroup
          title={node.group}
          layer={node}
          peek={isPreviewing}
          layersExtent={layersExtent}
          isDetailsVisible={isDetailsVisible}
        />
      );
    }

    if (node.group && node.exclusive && node.byVariable) {
      return (
        <LayersTreeVariableItem
          layers={node.layers}
          group={node}
          activeLayer={node.layers.find(l => l.initialState?.active)}
        />
      );
    }

    return (
      <LayersTreeItem
        layer={node}
        exclusive={layer.exclusive}
        extent={layersExtent[node.label]}
        isDetailsVisible={isDetailsVisible}
      />
    );
  };

  const renderNode = (node, index) => {
    const isActive = activeNodes[index];
    const isHighlighted = isPreviewing && isActive && !(node.group && !node.exclusive);

    return (
      <Collapse key={keys[index]} in={!isPreviewing || isActive}>
        <Box sx={isHighlighted ? { borderLeft: 3, borderColor: 'contrasted.main' } : undefined}>
          {renderNodeContent(node)}
        </Box>
      </Collapse>
    );
  };

  return (
    <div className="layerstree-group">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <ButtonBase
          onClick={handleClick}
          aria-expanded={isOpen}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            gap: 0.5,
            justifyContent: 'flex-start',
            color: 'contrasted.main',
          }}
        >
          {isOpen
            ? <ExpandMoreIcon fontSize="small" />
            : <ChevronRightIcon fontSize="small" />}
          <Typography
            component="span"
            sx={{
              minWidth: 0,
              textAlign: 'left',
              overflowWrap: 'anywhere',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
        </ButtonBase>

        {totalCount > 0 && (
          <Tooltip
            title={activeCount
              ? translate('terralego.visualizer.layerstree.group.deactivateAll', {
                active: activeCount,
              })
              : translate('terralego.visualizer.layerstree.group.counterTooltip', {
                active: activeCount,
                total: totalCount,
              })}
            disableInteractive
            placement="top"
          >
            <Chip
              label={`${activeCount}/${totalCount}`}
              size="small"
              color="contrasted"
              variant={activeCount ? 'filled' : 'outlined'}
              onClick={activeCount ? deactivateAll : undefined}
              onDelete={activeCount ? deactivateAll : undefined}
              deleteIcon={<CloseIcon />}
              sx={{
                letterSpacing: '0.2em',
                transform: 'scale(0.85)',
                flexShrink: 0,
                '& .MuiChip-deleteIcon': {
                  width: 0,
                  margin: 0,
                  opacity: 0,
                  transition: ({ transitions }) =>
                    transitions.create(['width', 'opacity', 'margin']),
                },
                '&:hover .MuiChip-deleteIcon, &:focus-within .MuiChip-deleteIcon': {
                  width: '1rem',
                  margin: '0 5px 0 -6px',
                  opacity: 1,
                },
              }}
            />
          </Tooltip>
        )}
      </Box>

      <Collapse in={isOpen || isPreviewing}>
        <Box sx={{ p: 0.5, border: 1, borderColor: 'divider' }}>
          {layers.map(renderNode)}
        </Box>
      </Collapse>
    </div>
  );
};

LayersTreeGroup.propTypes = {
  title: PropTypes.string.isRequired,
  layer: PropTypes.shape({
    closedByDefault: PropTypes.bool,
    label: PropTypes.string,
    group: PropTypes.string,
  }).isRequired,
  translate: PropTypes.func,
};

LayersTreeGroup.defaultProps = {
  translate: translateMock({
    'terralego.visualizer.layerstree.group.counterTooltip': '{{active}} couche(s) active(s) sur {{total}}',
    'terralego.visualizer.layerstree.group.deactivateAll': 'Désactiver les {{active}} couche(s) active(s) du groupe',
  }),
};

export default LayersTreeGroup;
