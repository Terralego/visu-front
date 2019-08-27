import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Classes } from '@blueprintjs/core';
import { connectState } from '@terralego/core/modules/State/context';
import InteractiveMap, {
  INTERACTION_DISPLAY_TOOLTIP,
  INTERACTION_ZOOM,
  INTERACTION_HIGHLIGHT,
  INTERACTION_FN,
} from '@terralego/core/modules/Map/InteractiveMap';
import {
  DEFAULT_CONTROLS,
  CONTROL_SEARCH,
  CONTROL_BACKGROUND_STYLES,
  CONTROL_PRINT,
  CONTROLS_TOP_RIGHT,
  CONTROL_PERMALINK,
  CONTROL_HOME,
} from '@terralego/core/modules/Map';
import { toggleLayerVisibility, setLayerOpacity } from '@terralego/core/modules/Map/services/mapUtils';
import { LayersTreeProvider, LayersTree } from '@terralego/core/modules/Visualizer/LayersTree';
import LayersTreeProps from '@terralego/core/modules/Visualizer/types/Layer';
import classnames from 'classnames';
import debounce from 'debounce';
import turfCenter from '@turf/center';
import turfBbox from '@turf/bbox';
import memoize from 'memoize-one';

import {
  filterFeatures,
  resetFilters,
  filterLayersStatesFromLayersState,
  hasTable,
  hasWidget,
  setLayerStateAction,
  layersTreeStatesHaveChanged,
  fetchPropertyValues,
  fetchPropertyRange,
  layersTreeToStory,
} from './layersTreeUtils';
import searchService, {
  getExtent,
  getSearchParamFromProperty,
} from '../../../services/search';
import Details from './Details';
import MapNavigation from './MapNavigation';
import Story from './Story';
import TooManyResults from './TooManyResults';
import DataTable from './DataTable';
import Widgets from './Widgets';
import { generateClusterList } from './interactions';
import BoundingBoxObserver from '../../../components/BoundingBoxObserver';
import translate from './translate';
import brandLogo from '../../../images/logo-auran.svg';
import appLogo from '../../../images/cart_en_main.png';

export const INTERACTION_DISPLAY_DETAILS = 'displayDetails';

const LAYER_PROPERTY = 'layer.keyword';

const getControls = memoize((displaySearch, displayBackgroundStyles, disableSearch) => [
  displaySearch && {
    control: CONTROL_SEARCH,
    position: CONTROLS_TOP_RIGHT,
    disabled: disableSearch,
  }, {
    control: CONTROL_HOME,
    position: CONTROLS_TOP_RIGHT,
  },
  ...DEFAULT_CONTROLS,
  displayBackgroundStyles && {
    control: CONTROL_BACKGROUND_STYLES,
    position: CONTROLS_TOP_RIGHT,
  }, {
    control: CONTROL_PRINT,
    position: CONTROLS_TOP_RIGHT,
  }, {
    control: CONTROL_PERMALINK,
    position: CONTROLS_TOP_RIGHT,
  },
].filter(defined => defined));

export class Visualizer extends React.Component {
  static propTypes = {
    view: PropTypes.shape({
      layersTree: PropTypes.arrayOf(LayersTreeProps),
      interactions: PropTypes.arrayOf(PropTypes.shape({
        interaction: PropTypes.oneOf([
          INTERACTION_DISPLAY_DETAILS,
          INTERACTION_DISPLAY_TOOLTIP,
          INTERACTION_ZOOM,
          INTERACTION_HIGHLIGHT,
          INTERACTION_FN,
        ]),
      })),
      map: PropTypes.object,
      state: PropTypes.shape({
        query: PropTypes.string,
      }),
    }),
    setMap: PropTypes.func,
    initLayersState: PropTypes.func,
    initialState: PropTypes.shape({
      tree: PropTypes.bool,
    }),
  };

  static defaultProps = {
    view: {
      layersTree: [],
      interactions: [],
      map: {},
    },
    setMap () {},
    initLayersState () {},
    initialState: {},
  };

  state = {
    isLayersTreeVisible: true,
    legends: [],
    features: [],
    totalFeatures: 0,
    interactions: [],
  };

  debouncedSearchQuery = debounce(query => this.search(query), 500);

  storyRef = React.createRef();

  componentDidMount () {
    const { view: { state: { query } = {} }, initialState: { tree } } = this.props;
    if (query) {
      this.debouncedSearchQuery();
    }
    if (tree === false) {
      this.setState({ isLayersTreeVisible: false });
    }
    this.setInteractions();
  }

  componentDidUpdate ({
    view: {
      interactions: prevInteractions,
      layersTree: prevLayersTree,
    },
    layersTreeState: prevLayersTreeState,
    query: prevQuery,
    map: prevMap,
    authenticated: prevAuthenticated,
  }, { features: prevFeatures }) {
    const {
      view: { interactions, layersTree },
      map,
      layersTreeState,
      query,
      authenticated,
    } = this.props;
    const { features } = this.state;
    if (prevLayersTreeState !== layersTreeState
        || map !== prevMap) {
      this.updateLayersTree();
    }
    if (query !== prevQuery
        || layersTreeStatesHaveChanged(prevLayersTreeState, layersTreeState, ['active', 'filters'])
        || map !== prevMap) {
      if (this.isSearching) {
        this.debouncedSearchQuery();
      } else if (map) {
        resetFilters(map, layersTreeState);
        this.resetSearch();
      }
    }

    if (features !== prevFeatures
        && this.isSearching) {
      filterFeatures(map, features, layersTreeState);
    }

    if (interactions !== prevInteractions) {
      this.setInteractions();
    }

    if (authenticated !== prevAuthenticated
      || layersTree !== prevLayersTree) {
      this.updatePrivateLayers();
    }
  }

  get legends () {
    const { layersTreeState } = this.props;
    const { legends } = this.state;
    const legendsFromLayersTree = Array.from(layersTreeState.entries())
      .map(([layer, state]) => {
        if (!state.active) return undefined;
        if (layer.sublayers) {
          const selected = state.sublayers.findIndex(active => active);
          const selectedSublayer = layer.sublayers[selected];
          return selectedSublayer && selectedSublayer.legends && ({
            title: selectedSublayer.label,
            legendsCluster: selectedSublayer.legends,
          });
        }
        return layer.legends && ({
          title: layer.label,
          legendsCluster: layer.legends,
        });
      })
      .filter(defined => defined)
      .reduce((accum, { legendsCluster, title }) => [
        ...accum,
        ...legendsCluster.reduce((acc, legend) => [...acc, { title, ...legend }], []),
      ], []);

    return [...(legends || []), ...(legendsFromLayersTree || [])];
  }

  get isSearching () {
    const { query, layersTreeState } = this.props;
    return query
      || filterLayersStatesFromLayersState(layersTreeState)
        .some(([{ filters: { layer } = {} }, { filters }]) =>
          layer
          && filters
          && Object
            .values(filters)
            .some(a => a));
  }

  get activeAndSearchableLayers () {
    const { layersTreeState } = this.props;
    return filterLayersStatesFromLayersState(layersTreeState, ({ active }) => !!active)
      .filter(([{ filters: { layer, mainField } = {} }]) => layer && mainField);
  }

  setInteractions () {
    const { view: { interactions = [] } } = this.props;
    const newInteractions = interactions.map(interaction => {
      if (interaction.interaction === INTERACTION_DISPLAY_DETAILS) {
        return {
          ...interaction,
          interaction: INTERACTION_FN,
          fn: ({
            feature, clusteredFeatures, event, instance,
            instance: { displayTooltip }, layerId,
          }) => {
            if (clusteredFeatures) {
              const { clusterLabel } = interaction;
              displayTooltip({
                layerId,
                feature,
                event,
                fixed: true,
                element: generateClusterList({
                  features: clusteredFeatures,
                  onClick: selectedFeature =>
                    this.displayDetails(selectedFeature, interaction, instance),
                  clusterLabel,
                }),
                className: 'clustered-features-list-container',
                unique: true,
              });
              return;
            }

            this.displayDetails(feature, interaction, instance);
          },
        };
      }
      return interaction;
    });
    this.setState({ interactions: newInteractions });
  }

  setLegends = legends => this.setState({ legends });

  refreshLayers = () => {
    delete this.prevLayersTreeState;
    this.updateLayersTree();
  }

  resetMap = map => {
    const { initLayersState, setMap } = this.props;
    setMap(map);
    const onMapUpdate = e => {
      // e.originalEvent means it's a user's event
      if (!e.originalEvent && e.type !== 'updateMap') return;
      this.debouncedSearchQuery();
    };
    map.on('move', onMapUpdate);
    map.on('zoom', onMapUpdate);
    map.on('updateMap', onMapUpdate);
    map.on('load', () => this.updateLayersTree());
    initLayersState();
    this.updatePrivateLayers();
    map.resize();
  }

  hideDetails = () => {
    const { details: { hide = () => {} } = {} } = this.state;
    hide();
    this.setState({ details: undefined });
  }

  toggleLayersTree = () => {
    const { setCurrentState } = this.props;
    this.setState(({ isLayersTreeVisible }) => ({
      isLayersTreeVisible: !isLayersTreeVisible,
    }), () => {
      const { isLayersTreeVisible } = this.state;
      return setCurrentState({ tree: isLayersTreeVisible && undefined });
    });
  };

  searchQuery = ({ target: { value: query } }) => {
    const { searchQuery } = this.props;
    searchQuery(query);
  };

  search = async () => {
    const { query, layersTreeState, map, visibleBoundingBox } = this.props;

    if (!map) return;
    const filters = filterLayersStatesFromLayersState(layersTreeState)
      .filter(([{ filters: { layer } = {} }, { filters: layerFilters }]) =>
        layer && (query || layerFilters))
      .map(([layer, { filters: properties = {} }]) => ({
        layer,
        properties: {
          ...Object.keys(properties).reduce((all, key) => ({
            ...all,
            ...getSearchParamFromProperty(properties, layer.filters.form, key),
          }), {}),
          [LAYER_PROPERTY]: { value: layer.filters.layer, type: 'term' },
        },
      }));

    if (!this.isSearching) {
      this.resetSearch(filters);
      return;
    }

    const boundingBox = getExtent(map, visibleBoundingBox);

    // Query for bbox result ids
    const queryIds = filters.map(({ properties }) => ({
      properties,
      include: [],
      query,
      boundingBox,
    }));

    // Query for all result counts
    const queryCounts = filters.map(({ properties }) => ({
      properties,
      include: [],
      size: 0,
      query,
    }));

    const { responses } = await searchService.msearch([...queryIds, ...queryCounts]);

    // Ids of results in viewport
    const idsResponses = responses.slice(0, filters.length);
    // Counts for overall results
    const countResponses = responses.slice(filters.length);

    const allFeatures = idsResponses
      .reduce((all, { hits: { hits = [] } = {} }, k) => {
        // Skip results that are only counts (index (k) higher than filters)
        if (!filters[k]) { return all; }

        const { [LAYER_PROPERTY]: { value: layer } } = filters[k].properties;
        return [...all, ...hits.map(({ _id: id }) => ({ layer, id }))];
      }, []);

    const features = filters.map(({ properties: { [LAYER_PROPERTY]: { value: layer } } }) => ({
      layer,
      features: allFeatures
        .filter(({ layer: fLayer }) => layer === fLayer)
        .map(({ id }) => id),
    }));

    const totalFeatures = idsResponses.reduce((fullTotal, { hits: { total = 0 } = {} }) =>
      fullTotal + total,
    0);

    this.setLayersResult(filters.map(({ layer }, index) => {
      const total = countResponses[index].hits
        ? countResponses[index].hits.total
        : null;
      return { layer, state: { total } };
    }));

    this.setState({ features, totalFeatures });
  }

  resetSearch = () => {
    const { layersTreeState } = this.props;
    this.setState({ features: [], totalFeatures: 0 });
    this.setLayersResult(Array.from(layersTreeState.keys()).map(layer => ({
      layer,
      state: {
        total: null,
      },
    })));
  }

  setLayersResult = layers => {
    const { layersTreeState } = this.props;

    const newLayersTreeState = layers.reduce((prevLayersTreeState, { layer, state }) =>
      setLayerStateAction(
        layer,
        state,
        prevLayersTreeState,
      ), layersTreeState);

    const { onViewStateUpdate } = this.props;
    onViewStateUpdate(({
      layersTreeState: newLayersTreeState,
    }));
  }

  onClusterUpdate = ({ features, sourceLayer }) => {
    const { features: filtered } = this.state;
    const { features: ids } = filtered.find(({ layer }) => layer === sourceLayer) || {};

    const cleanedFeatures = new Map();
    for (let i = 0, len = features.length; i < len; i += 1) {
      const feature = features[i];
      const { properties: { _id: id } } = feature;
      if (!ids || ids.includes(id)) {
        cleanedFeatures.set(id, feature);
      }
    }

    return Array.from(cleanedFeatures.values());
  }

  onHighlightChangeFactory = (layerId, addHighlight, removeHighlight, color) => index => {
    const { map } = this.props;
    const {
      features = [],
      details,
      details: {
        feature: { sourceLayer } = {},
      } = {},
    } = this.state;
    const { features: list = [] } = features.find(({ layer }) => layer === sourceLayer) || {};
    const id = list[index];

    const [feature] = map.queryRenderedFeatures({
      layers: [layerId],
      filter: ['==', '_id', id],
    });

    addHighlight({
      feature,
      highlightColor: color,
      unique: true,
    });

    details.hide = () => removeHighlight({ feature });
  };

  searchInMap = async query => {
    const { activeAndSearchableLayers: layers } = this;

    if (!layers.length) return undefined;

    const { responses } = await searchService.msearch(layers.map(([{ filters: { layer } }]) => ({
      query,
      properties: {
        [LAYER_PROPERTY]: { value: layer, type: 'term' },
      },
      size: 6,
    })));
    const results = layers.map(([{
      label, layers: resultsLayers, filters: { mainField },
    }], index) => ({
      group: label,
      total: responses[index].hits.total,
      results: responses[index].hits.hits.map(({ _id: id, _source: source }) => ({
        label: source[mainField] || id,
        id,
        ...source,
        center: turfCenter(source.geom).geometry.coordinates,
        bounds: turfBbox(source.geom),
        layers: resultsLayers,
      })),
    }));

    return results;
  }

  searchResultClick = ({
    result,
    result: { label, layers, id },
    map,
    focusOnSearchResult,
    setQuery,
  }) => {
    focusOnSearchResult(result);
    setQuery(label);
    this.hideDetails();

    map.once('moveend', () => {
      const { interactions } = this.state;
      const interaction = interactions.find(({ id: iId, trigger = 'click' }) => layers.includes(iId) && trigger === 'click');

      if (!interaction) return;

      let layerName = interaction.id;
      if (!map.getLayer(layerName)) {
        layerName = `${interaction.id}-cluster-data`;
      }
      if (!map.getLayer(layerName)) {
        return;
      }

      const features = map.queryRenderedFeatures({
        layers: [layerName],
        filter: ['==', ['get', '_id'], id],
      });

      if (!features.length) return;

      map.triggerInteraction({
        interaction,
        feature: features[0],
      });
      map.fire('updateMap');
    });
  }

  updateLayersTreeState = layersTreeState => {
    const { setLayersTreeState } = this.props;
    setLayersTreeState(layersTreeState);
  }

  displayDetails (feature, interaction, { addHighlight, removeHighlight }) {
    const { details: { hide = () => {} } = {} } = this.state;
    const { highlight } = interaction;
    hide();

    this.onHighlightChange = () => null;

    if (highlight) {
      addHighlight({
        feature,
        highlightColor: highlight.color,
        unique: true,
      });

      this.onHighlightChange = this.onHighlightChangeFactory(
        feature.layer.id,
        addHighlight,
        removeHighlight,
        highlight.color,
      );
    }

    this.setState({
      details: {
        feature,
        interaction,
        hide: () => removeHighlight({ feature }),
      },
    });
  }


  updateLayersTree () {
    const { map } = this.props;
    const { features } = this.state;

    if (!map) return;

    const { layersTreeState, query } = this.props;
    const { prevLayersTreeState = new Map() } = this;
    this.prevLayersTreeState = layersTreeState;

    layersTreeState.forEach(({
      active,
      opacity,
      sublayers: sublayersState,
    }, layer) => {
      const {
        sublayers = [],
        layers = [],
        ignore = {},
      } = layer;

      const {
        active: prevActive,
        opacity: prevOpacity,
      } = prevLayersTreeState.get(layer) || {};

      if (sublayersState) {
        sublayers.forEach((sublayer, index) => {
          const isActive = active && sublayersState[index];
          sublayer.layers.forEach(layerId => {
            if (!map.getLayer(layerId)) {
              return;
            }
            toggleLayerVisibility(map, layerId, isActive ? 'visible' : 'none');
            if (opacity !== prevOpacity) {
              setLayerOpacity(map, layerId, opacity);
            }
          });
        });
      }

      layers.forEach(layerId => {
        const ignoreOpacity = [
          ...(ignore.opacity || []),
          // cluster border
          `${layerId}-border`,
        ];

        if (active !== undefined && active !== prevActive) {
          toggleLayerVisibility(map, layerId, active ? 'visible' : 'none');
        }
        if (opacity !== undefined
          && opacity !== prevOpacity
          // Don't change cluster border
          && !ignoreOpacity.includes(layerId)) {
          setLayerOpacity(map, layerId, opacity);
        }
      });
    });

    if (query || this.hasFilters) {
      filterFeatures(map, features, layersTreeState);
    }

    const { current } = this.storyRef;
    if (current) current.displayStep();
  }

  updatePrivateLayers () {
    const { layersTreeState: prevLayersTreeState, setLayersTreeState, authenticated } = this.props;
    const layersTreeState = new Map(Array.from(prevLayersTreeState).map(([layer, state]) => [
      layer,
      {
        ...state,
        hidden: !authenticated && layer.private,
      },
    ]));
    setLayersTreeState(layersTreeState);
  }

  render () {
    const {
      layersTreeState,
      view: {
        title,
        map: mapProps,
        layersTree,
      },
      map,
      mapIsResizing,
      setVisibleBoundingBox,
      renderHeader,
    } = this.props;
    const {
      details,
      details: { feature: { sourceLayer } = {} } = {},
      isLayersTreeVisible,
      interactions,
      totalFeatures,
      features,
    } = this.state;
    const {
      refreshLayers,
      resetMap, hideDetails, toggleLayersTree,
      legends,
      setLegends,
      storyRef,
      onClusterUpdate,
      activeAndSearchableLayers,
    } = this;
    const isDetailsVisible = !!details;
    const [{ features: featuresForDetail = [] } = {}] = isDetailsVisible
      ? features.filter(({ layer }) => layer === sourceLayer)
      : [];

    const displaySearchInMap = Array
      .from(layersTreeState.keys())
      .some(({ filters: { mainField } = {} }) => mainField);

    const controls = getControls(
      displaySearchInMap,
      Array.isArray(mapProps.backgroundStyle),
      !activeAndSearchableLayers.length,
    );

    if (displaySearchInMap) {
      const search = controls.find(({ control }) => control === CONTROL_SEARCH);
      search.onSearch = this.searchInMap;
      search.onSearchResultClick = this.searchResultClick;
    }

    const isTableVisible = hasTable(layersTreeState);
    const isWidgetsVisible = hasWidget(layersTreeState);

    const isStory = layersTree.type === 'story';

    return (
      <LayersTreeProvider
        map={map}
        layersTree={layersTree}
        onChange={this.updateLayersTreeState}
        initialLayersTreeState={layersTreeState}
        fetchPropertyValues={fetchPropertyValues}
        fetchPropertyRange={fetchPropertyRange}
      >
        <div className={classnames({
          visualizer: true,
          'visualizer--with-layers-tree': isLayersTreeVisible,
          'visualizer--with-table': isTableVisible,
          'visualizer--with-widgets': isWidgetsVisible,
          'visualizer--with-details': isDetailsVisible,
        })}
        >
          <div className={`
            visualizer-view
            ${isLayersTreeVisible ? 'is-layers-tree-visible' : ''}
          `}
          >
            {layersTree && (
              <MapNavigation
                title={title}
                toggleLayersTree={toggleLayersTree}
                visible={isLayersTreeVisible}
                renderHeader={renderHeader}
              >
                {isStory
                  ? (
                    <Story
                      ref={storyRef}
                      story={layersTreeToStory(layersTree)}
                      setLegends={setLegends}
                    />
                  )
                  : (
                    <LayersTree />
                  )}
              </MapNavigation>
            )}

            <div className="visualizer-view__center col">
              <div className="row">
                <div className="col-data">
                  <BoundingBoxObserver
                    onChange={setVisibleBoundingBox}
                    className={classnames({
                      'visualizer-view__map': true,
                      'visualizer-view__map--is-resizing': mapIsResizing,
                    })}
                  >
                    <TooManyResults count={totalFeatures} />

                    <Details
                      visible={isDetailsVisible}
                      features={featuresForDetail.map(_id => ({ _id }))}
                      {...details}
                      onClose={hideDetails}
                      onChange={this.onHighlightChange}
                    />
                  </BoundingBoxObserver>
                  <DataTable />
                </div>
                <div className="col-widgets">
                  <Widgets />
                </div>
              </div>
            </div>
          </div>

          <InteractiveMap
            {...mapProps}
            className={Classes.DARK}
            interactions={interactions}
            legends={legends}
            onMapLoaded={resetMap}
            onMapUpdate={refreshLayers}
            onStyleChange={refreshLayers}
            onClusterUpdate={onClusterUpdate}
            translate={translate}
            controls={controls}
            hash="map"
          >
            <div className="interactive-map__header">
              <img src={appLogo} alt="Cart'en main" className="app-logo" />
              {/* Waiting more information from customer */}
              {/* {!!legends.length && (
                <h2>
                  {legends.map(legend => legend.title).join(', ')}
                </h2>
              )} */}
              <img src={brandLogo} alt="Auran" className="brand-logo" />
            </div>
            <div className="interactive-map__footer">
              Sources : Cart'en Main - AURAN - INSEE, RP 2016.
            </div>
          </InteractiveMap>
        </div>
      </LayersTreeProvider>
    );
  }
}

export default connectState('initialState', 'setCurrentState')(withRouter(Visualizer));
