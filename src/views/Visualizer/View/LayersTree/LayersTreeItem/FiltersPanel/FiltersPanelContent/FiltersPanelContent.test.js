import React from 'react';
import renderer from 'react-test-renderer';
import FiltersPanelContent from './FiltersPanelContent';


it('should render correctly', () => {
  const tree = renderer.create((
    <FiltersPanelContent layer={{ filters: { form: [] } }} />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});
