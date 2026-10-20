import React from 'react';
import { render } from '@testing-library/react';

import context from '../LayersTreeProvider/context';
import LayersTreeVariableItem from './LayersTreeVariableItem';

vi.mock('.', () => ({
  default: ({ layer, customLabel, children }) => (
    <div data-testid="item" data-layer={layer.label}>{customLabel}{children}</div>
  ),
}));

vi.mock('../../../Forms/Controls/Select', () => ({
  default: ({ value }) => <span data-testid="variable">{value}</span>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));

const group = { group: 'Population', variables: [{ id: 'year' }] };
const layers = [
  { label: '2020', variables: { year: '2020' }, initialState: { active: true } },
  { label: '2021', variables: { year: '2021' }, initialState: {} },
];

const renderItem = layersTreeState => {
  const setLayerState = vi.fn();
  const value = {
    setLayerState,
    getLayerState: ({ layer }) => layersTreeState.get(layer) || {},
  };
  const result = render(
    <context.Provider value={value}>
      <LayersTreeVariableItem group={group} layers={layers} activeLayer={layers[0]} />
    </context.Provider>,
  );
  return { ...result, setLayerState };
};

it('should show the layer active in the tree state rather than the default one', () => {
  const { getByTestId, setLayerState } = renderItem(new Map([
    [layers[0], { active: false }],
    [layers[1], { active: true }],
  ]));

  expect(getByTestId('item').dataset.layer).toBe('2021');
  expect(getByTestId('variable').textContent).toBe('2021');
  expect(setLayerState).not.toHaveBeenCalled();
});

it('should leave the group off when none of its layers is active', () => {
  const { getByTestId, setLayerState } = renderItem(new Map([
    [layers[0], { active: false }],
    [layers[1], { active: false }],
  ]));

  expect(getByTestId('item').dataset.layer).toBe('2020');
  expect(setLayerState).not.toHaveBeenCalled();
});
