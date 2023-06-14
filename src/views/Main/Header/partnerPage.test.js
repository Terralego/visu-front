import React from 'react';
import renderer from 'react-test-renderer';
import PartnerPage from './PartnerPage';

it('should render correctly', () => {
  const tree = renderer.create(
    <PartnerPage />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly with info content', () => {
  const tree = renderer.create(
    <PartnerPage content="<div>Custom content</div>" />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
