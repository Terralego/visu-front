import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Classes } from '@blueprintjs/core';
import InteractiveMap, { INTERACTION_DISPLAY_TOOLTIP, INTERACTION_ZOOM, INTERACTION_HIGHLIGHT, INTERACTION_FN } from '@terralego/core/modules/Map/InteractiveMap';
import { DEFAULT_CONTROLS, CONTROL_SEARCH, CONTROL_BACKGROUND_STYLES, CONTROLS_TOP_RIGHT } from '@terralego/core/modules/Map';
import { toggleLayerVisibility, setLayerOpacity } from '@terralego/core/modules/Map/services/mapUtils';
import classnames from 'classnames';
import qs from 'qs';
import debounce from 'debounce';
import turfCenter from '@turf/center';
import turfBbox from '@turf/bbox';
import memoize from 'memoize-one';

import {
  filterFeatures,
  resetFilters,
  filterLayersStatesFromLayersState,
  filterLayersFromLayersState,
  hasTable,
  setLayerStateAction,
  layersTreeStatesHaveChanged,
} from './layersTreeUtils';
import searchService, { getExtent } from '../../../services/search';
import Search from './Search';
import Details from './Details';
import MapNavigation from './MapNavigation';
import LayersTree from './LayersTree';
import Story from './Story';
import TooManyResults from './TooManyResults';
import PrintControl from './PrintControl';
import DataTable from './DataTable';
import Widgets from './Widgets';
import { generateClusterList } from './interactions';
import AppName from './AppName/AppName';

import translate from './translate';

export const INTERACTION_DISPLAY_DETAILS = 'displayDetails';

const LayersTreeProps = PropTypes.shape({
  label: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(PropTypes.string),
  initialState: PropTypes.shape({
    active: PropTypes.bool,
    opacity: PropTypes.number,
  }),
  // Only displayed to authenticated users
  private: PropTypes.bool,
  filters: PropTypes.shape({
    // Name of layer to apply the filters
    layer: PropTypes.string,
  }),
});

const LayersTreeGroupProps = PropTypes.shape({
  group: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(LayersTreeProps.isRequired),
  private: PropTypes.bool,
});

const LAYER_PROPERTY = 'layer.keyword';

const CONTROLS = [
  ...DEFAULT_CONTROLS,
  {
    control: CONTROL_BACKGROUND_STYLES,
    position: CONTROLS_TOP_RIGHT,
  }, {
    control: new PrintControl(),
    position: CONTROLS_TOP_RIGHT,
  },
];

const getControls = memoize(state => (state
  ? [{ control: CONTROL_SEARCH, position: CONTROLS_TOP_RIGHT }, ...CONTROLS]
  : CONTROLS));

export class Visualizer extends React.Component {
  static propTypes = {
    view: PropTypes.shape({
      layersTree: PropTypes.arrayOf(PropTypes.oneOfType([
        LayersTreeProps,
        LayersTreeGroupProps,
      ])),
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
    setMapState: PropTypes.func,
    setMap: PropTypes.func,
    initLayersState: PropTypes.func,
    resizingMap: PropTypes.func,
  };

  static defaultProps = {
    view: {
      layersTree: [],
      interactions: [],
      map: {},
    },
    setMapState () {},
    setMap () {},
    initLayersState () {},
    resizingMap () {},
  };

  state = {
    isLayersTreeVisible: true,
    legends: [],
    features: [],
    totalFeatures: 0,
    interactions: [],
  };

  debouncedUpdateMapState = debounce(e => this.updateMapState(e), 200);

  debouncedSearchQuery = debounce(query => this.search(query), 500);

  storyRef = React.createRef();

  componentDidMount () {
    const { view: { state: { query } = {} } } = this.props;
    if (query) {
      this.debouncedSearchQuery();
    }
    this.setInteractions();
  }

  componentDidUpdate ({
    view: {
      interactions: prevInteractions,
    },
    layersTreeState: prevLayersTreeState,
    query: prevQuery,
    map: prevMap,
  }, { features: prevFeatures }) {
    const { view: { interactions }, map, layersTreeState, query } = this.props;
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
  }

  get mapState () {
    const { history: { location: { hash } } } = this.props;
    const mapState = qs.parse(hash.replace(/^#/, ''));
    try {
      const zoom = +mapState.zoom;
      const center = JSON.parse(mapState.center).map(v => +v);

      return {
        zoom,
        center,
        fitBounds: null,
      };
    } catch (e) {
      return {};
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
            const { layersTreeState } = this.props;
            if (hasTable(layersTreeState)) return;

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
    this.updateLayersTree();
  }

  resetMap = map => {
    const { initLayersState, setMap } = this.props;
    const { mapState: { zoom, center } } = this;
    setMap(map);
    const onFirstResize = () => {
      const { view: { map: { fitBounds } } } = this.props;
      if (!fitBounds) return;

      map.fitBounds(fitBounds, { animate: false });
      this.updateMapState({ target: map });
    };
    const onMapUpdate = e => {
      // e.originalEvent means it's a user's event
      if (!e.originalEvent && e.type !== 'updateMap') return;
      map.off('resize', onFirstResize);
      this.debouncedUpdateMapState(e);
      this.debouncedSearchQuery();
    };
    if (zoom || center) {
      this.updateMapState({ target: map });
    } else {
      map.once('resize', onFirstResize);
    }
    map.on('move', onMapUpdate);
    map.on('zoom', onMapUpdate);
    map.on('updateMap', onMapUpdate);
    map.on('load', () => this.updateLayersTree());
    initLayersState();
    map.resize();
  }

  updateMapState = ({ target: map }) => {
    const {
      history: { location: { pathname }, replace },
      setMapState,
    } = this.props;
    const zoom = map.getZoom();
    const { lng, lat } = map.getCenter();
    const center = [lng, lat];

    replace(`${pathname}#zoom=${zoom}&center=${JSON.stringify(center)}`);

    const mapState = {
      zoom,
      center,
      fitBounds: null,
    };

    setMapState(mapState);
  }

  hideDetails = () => {
    const { details: { hide = () => {} } = {} } = this.state;
    hide();
    this.setState({ details: undefined });
  }

  toggleLayersTree = () => {
    const { resizingMap } = this.props;
    this.setState(({ isLayersTreeVisible }) => ({
      isLayersTreeVisible: !isLayersTreeVisible,
    }));
    resizingMap();
  }

  searchQuery = ({ target: { value: query } }) => {
    const { searchQuery } = this.props;
    searchQuery(query);
  };

  search = async () => {
    const { query, layersTreeState, map } = this.props;

    if (!map) return;
    const filters = filterLayersStatesFromLayersState(layersTreeState)
      .filter(([{ filters: { layer } = {} }, { filters: layerFilters }]) =>
        layer && (query || layerFilters))
      .map(([layer, { filters: properties = {} }]) => ({
        layer,
        properties: {
          ...Object.keys(properties).reduce((all, key) => ({
            ...all,
            ...layer.filters.form.find(({ property }) => property === key).values
              ? {
                [`${key}.keyword`]: {
                  type: 'term',
                  value: properties[key],
                },
              }
              : {
                [key]: properties[key],
              },
          }), {}),
          [LAYER_PROPERTY]: { value: layer.filters.layer, type: 'term' },
        },
      }));

    if (!this.isSearching) {
      this.resetSearch(filters);
      return;
    }

    const boundingBox = getExtent(map);

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
    const { layersTreeState } = this.props;
    const layers = filterLayersStatesFromLayersState(layersTreeState, ({ active }) => !!active)
      .filter(([{ filters: { layer, mainField } = {} }]) => layer && mainField);
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
    layersTreeState.forEach(({
      active,
      opacity,
      sublayers: sublayersState,
    }, {
      sublayers = [],
      layers = [],
      ignore = {},
    }) => {
      if (sublayersState) {
        sublayers.forEach((sublayer, index) => {
          const isActive = active && sublayersState[index];
          sublayer.layers.forEach(layerId => {
            if (!map.getLayer(layerId)) {
              return;
            }
            toggleLayerVisibility(map, layerId, isActive ? 'visible' : 'none');
            setLayerOpacity(map, layerId, opacity);
          });
        });
      }

      layers.forEach(layerId => {
        const ignoreOpacity = [
          ...(ignore.opacity || []),
          // cluster border
          `${layerId}-border`,
        ];

        if (active !== undefined) {
          toggleLayerVisibility(map, layerId, active ? 'visible' : 'none');
        }
        if (opacity !== undefined
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

  render () {
    const {
      layersTreeState,
      query,
      view: {
        title,
        map: mapProps,
        layersTree,
        story,
        state: {
          map: mapStateFromView,
        } = {},
      },
      mapIsResizing,
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
      mapState, resetMap, hideDetails, toggleLayersTree,
      legends,
      searchQuery,
      setLegends,
      storyRef,
      onClusterUpdate,
    } = this;
    const displaySearch = filterLayersFromLayersState(layersTreeState, () => true).length > 0;
    const isDetailsVisible = !!details && !hasTable(layersTreeState);
    const [{ features: featuresForDetail = [] } = {}] = isDetailsVisible
      ? features.filter(({ layer }) => layer === sourceLayer)
      : [];

    const displaySearchInMap = Array
      .from(layersTreeState.keys())
      .some(({ filters: { mainField } = {} }) => mainField);

    const controls = getControls(displaySearchInMap);
    if (displaySearchInMap) {
      const search = controls.find(({ control }) => control === CONTROL_SEARCH);
      search.onSearch = this.searchInMap;
      search.onSearchResultClick = this.searchResultClick;
    }

    return (
      <div className="visualizer">
        <div className="visualizer-view__top">
          <AppName />
          {displaySearch
          && (
          <Search
            value={query}
            onChange={searchQuery}
          />
          )
        }
        </div>
        <div className={`
          visualizer-view
          ${isLayersTreeVisible ? 'is-layers-tree-visible' : ''}
        `}
        >
          <MapNavigation
            title={title}
            isVisible={isLayersTreeVisible}
            onToggle={toggleLayersTree}
          >
            {layersTree
          && (
          <LayersTree
            layersTree={layersTree}
          />
          )
        }
            {story
          && (
            <Story
              ref={storyRef}
              story={story}
              setLegends={setLegends}
            />
          )
        }
          </MapNavigation>
          <div className="visualizer-view__center col">

            <div className="row">
              <div className="col-data">
                <div
                  className={classnames({
                    'visualizer-view__map': true,
                    'visualizer-view__map--is-resizing': mapIsResizing,
                  })}
                >
                  <TooManyResults count={totalFeatures} />
                  <InteractiveMap
                    {...mapProps}
                    {...mapStateFromView}
                    {...mapState}
                    className={Classes.DARK}
                    interactions={interactions}
                    legends={legends}
                    onMapLoaded={resetMap}
                    onMapUpdate={refreshLayers}
                    onStyleChange={refreshLayers}
                    onClusterUpdate={onClusterUpdate}
                    translate={translate}
                    controls={getControls(displaySearchInMap)}
                  />
                  <Details
                    visible={isDetailsVisible}
                    features={featuresForDetail.map(_id => ({ _id }))}
                    {...details}
                    onClose={hideDetails}
                    onChange={this.onHighlightChange}
                  />
                </div>
                <DataTable />
              </div>
              <div className="col-widgets">
                <Widgets />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Visualizer);
