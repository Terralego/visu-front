import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import TerritorySelector from '../TerritorySelector';
import {
  BoundingBoxProps,
  ExtentProps,
  flyToExtent,
  getUsableExtents,
  isMultipleExtentMode,
} from '../TerritorySelector/extentUtils';
import useCurrentExtent from '../TerritorySelector/useCurrentExtent';
import BackgroundTool from './BackgroundTool';
import DeclarationTool from './DeclarationTool';
import MapToolsControl from './MapToolsControl';
import PrintTool from './PrintTool';
import SearchTool from './SearchTool';
import ToolButton from './ToolButton';
import ToolGroup from './ToolGroup';
import './styles.scss';

const useToolsContainer = map => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (!map) return undefined;

    const control = new MapToolsControl();
    map.addControl(control, 'top-right');
    setContainer(control.container);

    return () => {
      setContainer(null);
      try {
        map.removeControl(control);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.debug('Map tools control already removed:', error);
      }
    };
  }, [map]);

  return container;
};

const MapToolsWrapper = ({
  map,
  translate,
  isMobileSized,
  search,
  backgroundStyles,
  interactiveMapInstance,
  extents,
  extentType,
  visibleBoundingBox,
  onPrintToggle,
  isShareOpen,
  onToggleShare,
  isDeclarationOpen,
  onToggleDeclaration,
  fitBounds,
  center,
  zoom,
}) => {
  const container = useToolsContainer(map);

  const usableExtents = useMemo(() => getUsableExtents(extents), [extents]);

  const hasTerritories = isMultipleExtentMode(extentType, usableExtents);
  const [currentExtent, setCurrentExtent] = useCurrentExtent(
    map,
    hasTerritories ? usableExtents : [],
  );

  const goToExtent = useCallback(extent => {
    setCurrentExtent(extent.id);
    flyToExtent(map, extent, visibleBoundingBox);
  }, [map, setCurrentExtent, visibleBoundingBox]);

  const goHome = useCallback(() => {
    if (hasTerritories && currentExtent) {
      flyToExtent(map, currentExtent, visibleBoundingBox);
      return;
    }

    const { coordinates, ...fitBoundsParams } = fitBounds || {};

    if (coordinates) {
      map.fitBounds(coordinates, fitBoundsParams);
      return;
    }

    if (center) {
      map.flyTo({ center, zoom });
    }
  }, [center, currentExtent, fitBounds, hasTerritories, map, visibleBoundingBox, zoom]);

  return (
    <>
      {container && createPortal(
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <ToolGroup>
            {search && <SearchTool map={map} translate={translate} {...search} />}
          </ToolGroup>
          <ToolGroup>
            <ToolButton
              label={translate('terralego.map.home_control.button_label')}
              icon={<HomeIcon sx={{ fontSize: 20 }} />}
              onClick={goHome}
            />
            {hasTerritories && (
              <TerritorySelector
                extents={usableExtents}
                current={currentExtent}
                onSelect={goToExtent}
              />
            )}
          </ToolGroup>
          <ToolGroup>
            <BackgroundTool
              styles={backgroundStyles}
              interactiveMapInstance={interactiveMapInstance}
              translate={translate}
            />
          </ToolGroup>
          <ToolGroup>
            {!isMobileSized && (
              <PrintTool map={map} translate={translate} onToggle={onPrintToggle} />
            )}
            <ToolButton
              label={translate('terralego.map.share_control.link')}
              icon={<ShareIcon sx={{ fontSize: 20 }} />}
              isActive={isShareOpen}
              onClick={onToggleShare}
            />
          </ToolGroup>
          <ToolGroup>
            <DeclarationTool isOpen={isDeclarationOpen} onToggle={onToggleDeclaration} />
          </ToolGroup>
        </Box>,
        container,
      )}
    </>
  );
};

MapToolsWrapper.propTypes = {
  map: PropTypes.shape({
    addControl: PropTypes.func.isRequired,
    removeControl: PropTypes.func.isRequired,
  }),
  translate: PropTypes.func.isRequired,
  isMobileSized: PropTypes.bool,
  search: PropTypes.shape({}),
  backgroundStyles: PropTypes.arrayOf(PropTypes.shape({})),
  interactiveMapInstance: PropTypes.shape({}),
  extents: PropTypes.arrayOf(ExtentProps),
  extentType: PropTypes.string,
  visibleBoundingBox: BoundingBoxProps,
  onPrintToggle: PropTypes.func,
  isShareOpen: PropTypes.bool,
  onToggleShare: PropTypes.func.isRequired,
  isDeclarationOpen: PropTypes.bool,
  onToggleDeclaration: PropTypes.func.isRequired,
  fitBounds: PropTypes.shape({ coordinates: PropTypes.array }),
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
};

MapToolsWrapper.defaultProps = {
  map: null,
  isMobileSized: false,
  search: null,
  backgroundStyles: [],
  interactiveMapInstance: null,
  extents: undefined,
  extentType: undefined,
  visibleBoundingBox: undefined,
  onPrintToggle: undefined,
  isShareOpen: false,
  isDeclarationOpen: false,
  fitBounds: undefined,
  center: undefined,
  zoom: undefined,
};

export default MapToolsWrapper;
