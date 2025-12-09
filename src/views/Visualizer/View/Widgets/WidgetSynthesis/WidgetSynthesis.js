import React from 'react';
import PropTypes from 'prop-types';
import searchService, { getExtent, getSearchParamFromProperty } from '@terralego/core/modules/Visualizer/services/search';
import nunjucks from 'nunjucks';
import isEqual from 'react-fast-compare';
import debounce from 'debounce';

import Loading from './Loading';
import WidgetGraph from './WidgetGraph';

const env = nunjucks.configure();
env.addFilter('formatNumber', value => new Intl.NumberFormat().format(value));

const getAggregationValue = (aggregation, match = []) => {
  if (!aggregation) return null;

  const { value, buckets } = aggregation;

  if (buckets) {
    return buckets
  }

  return value;
};

export class WidgetSynthesis extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      field: PropTypes.string,
      format: PropTypes.string,
    })),
  }

  static defaultProps = {
    items: [],
  }

  state = {
    values: {},
  }

  debouncedLoad = debounce(() => this.load(), 1000);

  componentDidMount () {
    const { map, boundingbox_mode: boundingBoxMode } = this.props;
    if (!map) return;
    this.debouncedLoad();
    if (boundingBoxMode === 'visible') {
      map.on('moveend', this.debouncedLoad);
      map.on('zoomend', this.debouncedLoad);
    }
  }

  componentDidUpdate ({
    filters: prevFilters,
    query: prevQuery,
    visibleBoundingBox: prevVisibleBoundingBox,
    boundingbox_mode: prevBoundingBoxMode,
  }) {
    const { filters, query, visibleBoundingBox, boundingbox_mode: boundingBoxMode } = this.props;
    if (!isEqual(filters, prevFilters)
      || query !== prevQuery
      || boundingBoxMode !== prevBoundingBoxMode
      || (boundingBoxMode !== 'defined' && visibleBoundingBox !== prevVisibleBoundingBox)) {
      this.resetValues();
      this.debouncedLoad();
    }
  }

  componentWillUnmount () {
    this.isUnmount = true;
    const { map } = this.props;
    if (!map) return;
    map.off('moveend', this.debouncedLoad);
    map.off('zoomend', this.debouncedLoad);
  }

  getContent(item) {
    const { values: { [item.name]: rawValue } } = this.state;

    if (item.type === 'distribution') {
      return (
        <div className="widget-synthesis__value">
          <WidgetGraph
            data={rawValue ?? []}
            type={item.graph.type}
            loading={rawValue === undefined}
          />
        </div>
      );
    }
    if (item.type === 'categoric') {
      return (
        <div className="widget-synthesis__value">
          <WidgetGraph
            data={rawValue ? rawValue.map(v => ({ key: v.key, doc_count: v.nested.value })) : []}
            type={item.graph.type}
            loading={rawValue === undefined}
          />
        </div>
      );
    }
    const value = this.formatValue(item)
    if (rawValue === undefined) {
      return <Loading />;
    }
    return (
      <div
        className="widget-synthesis__value"
        // Value could contains html that should be rendered
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  resetValues () {
    this.setState({ values: {} });
  }

  async load () {
    const {
      items,
      filters,
      form,
      layer,
      query,
      map,
      visibleBoundingBox,
      boundingbox_mode: boundingBoxMode,
      boundingbox_value: boundingBoxValue,

      displayedLayer: { baseEsQuery = {} } = {},
    } = this.props;

    if (!map) return;
    const boundingBox = boundingBoxMode === 'defined' ? boundingBoxValue : getExtent(map, visibleBoundingBox);

    const aggregations = items.map(({ name, type, field, graph }) => {
      switch (type) {
        case 'distribution':
          return ({
            name,
            type: 'terms',
            field: `${field}.keyword`,
          });
        case 'categoric':
          return ({
            name,
            type: 'terms',
            field: `${field}.keyword`,
            nest: q => q.aggregation(graph.aggregation_type, graph.value_field, {}, 'nested'),
          });
        default:
          return ({
            name, type, field,
          });
      }
    });

    const properties = {
      ...Object.keys(filters).reduce((all, key) => ({
        ...all,
        ...getSearchParamFromProperty(filters, form, key),
      }), {}),
    };

    this.setState({ values: {} });
    const data = await searchService.search({
      index: layer,
      query,
      properties,
      boundingBox,
      aggregations,
      baseQuery: baseEsQuery,
      size: 0,
    });


    if (data.status !== 200) {
      return;
    }

    if (this.isUnmount) return;

    const values = items.reduce((prev, { name, value }) => ({
      ...prev,
      [name]: getAggregationValue(data.aggregations[name], value),
    }), {});

    this.setState({ values });
  }

  formatValue({ name, template }) {
    const { values: { [name]: rawValue } } = this.state;
    if (!template) {
      return rawValue;
    }
    return nunjucks.renderString(template, { value: rawValue });
  }

  render() {
    const { items } = this.props;

    return (
      <div className="widget-synthesis">
        {items.map((item, index) => (
          <>
            <div
              className="widget-synthesis__item"
              key={`${JSON.stringify(item)}`}
            >
              {this.getContent(item)}
              <div className="widget-synthesis__label">{item.name}</div>
            </div>
            {index < items.length - 1 && <hr style={{ width: '100%', borderTop: 1 }} />}
          </>
        ))}
      </div>
    );
  }
}

export default WidgetSynthesis;
