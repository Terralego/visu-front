import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mapBoxGl from 'mapbox-gl';
import debounce from 'lodash.debounce';
import centroid from '@turf/centroid';

import { setInteractions, fitZoom } from '../services/mapUtils';
import { getClusteredFeatures } from '../services/cluster';
import MapComponent, { CONTROLS_TOP_RIGHT, DEFAULT_CONTROLS } from '../Map';
import BackgroundStyles from './components/BackgroundStyles';
import Legend from './components/Legend';
import Tooltip from './components/Tooltip';

import './styles.scss';

export const INTERACTION_FLY_TO = 'flyTo';
export const INTERACTION_FIT_ZOOM = 'fitZoom';
export const INTERACTION_ZOOM = 'zoom';
export const INTERACTION_DISPLAY_TOOLTIP = 'displayTooltip';
export const INTERACTION_HIGHLIGHT = 'highlight';
export const INTERACTION_FN = 'function';

export const CONTROL_BACKGROUND_STYLES = 'BackgroundStylesControl';

const generateTooltipContainer = ({ fetchProperties, properties, template, content, history }) => {
  const container = document.createElement('div');
  ReactDOM.render(
    <Tooltip
      fetch={fetchProperties}
      properties={properties}
      template={template}
      content={content}
      history={history}
    />,
    container,
  );
  return container;
};

export const getHighlightLayerId = (layerId, type = 'fill') => `${type}-${layerId}-highlight`;

const getUniqueLegends = legends => {
  const uniques = [];
  legends.forEach(legend => uniques.find(({ title, items }) =>
    title === legend.title && items.length === legend.items.length)
      || uniques.push(legend));
  return uniques;
};

export const DEFAULT_INTERACTIVE_MAP_CONTROLS = [...DEFAULT_CONTROLS, {
  control: CONTROL_BACKGROUND_STYLES,
  position: CONTROLS_TOP_RIGHT,
}];

export class InteractiveMap extends React.Component {
  static propTypes = {
    backgroundStyle: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
      PropTypes.string,
    ]),
    interactions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      trigger: PropTypes.oneOf(['click', 'mouseover']),
      interaction: PropTypes.oneOf([
        INTERACTION_FIT_ZOOM,
        INTERACTION_DISPLAY_TOOLTIP,
        INTERACTION_ZOOM,
        INTERACTION_FLY_TO,
        INTERACTION_HIGHLIGHT,
        INTERACTION_FN,
      ]),
      constraints: PropTypes.arrayOf(PropTypes.shape({
        minZoom: PropTypes.number,
        maxZoom: PropTypes.number,
        // withLayers takes a list of layers ids which should exists and be visible,
        // or with "!layerId", should not
        withLayers: PropTypes.arrayOf(PropTypes.string),
        // Pass if the feature is a cluster of features
        isCluster: PropTypes.bool,
      })),
      // for INTERACTION_DISPLAY_TOOLTIP
      template: PropTypes.string,
      content: PropTypes.string,
      unique: PropTypes.bool, // Tooltip should be unique in screen
      fixed: PropTypes.bool, // Tooltip should be anchored on feature centroid
      fetchProperties: PropTypes.shape({
        // URL where to fetch properties. Url should take a {{id}} placeholder
        // Ex : /api/something/{{id}}
        url: PropTypes.string.isRequired,
        // name of the feature's property which will fit the "id" placeholder
        id: PropTypes.string.isRequired,
      }),
      // for INTERACTION_FN
      fn: PropTypes.func,
    })),
    legends: PropTypes.arrayOf(PropTypes.shape({

    })),
    onStyleChange: PropTypes.func,
  };

  static defaultProps = {
    backgroundStyle: 'mapbox://styles/mapbox/light-v9',
    interactions: [],
    legends: [],
    onStyleChange () {},
  };

  popups = new Map();

  hideTooltip = debounce(({ layerId }) => {
    if (!this.popups.has(layerId)) {
      return;
    }
    const { popup } = this.popups.get(layerId);
    popup.remove();
    this.popups.delete(layerId);
  }, 100);

  highlightedLayers = new Map();

  constructor (props) {
    super(props);
    const { backgroundStyle } = props;
    this.state = {
      selectedBackgroundStyle: Array.isArray(backgroundStyle)
        ? backgroundStyle[0].url
        : backgroundStyle,
      legends: [],
    };
  }

  componentDidMount () {
    this.insertBackgroundStyleControl();
  }

  componentDidUpdate ({
    interactions: prevInteractions,
    legends: prevLegends,
    controls: prevControls,
    backgroundStyle: prevBackgroundStyle,
  }) {
    const { interactions, legends, controls, backgroundStyle } = this.props;

    if (interactions !== prevInteractions) {
      this.setInteractions();
    }

    if (legends !== prevLegends) {
      this.filterLegendsByZoom();
    }

    if (controls !== prevControls ||
        backgroundStyle !== prevBackgroundStyle) {
      this.insertBackgroundStyleControl();
    }
  }

  onMapInit = map => {
    const { onMapInit = () => {} } = this.props;
    onMapInit(map, this);
    // map is the only link between the outside and this component.
    // eslint-disable-next-line no-param-reassign
    map.triggerInteraction = ({ interaction, feature }) =>
      this.triggerInteraction({
        map,
        event: {},
        feature,
        layerId: feature.layer.id,
        interaction,
        eventType: interaction.trigger || 'click',
      });
  };

  onMapLoaded = map => {
    const { onMapLoaded = () => {}, legends } = this.props;
    this.map = map;
    if (legends && legends.length) {
      map.on('zoomend', this.filterLegendsByZoom);
      this.filterLegendsByZoom();
    }
    this.setInteractions();
    onMapLoaded(map);
  };

  onBackgroundChange = selectedBackgroundStyle => {
    this.setState({ selectedBackgroundStyle });
    if (this.backgroundStyleControl) {
      this.backgroundStyleControl.setProps({
        selected: selectedBackgroundStyle,
      });
    }
  };

  getOriginalTarget = ({ originalEvent }) =>
    originalEvent.relatedTarget || originalEvent.explicitOriginalTarget;

  async setInteractions () {
    const { map } = this;

    if (!map) return;

    const { interactions } = this.props;
    setInteractions({ map, interactions, callback: config => this.triggerInteraction(config) });
  }

  filterLegendsByZoom = () => {
    const { legends } = this.props;
    const { map } = this;
    if (!map) return;
    const zoom = map.getZoom();
    const filteredLegends = legends
      .filter(({ minZoom = 0, maxZoom = Infinity }) =>
        ((zoom === 0 && minZoom === 0) || zoom > minZoom) && zoom <= maxZoom);

    this.setState({ legends: filteredLegends });
  };

  removeHighlight = ({
    layerId,
    featureId,
  }) => {
    const { map } = this;
    if (!map || !layerId) return;

    const highlightedLayer = this.highlightedLayers.get(layerId);

    if (!highlightedLayer) return;

    const { layersState: { ids: prevIds = [] } = {} } = highlightedLayer;

    const ids = prevIds.filter(id => id !== featureId);

    if (ids.length === prevIds.length) return;

    this.highlightedLayers.set(layerId, {
      ...highlightedLayer,
      layersState: {
        ...highlightedLayer.layersState,
        ids,
      },
    });
    this.highlight();
  }

  addHighlight = ({
    layerId,
    featureId,
    propertyId = '_id',
    highlightColor,
    source = false,
    unique = false,
  }) => {
    if (!layerId || !source) return;

    const { layersState: { ids = [] } = {} } = this.highlightedLayers.get(layerId) || {};
    const layersState = {
      ids: unique
        ? [featureId]
        : [...ids, !ids.includes(featureId) && featureId].filter(a => a),
      highlightColor,
    };

    this.highlightedLayers.set(layerId, { layersState, source, propertyId });
    this.highlight();
  }

  displayTooltip = ({
    layerId,
    feature,
    feature: { properties } = {},
    event: { lngLat, type },
    template,
    content,
    unique,
    fixed,
    anchor,
    fetchProperties = {},
    clusteredFeatures,
    element,
    className,
  }) => {
    const { history } = this.props;
    const { map } = this;
    const zoom = map.getZoom();
    const container = element || generateTooltipContainer({
      fetchProperties,
      properties: { ...properties, clusteredFeatures, zoom },
      template,
      content,
      history,
    });

    const lnglat = !fixed
      ? [lngLat.lng, lngLat.lat]
      : centroid(feature).geometry.coordinates;

    if (this.popups.has(layerId)) {
      if (this.popups.get(layerId).content === container.innerHTML) {
        this.popups.get(layerId).popup.setLngLat(lnglat);
        return;
      }
    }

    if (unique) {
      this.popups.forEach(({ popup }) => popup.remove());
      this.popups.clear();
    }
    const popup = new mapBoxGl.Popup({
      className,
      anchor,
    });
    popup.once('close', () => this.popups.delete(layerId));
    this.popups.set(layerId, { popup, content: container.innerHTML });
    popup.setLngLat(lnglat);
    popup.setDOMContent(container);
    popup.addTo(map);
    const { _content: popupContent } = popup;

    if (type === 'click') {
      return;
    }

    const onMouseLeave = () => {
      popup.remove();
      popupContent.removeEventListener('mouseleave', onMouseLeave);
    };
    popupContent.addEventListener('mouseleave', onMouseLeave);
  }

  flyTo (feature, targetZoom = 12) {
    const { map } = this;
    const minZoom = map.getMinZoom() + 1;
    map.flyTo({
      center: centroid(feature).geometry.coordinates,
      zoom: minZoom > targetZoom ? minZoom : targetZoom,
    });
    map.fire('updateMap');
  }

  zoom (feature, step = 1) {
    const { map } = this;
    map.flyTo({
      center: centroid(feature).geometry.coordinates,
      zoom: map.getZoom() + step,
    });
    map.fire('updateMap');
  }

  highlight () {
    const { map } = this;

    this.highlightedLayers.forEach((
      { layersState: { ids, highlightColor = '' }, source, propertyId },
      layerId,
    ) => {
      const { sourceLayer, type } = map.getLayer(layerId);

      const targetLayerColor = map.getPaintProperty(layerId, `${type}-color`);

      const layerColor = (typeof targetLayerColor !== 'string' && typeof highlightColor === 'string')
        ? targetLayerColor
        : highlightColor;


      const targetType = () => {
        const line = {
          'line-color': layerColor,
          'line-width': 2,
        };

        const fill = {
          'fill-color': layerColor,
          'fill-opacity': 0.4,
        };

        const circle = {
          'circle-color': layerColor,
          'circle-radius': type === 'circle' && map.getPaintProperty(layerId, 'circle-radius'),
          'circle-stroke-width': 2,
          'circle-opacity': 0.4,
          'circle-stroke-color': layerColor,
        };

        if (type === 'line') {
          return { line };
        }

        if (type === 'circle') {
          return { circle };
        }

        return { line, fill };
      };

      Object.keys(targetType()).forEach(highlightType => {
        const highlightTypeId = getHighlightLayerId(layerId, highlightType);
        if (!map.getLayer(highlightTypeId)) {
          map.addLayer({
            id: highlightTypeId,
            source,
            type: highlightType,
            'source-layer': sourceLayer,
            paint: targetType()[highlightType],
          });
        }
        map.setFilter(highlightTypeId, ['in', propertyId, ...ids]);
      });
    });
  }

  async triggerInteraction ({ map, event, feature = {}, layerId, interaction, eventType }) {
    const {
      id, interaction: interactionType, fn,
      trigger = 'click', fixed, constraints,
      highlightColor, unique, highlight,
      zoomConfig, targetZoom, step, ...config
    } = interaction;
    if ((trigger === 'mouseover' && !['mousemove', 'mouseleave'].includes(eventType)) ||
        (trigger !== 'mouseover' && trigger !== eventType)) return;

    const {
      properties: { _id: featureId } = {},
      layer: { source } = {},
    } = feature;

    const clusteredFeatures = await getClusteredFeatures(map, feature);

    switch (interactionType) {
      case INTERACTION_DISPLAY_TOOLTIP:
        if (eventType === 'mouseleave') {
          const { popup = {} } = this.popups.get(layerId) || {};
          const { _content: popupContent } = popup;
          if (!fixed || this.getOriginalTarget(event) !== popupContent) {
            this.hideTooltip({ layerId });
          }
          return;
        }
        this.displayTooltip({
          layerId,
          feature,
          event,
          unique: ['mouseover', 'mousemove'].includes(trigger),
          fixed,
          clusteredFeatures,
          ...config,
        });
        break;
      case INTERACTION_FIT_ZOOM:
        fitZoom({ feature, map, zoomConfig });
        break;
      case INTERACTION_FLY_TO:
        this.flyTo(feature, targetZoom);
        break;
      case INTERACTION_ZOOM:
        this.zoom(feature, step);
        break;
      case INTERACTION_HIGHLIGHT: {
        if (eventType === 'mouseleave') {
          this.removeHighlight({
            layerId,
            featureId,
          });
          return;
        }

        this.addHighlight({
          layerId,
          featureId,
          source,
          unique: unique || eventType === 'mousemove',
          highlightColor,
        });
        break;
      }
      case INTERACTION_FN:
        fn({
          map,
          event,
          layerId,
          feature,
          instance: this,
          clusteredFeatures,
        });
        break;
      default:
    }
  }

  insertBackgroundStyleControl () {
    const { controls = DEFAULT_INTERACTIVE_MAP_CONTROLS, backgroundStyle } = this.props;
    const { selectedBackgroundStyle } = this.state;

    try {
      if (typeof backgroundStyle === 'string') throw new Error('Single background');
      const backgroundStyleControl = controls.find(({ control }) =>
        control === CONTROL_BACKGROUND_STYLES);

      if (!backgroundStyleControl) throw new Error('BackgroundStyleControl not found');

      this.backgroundStyleControl = new BackgroundStyles({
        onChange: this.onBackgroundChange,
        styles: backgroundStyle,
        selected: selectedBackgroundStyle,
      });
      backgroundStyleControl.control = this.backgroundStyleControl;
      this.setState({ controls: [...controls] });
    } catch (e) {
      this.setState({ controls });
    }
  }

  render () {
    const {
      layersTree,
      style,
      interactions,
      backgroundStyle,
      onStyleChange,
      history,
      ...mapProps
    } = this.props;

    const { selectedBackgroundStyle, legends, controls } = this.state;
    const {
      onMapInit,
      onMapLoaded,
    } = this;
    return (
      <div
        className="interactive-map"
        style={style}
      >
        <MapComponent
          {...mapProps}
          backgroundStyle={selectedBackgroundStyle}
          onMapInit={onMapInit}
          onMapLoaded={onMapLoaded}
          onBackgroundChange={onStyleChange}
          controls={controls}
        />
        {!!legends.length && (
          <div className="interactive-map__legends">
            {getUniqueLegends(legends)
              .map(legend => (
                <Legend
                  key={`${legend.title}${legend.items}`}
                  history={history}
                  {...legend}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
}

export default InteractiveMap;
