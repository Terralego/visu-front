import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { MenuItem, Button, Spinner } from '@blueprintjs/core';
import { Select as BPSelect } from '@blueprintjs/select';
import debounce from 'lodash.debounce';
import { v4 as uuid } from 'uuid';

import { preventEnterKeyPress } from '../../../../utils/event';
import translateMock from '../../../../utils/translate';
import rankMatches, { MAX_RENDERED_ITEMS } from '../rankMatches';
import formatValues from '../formatValues';
import NoValues from '../NoValues';

const MAX_NON_FILTERABLE_COUNT = 9;
export const MIN_QUERY_LENGTH = 1;
const SEARCH_DEBOUNCE = 300;

export class Select extends React.Component {
  static propTypes = {
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
    onQueryChange: PropTypes.func,
  };

  static defaultProps = {
    label: '',
    isSubmissionPrevented: true,
    onChange () {},
    translate: translateMock({
      'terralego.forms.controls.select.empty_item': 'All',
      'terralego.forms.controls.select.no_results': 'No results.',
      'terralego.forms.controls.select.select_placeholder': 'Enter a query first',
      'terralego.forms.controls.select.input_placeholder': 'Filter...',
      'terralego.forms.controls.noValues': 'No choice available',
    }),
    loading: false,
    onQueryChange: null,
  };

  static getDerivedStateFromProps ({ values = [], value }, state) {
    // A new values list means the search we were waiting for has landed
    const searching = state.lastValues === values ? state.searching : false;

    if (!values.length) {
      return {
        values,
        value: null,
        lastValues: values,
        searching,
      };
    }

    const formatedValues = formatValues(values);

    const foundValue = value
      ? formatedValues.find(({ value: availableVal }) => value === availableVal)
      : formatedValues[0];

    return {
      values: formatedValues,
      value: foundValue,
      lastValues: values,
      searching,
    };
  }

  state = {
    values: [],
    value: null,
    lastValues: null,
    searching: false,
  };

  uuid = `select-${uuid()}`;

  searchValues = debounce(query => {
    const { onQueryChange } = this.props;
    if (onQueryChange) onQueryChange(query);
  }, SEARCH_DEBOUNCE);

  componentWillUnmount () {
    this.searchValues.cancel();
  }

  handleQueryChange = query => {
    const { onQueryChange } = this.props;
    if (!onQueryChange) return;

    // Below the threshold the local list is enough and the query would match
    // far too many values to be useful
    if (query.length && query.length < MIN_QUERY_LENGTH) {
      this.searchValues.cancel();
      this.setState({ searching: false });
      return;
    }

    this.setState({ searching: true });
    this.searchValues(query);
  };

  handleChange = ({ value }) => {
    const { onChange } = this.props;
    onChange(value);
  };

  render () {
    const {
      label,
      placeholder,
      isSubmissionPrevented,
      value: origValue,
      className,
      inline,
      fullWidth,
      translate,
      loading,
      onQueryChange,
      ...props
    } = this.props;

    const { values = [], value, searching } = this.state;
    const { handleChange } = this;

    const displayedValue = value ? value.label : '';

    return (
      <div
        className={classnames(
          'control-container',
          'control-container--select',
          { 'control-container--full-width': fullWidth },
        )}
        onKeyPress={isSubmissionPrevented ? preventEnterKeyPress : null}
        role="presentation"
      >
        <label
          htmlFor={this.uuid}
          className={classnames(
            'control-label',
            { 'control-label--inline': inline },
          )}
        >
          {label}
        </label>
        {loading && <Spinner size={20} />}
        {!loading && !values.length && <NoValues placeholder={translate('terralego.forms.controls.noValues')} />}
        {!loading && (
          <BPSelect
            className={classnames('tf-select', className)}
            popoverProps={{ usePortal: false, boundary: 'viewport', minimal: true }}
            items={values}
            filterable={!!onQueryChange || values.length > MAX_NON_FILTERABLE_COUNT}
            onQueryChange={this.handleQueryChange}
            initialContent={(values && values.length > 250)
              ? <MenuItem disabled text={translate('terralego.forms.controls.select.select_placeholder')} />
              : undefined}
            inputProps={{
              placeholder: translate('terralego.forms.controls.select.input_placeholder'),
              rightElement: searching ? <Spinner size={16} /> : undefined,
            }}
            itemListPredicate={(query, items) =>
              rankMatches(items, query, MAX_RENDERED_ITEMS)}
            itemRenderer={({
              label: itemLabel, value: itemValue,
            }, {
              handleClick, modifiers: { matchesPredicate, ...modifiers },
            }) => (
              <div
                key={`${itemValue}${itemLabel}`}
                className={classnames({
                  'control-container__item': true,
                  'control-container__item--empty': itemValue === '',
                })}
              >
                <MenuItem
                  {...modifiers}
                  active={value?.value === itemValue}
                  onClick={handleClick}
                  text={itemLabel}
                />
              </div>
            )}
            noResults={(
              <MenuItem
                disabled
                text={translate('terralego.forms.controls.select.no_results')}
              />
            )}
            onItemSelect={handleChange}
            {...props}
          >
            <Button
              id={this.uuid}
              text={displayedValue || translate('terralego.forms.controls.select.empty_item')}
              rightIcon="double-caret-vertical"
            />
          </BPSelect>
        )}
      </div>
    );
  }
}

export default Select;
