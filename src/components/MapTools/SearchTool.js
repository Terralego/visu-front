import SearchIcon from '@mui/icons-material/Search';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import translateMock from '@terralego/core/utils/translate';
import ToolButton from './ToolButton';

import './searchPanel.scss';

const SEARCH_SHORTCUT = /Mac|iPhone|iPad|iPod/.test(global.navigator?.platform || '')
  ? '\u2318K'
  : 'Ctrl+K';

export class SearchTool extends React.Component {
  static propTypes = {
    map: PropTypes.shape({
      fitBounds: PropTypes.func.isRequired,
      setCenter: PropTypes.func.isRequired,
    }).isRequired,
    onSearch: PropTypes.func,
    onSearchResultClick: PropTypes.func,
    renderSearchResults: PropTypes.func.isRequired,
    renderSearchInput: PropTypes.func.isRequired,
    minQueryLength: PropTypes.number,
    disabled: PropTypes.bool,
    translate: PropTypes.func,
  }

  static defaultProps = {
    onSearch () {},
    onSearchResultClick () {},
    disabled: false,
    minQueryLength: 3,
    translate: translateMock({
      'terralego.map.search_control.button_label': 'Search',
      'terralego.map.search_control.clear': 'Clear search',
      'terralego.map.search_control.close': 'Close',
      'terralego.map.search_control.min_length': 'Type at least {{count}} characters',
      'terralego.map.search_results.error': 'Search failed on this layer',
      'terralego.map.search_results.more': '+{{count}} more results',
      'terralego.map.search_results.go_to': 'Go to result',
      'terralego.map.search_results.locations': 'Locations',
    }),
  }

  state = {
    visible: false,
    expanded: false,
    query: '',
    results: null,
    displayResults: false,
    selected: -1,
  };

  debouncedSearch = debounce(() => this.search(), 200);

  panelRef = React.createRef();

  buttonRef = React.createRef();

  componentDidMount () {
    this.shortcutListener = event => {
      const { key, metaKey, ctrlKey } = event;
      if (`${key}`.toLowerCase() !== 'k' || !(metaKey || ctrlKey)) return;

      const { disabled } = this.props;
      if (disabled) return;

      event.preventDefault();

      const { visible } = this.state;
      if (!visible) {
        this.toggle(true);
        return;
      }
      const input = this.panelRef.current && this.panelRef.current.querySelector('input');
      if (input) input.select();
    };
    global.addEventListener('keydown', this.shortcutListener);

    this.listener = ({ target }) => {
      const { query } = this.state;

      if (this.buttonRef.current && this.buttonRef.current.contains(target)) return;
      if (this.panelRef.current && this.panelRef.current.contains(target)) return;

      this.toggleResultsDisplay(false);

      if (query) return;

      this.toggle(false);
    };
    global.addEventListener('click', this.listener);
  }

  componentWillUnmount () {
    global.removeEventListener('click', this.listener);
    global.removeEventListener('keydown', this.shortcutListener);
    this.isUnmount = true;
  }

  get flatResults () {
    const { results } = this.state;
    return Array.isArray(results) && results.reduce((all, { results: groupResults }) => [
      ...all,
      ...groupResults,
    ], []);
  }

  toggle = state => this.setState(({ visible }) => {
    if (visible && state !== true) {
      setTimeout(() => {
        if (this.isUnmount) return;
        this.setState({ visible: false });
      }, 500);
      return ({ expanded: false, results: null, selected: -1, query: '' });
    }
    if (!visible && state !== false) {
      setTimeout(() => {
        if (this.isUnmount) return;
        this.setState({ expanded: true });
        const input = this.panelRef.current && this.panelRef.current.querySelector('input');
        if (input) input.focus();
      });
      return ({ visible: true });
    }
    return null;
  });

  close = () => this.toggle(false);

  onChange = ({ target: { value: query } }) => {
    this.setState({ query });
    this.debouncedSearch();
  }

  onKeyPress = event => {
    const { key } = event;
    const results = this.flatResults;

    if (key === 'Escape') {
      this.toggle(false);
      return;
    }

    this.toggleResultsDisplay(true);

    if (!results || !results.length) return;

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      this.selectResultItem(key === 'ArrowDown' ? +1 : -1);
    }
    if (key === 'Enter') {
      const { selected } = this.state;
      const selectedResult = results[selected] || results[0];
      if (!selectedResult) return;
      this.clickOnResult(selectedResult);
    }
  }

  toggleResultsDisplay = state => this.setState({ displayResults: state });

  focusOnSearchResult = ({ center, bounds }) => {
    const { map } = this.props;
    if (bounds) {
      map.fitBounds(bounds, { padding: 10 });
      return;
    }
    if (center) {
      map.setCenter(center);
    }
  }

  clickOnResult = async result => {
    const { map, onSearchResultClick } = this.props;
    await onSearchResultClick({
      result,
      map,
      focusOnSearchResult: this.focusOnSearchResult,
      setQuery: query => this.setState({ query }),
    });
    this.toggle(false);
  }

  async search () {
    const { map, onSearch, minQueryLength } = this.props;
    const { query } = this.state;

    this.searchId = (this.searchId || 0) + 1;
    const { searchId } = this;

    if (query.length < minQueryLength) {
      this.setState({ displayResults: false, results: null, selected: -1, loading: false });
      return;
    }

    this.setState({ loading: true });

    let results;
    try {
      results = await onSearch(query, map);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Search failed:', e);
    }

    if (this.isUnmount || searchId !== this.searchId) return;
    this.setState({ displayResults: !!results, results, selected: -1, loading: false });
  }

  selectResultItem (dir) {
    this.setState(({ selected }) => {
      const max = this.flatResults.length;

      if (selected + dir < 0) {
        return { selected: max - 1 };
      }

      if (selected + dir >= max) {
        return { selected: 0 };
      }

      return { selected: selected + dir };
    });
  }

  render () {
    const {
      renderSearchResults: SearchResults,
      renderSearchInput: SearchInput,
      minQueryLength,
      translate,
    } = this.props;
    const { disabled } = this.props;
    const { visible, expanded, query, displayResults, results, selected, loading } = this.state;

    return (
      <>
        <ToolButton
          ref={this.buttonRef}
          label={`${translate('terralego.map.search_control.button_label')} (${SEARCH_SHORTCUT})`}
          icon={<SearchIcon sx={{ fontSize: 20 }} />}
          isActive={visible}
          disabled={disabled}
          onClick={this.toggle}
        />
        {visible && ReactDOM.createPortal(
          <div
            ref={this.panelRef}
            className={classnames({
              'mapboxgl-ctrl-search__input': true,
              'mapboxgl-ctrl-search__input--expanded': expanded,
            })}
          >
            <div className="mapboxgl-ctrl-search__panel">
              <SearchInput
                {...this.props}
                minQueryLength={minQueryLength}
                onChange={this.onChange}
                onClose={this.close}
                onFocus={() => this.toggleResultsDisplay(true)}
                query={query}
                onKeyPress={this.onKeyPress}
                loading={loading}
              />
              {displayResults && Array.isArray(results) && (
                <SearchResults
                  {...this.props}
                  query={query}
                  results={results}
                  onClick={this.clickOnResult}
                  selected={this.flatResults[selected]}
                />
              )}
            </div>
          </div>,
          global.document.body,
        )}
      </>
    );
  }
}

export default SearchTool;
