import React from 'react';
import renderer from 'react-test-renderer';
import { HeaderButton } from './HeaderButton';

it('should render correctly', () => {
  const tree = renderer.create(
    <HeaderButton id="theme" />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
