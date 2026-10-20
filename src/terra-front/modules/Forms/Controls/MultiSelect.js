import React from 'react';

import PropTypes from 'prop-types';

import classnames from 'classnames';
import debounce from 'lodash.debounce';
import {
  Button,
  Intent,
  Menu,
  MenuItem,
  Spinner,
} from '@blueprintjs/core';
import { MultiSelect as BPMultiSelect } from '@blueprintjs/select';

import { preventEnterKeyPress } from '../../../utils/event';
import translateMock from '../../../utils/translate';
import NoValues from './NoValues';
import rankMatches, { MAX_RENDERED_ITEMS } from './rankMatches';
import formatValues from './formatValues';

// With more than 250 items we don't display result but we propose a search
const MAX_DISPLAY_ITEMS = 250;
export const MIN_QUERY_LENGTH = 1;

export class MultiSelect extends React.Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    onChange: PropTypes.func,
    values: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any.isRequired,
        }),
      ]),
    ).isRequired,
    isSubmissionPrevented: PropTypes.bool,
    translate: PropTypes.func,
    loading: PropTypes.bool,
    minCharacters: PropTypes.number,
    highlightSearch: PropTypes.bool,
    onQueryChange: PropTypes.func,
  };

  static defaultProps = {
    label: '',
    value: [],
    isSubmissionPrevented: true,
    onChange () {},
    translate: translateMock({
      'terralego.forms.controls.multiselect.no_results': 'No results.',
      'terralego.forms.controls.multiselect.loading': 'Loading...',
      'terralego.forms.controls.multiselect.select_placeholder': 'Enter a query first',
      'terralego.forms.controls.multiselect.select_placeholder_plural': 'Enter at least {{count}} characters',
      'terralego.forms.controls.multiselect.input_placeholder': 'Search...',
      'terralego.forms.controls.multiselect.too_many': 'Too many results, please refine your query...',
      'terralego.forms.controls.noValues': 'No choice available',
    }),
    loading: false,
    minCharacters: 0,
    highlightSearch: true,
    onQueryChange: null,
  };

  state = {
    values: [],
    value: [],
    lastValues: null,
    searching: false,
  }

  static getDerivedStateFromProps ({ values, value }, state) {
    // A new values list means the search we were waiting for has landed
    const searching = state.lastValues === values ? state.searching : false;

    // Avoid race condition
    if (!values) {
      return {
        values: [],
        value: [],
        lastValues: values,
        searching,
      };
    }

    const formatedValues = formatValues(values);

    const findLabel = (list, val) =>
      (list.find(({ value: availableVal }) => val === availableVal) || {}).label;
    const formatedValue = value.map(val => {
      const label = findLabel(formatedValues, val) ?? findLabel(state.value, val) ?? String(val);
      return {
        label,
        value: val,
      };
    });

    return {
      values: formatedValues,
      value: formatedValue,
      lastValues: values,
      searching,
    };
  }

  handleChange = item => {
    const { value, onChange } = this.props;
    const newValue = value.includes(item.value)
      ? value.filter(val => val !== item.value)
      : [...value, item.value];
    onChange(newValue);
  };

  handleTagRemove = (_, index) => {
    const { value, onChange } = this.props;
    const newValue = value.filter((__, idx) => idx !== index);
    onChange(newValue);
  }

  searchValues = debounce(query => {
    const { onQueryChange } = this.props;
    if (onQueryChange) onQueryChange(query);
  }, 300);

  componentWillUnmount () {
    this.searchValues.cancel();
  }

  handleQueryChange = query => {
    const { onQueryChange } = this.props;
    if (!onQueryChange) return;

    if (query.length && query.length < MIN_QUERY_LENGTH) {
      this.searchValues.cancel();
      this.setState({ searching: false });
      return;
    }

    this.setState({ searching: true });
    this.searchValues(query);
  };

  handleClear = () => {
    const { onChange } = this.props;
    onChange([]);
  };

  render () {
    const {
      handleChange,
      handleTagRemove,
    } = this;

    const {
      label,
      value: origValue,
      isSubmissionPrevented,
      className,
      translate,
      loading,
      minCharacters,
      onQueryChange,
      highlightSearch,
      ...props
    } = this.props;

    const { values, value } = this.state;
    const displayClearButton = value.length > 0;

    return (
      <div
        className="control-container"
        onKeyPress={isSubmissionPrevented ? preventEnterKeyPress : null}
        role="presentation"
      >
        <p className="control-label">{label}</p>
        {loading && <Spinner size={20} />}
        {!loading && !values.length && <NoValues placeholder={translate('terralego.forms.controls.noValues')} />}
        {!loading && (
          <BPMultiSelect
            className={classnames('tf-multiselect', className)}
            onQueryChange={this.handleQueryChange}
            resetOnSelect
            fill
            items={values}
            selectedItems={value}
            onItemSelect={handleChange}
            tagRenderer={item => item.label}
            popoverProps={{ usePortal: false }}
            placeholder={translate('terralego.forms.controls.multiselect.input_placeholder')}
            tagInputProps={{
              tagProps: { intent: Intent.NONE, interactive: true },
              onRemove: handleTagRemove,
              rightElement: (this.state.searching && <Spinner size={16} />)
                || (displayClearButton && (
                  <Button icon="cross" minimal onClick={this.handleClear} />
                )),
            }}
            itemListPredicate={(query, items) =>
              rankMatches(items, query.length < minCharacters ? '' : query, MAX_RENDERED_ITEMS)}
            itemRenderer={({ label: itemLabel, value: itemValue }, {
              query, handleClick, modifiers: { matchesPredicate, ...modifiers },
            }) => {
              if (!matchesPredicate) {
                return null;
              }
              const regExp = new RegExp(`(${query})`, 'i');
              return (
                <MenuItem
                  active={modifiers.active}
                  icon={origValue.includes(itemValue) ? 'tick' : 'blank'}
                  key={`${itemValue}${itemLabel}`}
                  onClick={handleClick}
                  text={query && highlightSearch
                    ? itemLabel.split(regExp).map(
                      // eslint-disable-next-line react/no-array-index-key
                      (elem, i) => (i % 2 ? <strong key={`${itemLabel}-${i}`}>{elem}</strong> : elem),
                    ) : itemLabel}
                  shouldDismissPopover={false}
                />
              );
            }}
            itemListRenderer={listProps => {
              const items = listProps.filteredItems;
              let message = null;
              // If we have no query or a query too short and too many results
              if ((!listProps.query || listProps.query.length < minCharacters)
                && items.length > MAX_DISPLAY_ITEMS) {
                message = translate('terralego.forms.controls.multiselect.select_placeholder', { count: minCharacters });
              } else if (items.length > MAX_DISPLAY_ITEMS) {
                // If we have a query but too many results
                message = translate('terralego.forms.controls.multiselect.too_many');
              } else if (items.length === 0 && this.state.searching) {
                message = translate('terralego.forms.controls.multiselect.loading');
              } else if (items.length === 0) {
                // If we have no results
                message = translate('terralego.forms.controls.multiselect.no_results');
              }
              return (
                <Menu ulRef={listProps.itemsParentRef}>
                  {message !== null
                    ? <MenuItem disabled text={message} />
                    : items.map(listProps.renderItem)}
                </Menu>
              );
            }}
            {...props}
          />
        )}
      </div>
    );
  }
}

export default MultiSelect;
