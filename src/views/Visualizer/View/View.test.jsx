import React from 'react';
import renderer from 'react-test-renderer';
import { Visualizer } from './View';

jest.mock('./Widgets', () => () => <div data-mock="./Widgets" />);
jest.mock('uuid/v4', () => () => 'mocked-uniq-id');
jest.mock('./DataTable', () => () => <div data-mock="./DataTable" />);
jest.mock('@terralego/core/modules/Map/InteractiveMap', () => () => <div data-mock="@terralego/core/modules/Map/InteractiveMap" />);
jest.mock('@terralego/core/modules/Map', () => ({ DEFAULT_CONTROLS: [] }));

it('should render correctly', () => {
  const tree = renderer.create(<Visualizer />);
  expect(tree.toJSON()).toMatchSnapshot();
});
