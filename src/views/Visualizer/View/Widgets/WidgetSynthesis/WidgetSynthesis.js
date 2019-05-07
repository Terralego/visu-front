import React from 'react';
import PropTypes from 'prop-types';
import nunjucks from 'nunjucks';
import isEqual from 'react-fast-compare';
import debounce from 'debounce';

import searchService, { getExtent } from '../../../../../services/search';
import Loading from './Loading';

const env = nunjucks.configure();
env.addFilter('formatNumber', value => new Intl.NumberFormat().format(value));

const getAggregationValue = (aggregation, match = []) => {
  if (!aggregation) return null;

  const { value, buckets } = aggregation;

  if (buckets) {
    return buckets
      .filter(({ key }) => match.includes(key))
      .reduce((total, { doc_count: docCount }) => total + docCount, 0);
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
    this.debouncedLoad();
  }

  componentDidUpdate ({ filters: prevFilters, query: prevQuery, mapState: prevMapState }) {
    const { filters, query, mapState } = this.props;
    if (!isEqual(filters, prevFilters)
      || query !== prevQuery
      || mapState !== prevMapState) {
      this.resetValues();
      this.debouncedLoad();
    }
  }

  componentWillUnmount () {
    this.isUnmount = true;
  }

  resetValues () {
    this.setState({ values: {} });
  }

  async load () {
    const { items, filters, query, map } = this.props;

    if (!map) return;

    const aggregations = items.map(({ name, type, field }) => ({
      name, type, field,
    }));

    const boundingBox = getExtent(map);

    const data = await searchService.search({
      aggregations,
      properties: filters,
      query,
      boundingBox,
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

  formatValue ({ name, label = name, template }) {
    const { values: { [name]: rawValue } } = this.state;
    const withValue = value => ({ label, value });
    if (rawValue === undefined) {
      return withValue(Loading);
    }

    if (!template) {
      return withValue(rawValue);
    }

    return withValue(
      nunjucks.renderString(template, { value: rawValue }),
    );
  }

  render () {
    const { items } = this.props;
    const values = items.map(item => this.formatValue(item));

    return (
      <div className="widget-synthesis">
        {values.map(({ label, value: Value }) => (
          <div
            className="widget-synthesis__item"
            key={`${label}${Value}`}
          >
            {typeof Value === 'function'
              ? <Value />
              : (
                <div
                  className="widget-synthesis__value"
                  // Value could contains html that should be rendered
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: Value }}
                />
              )}
            <div className="widget-synthesis__label">{label}</div>
          </div>
        ))}
      </div>
    );
  }
}

export default WidgetSynthesis;
