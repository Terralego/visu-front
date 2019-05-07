import React from 'react';
import renderer from 'react-test-renderer';
import FiltersPanel from './FiltersPanel';

jest.mock('react-dom', () => ({
  createPortal: node => node,
}));

jest.mock('./FiltersPanelContent', () => function FiltersPanelContent () {
  return <p>FiltersPanelContent</p>;
});

it('should render correctly', () => {
  const tree = renderer.create((
    <FiltersPanel />
  )).toJSON();

  expect(tree).toMatchSnapshot();
});
