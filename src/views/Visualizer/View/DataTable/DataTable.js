
import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Table from '@terralego/core/modules/Table';
import debounce from 'debounce';

import { extractColumns, prepareData, exportData } from './dataUtils';
import searchService, { getExtent } from '../../../../services/search';
import Header from './Header';

import './styles.scss';

export class DataTable extends React.Component {
  static propTypes = {
    displayedLayer: PropTypes.shape({
      filters: PropTypes.shape({
        layer: PropTypes.string.isRequired,
        exportable: PropTypes.bool,
        table: PropTypes.shape({
          title: PropTypes.string,
        }),
        fields: PropTypes.arrayOf(PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          exportable: PropTypes.bool,
          display: PropTypes.bool, // default true
        })),
      }),
    }),
    query: PropTypes.string,
    filters: PropTypes.shape({
      // anyKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
  };

  static defaultProps = {
    displayedLayer: undefined,
    query: '',
    filters: {},
  }

  state = {
    columns: null,
    results: [],
    resultsTotal: 0,
    loading: true,
    selectedFeatures: [],
  };

  debouncedLoadResults = debounce(() => this.loadResults(), 500);

  componentDidMount () {
    const { displayedLayer } = this.props;
    if (displayedLayer) {
      this.debouncedLoadResults();
    }
  }

  componentDidUpdate ({
    displayedLayer: {
      filters: { layer: prevLayer } = {},
      state: { filters: prevFilters } = {},
    } = {},
    query: prevQuery,
  }, {
    extent: prevExtent,
  }) {
    const {
      displayedLayer,
      displayedLayer: {
        filters: { layer } = {},
        state: { filters } = {},
      } = {},
      query,
    } = this.props;
    const { extent } = this.state;

    if (displayedLayer) {
      if (layer !== prevLayer) {
        this.resetColumns();
      }

      if (layer !== prevLayer
        || query !== prevQuery
        || filters !== prevFilters
        || (extent && this.extentChanged())
        || extent !== prevExtent) { // This test must keep at last position
        this.debouncedLoadResults();
      }
    }
  }


  resize = () => this.setState(({ full: prevFull }) => {
    const full = !prevFull;

    if (full) {
      setTimeout(() => this.setState({ full, isResizing: false }), 300);
      return { isResizing: true };
    }
    setTimeout(() => this.setState({ isResizing: false }), 300);
    return { full, isResizing: true };
  })

  toggleExtent = () => this.setState(({ extent }) => ({ extent: !extent }));

  onSelection = selection => {
    const { features } = this.state;

    if (!features) return;

    const selectedFeatures = selection.map(id => features[id]);
    this.setState({ selectedFeatures });
  }

  exportDataAction = () => {
    const {
      displayedLayer: {
        label: name,
        filters: { fields = [] } = {},
      },
    } = this.props;
    const { columns, results } = this.state;

    // Find out which column (indexes) are exportable
    const exportableColumnIndexes = columns.reduce((store, { value }, index) => {
      const fieldConfig = fields.find(field => field.value === value);
      const { exportable = false } = fieldConfig || {};
      return exportable ? [...store, index] : store;
    }, []);

    // Create array of column header texts
    const columnLabels = columns.map(({ value, label = value }) => label);

    // Go through each line and keep only exportable columns
    const data = [columnLabels, ...results]
      .map(dataLine => exportableColumnIndexes.map(index => dataLine[index]));

    exportData({ data, name });
  }

  resetColumns () {
    this.setState({ columns: null });
  }

  extentChanged () {
    const { map, visibleBoundingBox } = this.props;
    const prevExtent = this.prevExtent || [[], []];
    this.prevExtent = getExtent(map, visibleBoundingBox);
    const [[a, b], [c, d]] = prevExtent;
    const [[aa, bb], [cc, dd]] = this.prevExtent;
    return !(a === aa && b === bb && c === cc && d === dd);
  }

  async loadResults () {
    const {
      displayedLayer: { filters: { layer, fields, form }, state: { filters = {} } = {} },
      query,
      map,
      visibleBoundingBox,
    } = this.props;
    const { columns, extent } = this.state;

    this.setState({ loading: true });

    this.prevExtent = extent && getExtent(map, visibleBoundingBox);
    const boundingBox = this.prevExtent;
    const resp = await searchService.search({
      query,
      properties: {
        ...Object.keys(filters).reduce((all, key) => ({
          ...all,
          ...form.find(({ property }) => property === key).values
            ? {
              [`${key}.keyword`]: {
                type: 'term',
                value: filters[key],
              },
            }
            : {
              [key]: filters[key],
            },
        }), {}),
        'layer.keyword': { value: layer, type: 'term' },
      },
      boundingBox,
      include: fields && fields.reduce((all, { value }) => {
        const interpolation = value.match(/\{[^}]+\}/g);
        return [
          ...all,
          ...interpolation
            ? interpolation.map(match => match.match(/\{([^}]+)\}/)[1])
            : [value],
        ];
      }, []),
    });

    const { hits: { hits, total: resultsTotal } } = resp;
    const newColumns = columns || extractColumns(fields, hits);
    const results = prepareData(newColumns, hits);

    this.setState({ features: hits, results, resultsTotal, columns: newColumns, loading: false });
  }

  render () {
    const { displayedLayer } = this.props;

    const {
      label,
      filters: {
        layer,
        table: { title } = {},
        compare,
        exportable,
        fields = [],
      } = {},
    } = displayedLayer || {};

    const haveExportableField = fields.some(({ exportable: exportableField }) => exportableField);
    const showExportButton = exportable && haveExportableField;

    const {
      columns, results, resultsTotal,
      loading, full, isResizing,
      extent, selectedFeatures,
    } = this.state;
    const firstLoading = !columns && loading;

    const { resize, toggleExtent, onSelection, exportDataAction } = this;
    return (
      <div className={classnames({
        'data-table': true,
        'data-table--visible': !!displayedLayer,
      })}
      >
        <div
          className={classnames({
            'table-container': true,
            'table-container--visible': !!displayedLayer,
            'table-container--is-resizing': isResizing,
            'table-container--full': full,
          })}
        >
          <Table
            columns={columns || []}
            data={results || []}
            onSelection={onSelection}
            Header={props => (
              <Header
                {...props}
                resultsTotal={resultsTotal}
                toggleExtent={toggleExtent}
                extent={extent}
                layer={layer}
                compare={compare}
                selectedFeatures={selectedFeatures || []}
                loading={loading}
                title={title || label}
                full={full}
                resize={resize}
                exportData={showExportButton && exportDataAction}
              />
            )}
            locales={{
              sortAsc: 'Trier dans l\'ordre croissant',
              sortDesc: 'Trier dans l\'ordre décroissant',
            }}
            loading={firstLoading}
          />
        </div>
      </div>
    );
  }
}

export default DataTable;
