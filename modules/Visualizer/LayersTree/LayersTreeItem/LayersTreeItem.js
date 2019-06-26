import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Card, Switch, Elevation, Tag, Tooltip } from '@blueprintjs/core';

import LayersTreeSubItemsList from './LayersTreeSubItemsList';
import OptionsLayer from './OptionsLayer';
import LayersTreeItemFilters from './LayersTreeItemFilters';
import LayerProps from '../../types/Layer';
import LayersTreeItemOptions from './LayersTreeItemOptions';
import withDeviceSize from './withDeviceSize';

export class LayersTreeItem extends React.Component {
  static propTypes = {
    layer: LayerProps.isRequired,
    isActive: PropTypes.bool,
    opacity: PropTypes.number,
    isTableActive: PropTypes.bool,
    total: PropTypes.number,
    setLayerState: PropTypes.func,
    isTabletSized: PropTypes.bool,
  };

  static defaultProps = {
    isActive: false,
    opacity: 1,
    isTableActive: false,
    total: null,
    setLayerState () {},
    isTabletSized: false,
  }

  state = {
    isOptionsOpen: false,
    isFilterVisible: false,
    isWidgetActive: false,
  }

  componentWillUnmount () {
    this.resetFilterPanelListener();
  }

  onActiveChange = ({ target: { checked: active } }) => {
    const { layer, setLayerState } = this.props;
    setLayerState({ layer, state: { active, table: false } });
  }

  onOpacityChange = opacity => {
    const { layer, setLayerState } = this.props;
    setLayerState({ layer, state: { opacity } });
  }

  getFilterPanelRef = refs => {
    this.resetFilterPanelListener();
    document.body.addEventListener('mousedown', this.clickListener = ({ target }) => {
      if (refs.reduce((contains, el) => contains || el.contains(target), false)) {
        return;
      }
      this.setState({ isFilterVisible: false });
    });
  }

  handleOptionPanel = () => {
    const { isOptionsOpen } = this.state;
    this.setState({ isOptionsOpen: !isOptionsOpen });
  }

  toggleFilters = () => this.setState(({ isFilterVisible }) =>
    ({ isFilterVisible: !isFilterVisible }));

  toggleTable = () => {
    const { layer, isTableActive, setLayerState } = this.props;
    setLayerState({ layer, state: { table: !isTableActive } });
  };

  toggleWidgets = widget => () => {
    const { layer, widgets: prevWidgets = [], setLayerState } = this.props;
    const contains = this.isWidgetActive(widget);
    const { isWidgetActive } = this.state;
    const widgets = [
      ...(contains
        ? prevWidgets.filter(w => w !== widget)
        : [...prevWidgets, widget]),
    ];
    this.setState({ isWidgetActive: !isWidgetActive });
    setLayerState({ layer, state: { widgets } });
  }

  isWidgetActive (widget) {
    const { widgets = [] } = this.props;
    return widgets.includes(widget);
  }


  resetFilterPanelListener () {
    if (this.clickListener) {
      document.body.removeEventListener('mousedown', this.clickListener);
    }
  }

  render () {
    const {
      layer,
      layer: {
        label,
        sublayers,
        filters: { form, fields } = {},
        widgets = [],
      },
      isActive,
      opacity,
      isTableActive,
      total,
      hidden,
      isTabletSized,
    } = this.props;

    if (hidden) return null;

    const {
      isOptionsOpen, isFilterVisible, isWidgetActive,
    } = this.state;
    const {
      onActiveChange,
      onOpacityChange,
      toggleFilters,
      toggleTable,
      getFilterPanelRef,
      toggleWidgets,
      handleOptionPanel,
    } = this;

    const totalResult = typeof (total) === 'number';
    const hasSomeOptionActive = isTableActive || isFilterVisible || isOptionsOpen || isWidgetActive;

    const htmlID = btoa(JSON.stringify(layer).replace(/\W/g, ''));
    const displayTableButton = fields && !!fields.length;

    return (
      <Card
        className={classnames('layerNode-container', { 'options-hidden': isActive })}
        elevation={Elevation.ZERO}
        style={{ opacity: isActive ? 1 : 0.7 }}
      >
        <div className={
          classnames(
            { 'layerNode__content--desktop': !isTabletSized },
            { 'layerNode__content--mobile': isTabletSized },
          )
        }
        >
          <div className={
            classnames(
              { 'layerNode__content--desktop-switch-label': !isTabletSized },
              { 'layerNode__content--mobile-switch-label': isTabletSized },
            )
          }
          >
            <Switch
              checked={!!isActive}
              onChange={onActiveChange}
              id={`toggle-${htmlID}`}
            />
            <Tooltip
              content={label}
              hoverOpenDelay={2000}
              className="layerNode__tooltip"
            >
              <label className="layerNode__label" htmlFor={`toggle-${htmlID}`}>{label}</label>
            </Tooltip>
            <div className="layerNode-total">
              {isActive && totalResult && (
              <Tag
                intent="primary"
                round
              >
                {total}
              </Tag>
              )}
            </div>
          </div>
          {isActive && (
          <LayersTreeItemOptions
            hasSomeOptionActive={hasSomeOptionActive}
            isOptionsOpen={isOptionsOpen}
            handleOptionPanel={handleOptionPanel}
            layer={layer}
            toggleFilters={toggleFilters}
            isFilterVisible={isFilterVisible}
            getFilterPanelRef={getFilterPanelRef}
            form={form}
            toggleTable={toggleTable}
            isTableActive={isTableActive}
            displayTableButton={displayTableButton}
            toggleWidgets={toggleWidgets}
            widgets={widgets}
            isWidgetActive={isWidgetActive}
          />
          )}
        </div>
        {isOptionsOpen && isActive && (
          <OptionsLayer
            onOpacityChange={onOpacityChange}
            opacity={opacity}
          />
        )}
        <>
          <LayersTreeItemFilters layer={layer} />
          {isActive && sublayers && (
            <LayersTreeSubItemsList
              layer={layer}
              sublayers={sublayers}
            />
          )}
        </>
      </Card>
    );
  }
}

export default withDeviceSize(LayersTreeItem);
