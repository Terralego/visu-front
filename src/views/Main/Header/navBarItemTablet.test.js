import React from 'react';
import renderer from 'react-test-renderer';
import { NavBarItemTablet } from './NavBarItemTablet';

jest.mock('./HeaderLink', () => () => 'HeaderLink');
jest.mock('./HeaderButton', () => () => 'HeaderButton');

it('should render correctly the component', () => {
  const tree = renderer.create((
    <NavBarItemTablet env={{ VIEW_ROOT_PATH: 'visualiser' }} id="test" />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});
