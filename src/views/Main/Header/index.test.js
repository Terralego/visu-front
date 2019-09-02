import React from 'react';
import renderer from 'react-test-renderer';
import { Header } from './Header';

jest.mock('react-router-dom', () => ({
  Route: () => null,
  Switch: () => null,
  Link: () => null,
  withRouter: ({ children }) => children,
}));

it('should render correctly', () => {
  const tree = renderer.create((
    <Header
      location={{ pathname: '/' }}
      env={{ VIEW_ROOT_PATH: '' }}
    />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});
