import React from 'react';
import renderer from 'react-test-renderer';
import Search from '.';

jest.mock('@blueprintjs/core', () => ({
  InputGroup () {
    return <p>InputGroup</p>;
  },
}));
it('should render correctly', () => {
  const tree = renderer.create(<Search
    value="foo"
    onChange={() => {}}
  />).toJSON();
  expect(tree).toMatchSnapshot();
});
