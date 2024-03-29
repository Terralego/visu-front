import React from 'react';
import classnames from 'classnames';
import { Button, Dialog } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';

import LocateButton from '../LocateButton';
import LayerFetchValues from '../LayerFetchValues';
import FiltersPanel from '../FiltersPanel';
import Tooltip from '../../../../../components/Tooltip';
import LayersTreeItemOptionOverflow from './LayersTreeItemOptionOverflow';
import GenericPanel from '../GenericPanel';


const LayersTreeItemOptionsDesktop = ({
  hasSomeOptionActive,
  isOptionsOpen,
  handleOptionPanel,
  layer,
  toggleFilters,
  isFilterVisible,
  getFilterPanelRef,
  form,
  toggleTable,
  isTableActive,
  displayTableButton,
  toggleWidgets,
  widgets,
  isWidgetActive,
  map,
  extent,
  isDetailsVisible,
}) => {
  const [isPanelOpen, setPanelOpen] = React.useState(false);
  const [isOverlayOpen, setOverlayOpen] = React.useState(false);
  const [activeEmbed, setActiveEmbed] = React.useState(null);

  const { t: translate } = useTranslation();

  const handleOverlayClose = React.useCallback(() => {
    setOverlayOpen(false);
    setActiveEmbed(null);
  }, []);

  return (
    <>
      {layer?.embed?.length && (
        <Dialog
          lazy
          isOpen={isOverlayOpen}
          onClose={handleOverlayClose}
          title={activeEmbed?.title}
          icon={activeEmbed?.icon}
          style={
            activeEmbed?.size && !activeEmbed?.fullScreen
              ? {
                width: activeEmbed.size.width,
                height: activeEmbed.size.height + 60,
              }
              : {
                width: 'calc(100vw - 40px)',
                height: 'calc(100vh - 40px)',
              }
          }
          portalClassName="layerstree-node-content__options__embed"
        >
          {activeEmbed && (
            <iframe
              title={activeEmbed.title}
              src={activeEmbed.src}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          )}
        </Dialog>
      )}

      <LayersTreeItemOptionOverflow translate={translate} hasSomeOptionActive={hasSomeOptionActive}>
        <LocateButton
          map={map}
          layer={layer}
          translate={translate}
          extent={extent}
          isTableActive={isTableActive}
          isDetailsVisible={isDetailsVisible}
          hasActiveWidget={widgets && !!widgets.length && widgets.find(w => isWidgetActive(w))}
        />
        {
          widgets &&
            !!widgets.length &&
            // i18next-extract-mark-context-start ["", "synthesis"]
            widgets.map(widget => {
              const context = widget.title ?? widget.component;
              const isActive = isWidgetActive(widget);

              const actionText = isActive
                ? translate('terralego.visualizer.layerstree.itemOptions.widget.action-close', {
                  context,
                })
                : translate('terralego.visualizer.layerstree.itemOptions.widget.action-open', {
                  context,
                });

              return (
                <Tooltip
                  key={context}
                  className="layerstree-node-content__options__tooltip widgets"
                  content={actionText}
                >
                  <Button
                    className={classnames({
                      'layerstree-node-content__options__button': true,
                      'layerstree-node-content__options__button--active': isActive,
                    })}
                    onClick={toggleWidgets(widget)}
                    minimal
                    icon={widget.icon ?? 'selection'}
                    title={translate('terralego.visualizer.layerstree.itemOptions.widget.title', {
                      context,
                    })}
                    text={translate('terralego.visualizer.layerstree.itemOptions.widget.title', {
                      context,
                    })}
                    alt={actionText}
                  />
                </Tooltip>
              );
            })
          // i18next-extract-mark-context-stop
        }
        {displayTableButton && (
          <Tooltip
            className="layerstree-node-content__options__tooltip table"
            content={translate('terralego.visualizer.layerstree.itemOptions.table.tooltip', {
              context: isTableActive ? 'close' : 'open',
            })}
          >
            <Button
              className={classnames('layerstree-node-content__options__button', {
                'layerstree-node-content__options__button--active': isTableActive,
              })}
              onClick={toggleTable}
              minimal
              icon="th"
              title={translate('terralego.visualizer.layerstree.itemOptions.table.title')}
              text={translate('terralego.visualizer.layerstree.itemOptions.table.title')}
              alt={translate('terralego.visualizer.layerstree.itemOptions.table.alt', {
                context: isTableActive ? 'close' : 'open',
              })}
            />
          </Tooltip>
        )}
        {form && (
          <Tooltip
            content={translate('terralego.visualizer.layerstree.itemOptions.filter.tooltip', {
              context: isFilterVisible ? 'close' : 'open',
            })}
            className="visualizer.layerstree-node-content__options__tooltip filters"
          >
            <Button
              className={classnames('layerstree-node-content__options__button', {
                'layerstree-node-content__options__button--active': isFilterVisible,
              })}
              onClick={toggleFilters}
              minimal
              icon="filter"
              text={translate('terralego.visualizer.layerstree.itemOptions.filter.label')}
              title={translate('terralego.visualizer.layerstree.itemOptions.filter.label')}
              alt={translate('terralego.visualizer.layerstree.itemOptions.filter.alt', {
                context: isFilterVisible ? 'close' : 'open',
              })}
            />
          </Tooltip>
        )}
        <Tooltip
          content={translate('terralego.visualizer.layerstree.itemOptions.opacity.tooltip')}
          className="layerNode__tooltip options"
        >
          <Button
            className={classnames('layerstree-node-content__options__button', {
              'layerstree-node-content__options__button--active': isOptionsOpen,
            })}
            icon="eye-open"
            minimal
            onClick={handleOptionPanel}
            title={translate('terralego.visualizer.layerstree.itemOptions.opacity.label')}
            text={translate('terralego.visualizer.layerstree.itemOptions.opacity.label')}
            alt={translate('terralego.visualizer.layerstree.itemOptions.opacity.label', {
              context: isOptionsOpen ? 'close' : 'open',
            })}
          />
        </Tooltip>
        {layer?.content && layer.description?.show_in_tree && (
          <Tooltip
            position="bottom"
            content="Ouvrir les informations de la couche"
            className="layerNode__tooltip options"
          >
            <Button
              className={classnames('layerstree-node-content__options__button', {
                'layerstree-node-content__options__button--active': isPanelOpen,
              })}
              icon="info-sign"
              minimal
              title="Informations"
              text="Informations"
              onClick={() => setPanelOpen(!isPanelOpen)}
            />
          </Tooltip>
        )}
        {layer?.embed?.map(item => (
          <Tooltip
            key={JSON.stringify(item)}
            content={item.title}
            className="layerNode__tooltip options"
          >
            <Button
              className={classnames('layerstree-node-content__options__button')}
              icon={item.icon}
              minimal
              onClick={() => {
                setActiveEmbed(item);
                setOverlayOpen(true);
              }}
              text={item.title}
              alt={item.title}
            />
          </Tooltip>
        ))}
      </LayersTreeItemOptionOverflow>
      {form && (
        <FiltersPanel visible={isFilterVisible} onMount={getFilterPanelRef} layer={layer}>
          {isFilterVisible && <LayerFetchValues layer={layer} isFilterVisible={isFilterVisible} />}
        </FiltersPanel>
      )}
      {layer?.content && layer.description?.show_in_tree && (
        <GenericPanel
          isOpen={isPanelOpen}
          handleClose={() => setPanelOpen(false)}
          left={0}
          top={50}
          width={300}
          visible
          title="Informations"
        >
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: layer.content }}
          />
        </GenericPanel>
      )}
    </>
  );
};

export default LayersTreeItemOptionsDesktop;
