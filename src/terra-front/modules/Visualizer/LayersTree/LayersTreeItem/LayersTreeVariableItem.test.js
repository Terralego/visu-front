import React, { createContext as mockCreateContext } from 'react';
import renderer from 'react-test-renderer';
import LayersTreeVariableItem from './LayersTreeVariableItem';

jest.mock('../LayersTreeProvider/context', () => {
  const context = mockCreateContext({
    setLayerState: () => {},
    getLayerState: () => {},
    layersExtent: () => {},
    isDetailsVisible: () => {},
  });
  return context;
});
jest.mock(
  '.',
  () =>
    function LayersTreeItem () {
      return <p>LayersTreeItem</p>;
    },
);

describe('LayersTreeVariableItem', () => {
  it('should render', () => {
    const layers = [
      { variable: 'variable1', value: 'value1', active: true },
      { variable: 'variable2', value: 'value2', active: false },
    ];
    const group = {
      variables: [
        { id: 'variable1', label: 'Variable 1' },
        { id: 'variable2', label: 'Variable 2' },
      ],
      group: 'Group 1',
      layers,
    };

    const tree = renderer.create(<LayersTreeVariableItem group={group} layers={layers} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
