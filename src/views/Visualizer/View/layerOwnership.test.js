import { flattenLayersTree, layerOwnsMapboxId } from './layerOwnership';

const tree = [
  { id: 1, layers: ['a'] },
  {
    group: 'outer',
    layers: [
      { group: 'inner', layers: [{ id: 2, layers: ['b'] }] },
      { id: 3, sublayers: [{ layers: ['c'] }, { layers: ['d'] }] },
    ],
  },
];

it('flattens nested groups down to their layers', () => {
  expect(flattenLayersTree(tree).map(({ id }) => id)).toEqual([1, 2, 3]);
});

it('recognizes a layer of a nested group by its mapbox id', () => {
  const [, nested] = flattenLayersTree(tree);
  expect(layerOwnsMapboxId(nested, 'b')).toBe(true);
  expect(layerOwnsMapboxId(nested, 'a')).toBe(false);
});

it('looks into the sublayers of a layer by variable', () => {
  const withSublayers = flattenLayersTree(tree)[2];
  expect(layerOwnsMapboxId(withSublayers, 'd')).toBe(true);
});

it('is false without a mapbox id or a layer', () => {
  expect(layerOwnsMapboxId(undefined, 'a')).toBe(false);
  expect(layerOwnsMapboxId({ layers: ['a'] }, undefined)).toBe(false);
});
