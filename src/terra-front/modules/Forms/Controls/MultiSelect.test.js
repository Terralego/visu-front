import { MultiSelect } from './MultiSelect';

const derive = (props, state = { value: [] }) =>
  MultiSelect.getDerivedStateFromProps(props, state);

it('should label the selected values from the list', () => {
  const { value } = derive({ values: [{ value: 'a', label: 'Alpha' }], value: ['a'] });

  expect(value).toEqual([{ value: 'a', label: 'Alpha' }]);
});

it('should keep the previous label of a value missing from the list', () => {
  const state = { value: [{ value: 'a', label: 'Alpha' }] };

  const { value } = derive({ values: ['b'], value: ['a'] }, state);

  expect(value).toEqual([{ value: 'a', label: 'Alpha' }]);
});

it('should fall back to the value itself when no label is known', () => {
  const { value } = derive({ values: ['b'], value: ['a'] });

  expect(value).toEqual([{ value: 'a', label: 'a' }]);
});

describe('the results list', () => {
  const renderList = searching => {
    const instance = new MultiSelect({ ...MultiSelect.defaultProps, values: [] });
    instance.state = { ...instance.state, searching };
    const { props: { itemListRenderer } } = instance.render().props.children[3];
    const list = itemListRenderer({ filteredItems: [], query: 'tou', itemsParentRef: null });
    return list.props.children.props.text;
  };

  it('should tell a search is loading', () => {
    expect(renderList(true)).toBe('Loading...');
  });

  it('should tell there are no results once the search is done', () => {
    expect(renderList(false)).toBe('No results.');
  });
});
