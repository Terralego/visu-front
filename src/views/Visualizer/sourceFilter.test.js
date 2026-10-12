import addSourceFilter from './sourceFilter';

const node = (overrides = {}) => ({
  id: 15,
  layers: ['mapbox-a', 'mapbox-b'],
  source_filter: 'MnNaturePort == "Maritime"',
  ...overrides,
});

const style = () => ({ layers: [{ id: 'mapbox-a' }, { id: 'mapbox-b' }, { id: 'other' }] });

it('compiles the source filter for both targets', () => {
  const layer = node();

  addSourceFilter(layer, style());

  expect(layer.baseEsQuery).toBeTruthy();
  expect(JSON.stringify(layer.baseMbQuery)).toContain('MnNaturePort');
});

it('applies the mapbox filter on the first layer of the node', () => {
  const layer = node();
  const customStyle = style();

  addSourceFilter(layer, customStyle);

  expect(customStyle.layers[0].filter).toEqual(layer.baseMbQuery.filter);
  expect(customStyle.layers[1].filter).toBeUndefined();
  expect(customStyle.layers[2].filter).toBeUndefined();
});

it('leaves a node without source filter untouched', () => {
  const layer = node({ source_filter: '' });
  const customStyle = style();

  addSourceFilter(layer, customStyle);

  expect(layer.baseEsQuery).toBeUndefined();
  expect(customStyle.layers.every(({ filter }) => filter === undefined)).toBe(true);
});

it('walks into groups', () => {
  const child = node();
  const customStyle = style();

  addSourceFilter({ group: 'a group', layers: [child] }, customStyle);

  expect(child.baseEsQuery).toBeTruthy();
  expect(customStyle.layers[0].filter).toBeTruthy();
});
