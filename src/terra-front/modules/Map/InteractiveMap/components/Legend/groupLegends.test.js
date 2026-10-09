import groupLegendsByLayer from './groupLegends';

it('should gather the legends of a single layer in one block', () => {
  const groups = groupLegendsByLayer([
    { group: 'a', title: 'first', renderUuid: '1' },
    { group: 'b', title: 'other', renderUuid: '2' },
    { group: 'a', title: 'second', renderUuid: '3' },
  ]);

  expect(groups.map(({ legends }) => legends.map(({ title }) => title)))
    .toEqual([['first', 'second'], ['other']]);
});

it('should keep ungrouped legends in blocks of their own', () => {
  const groups = groupLegendsByLayer([
    { title: 'loose', renderUuid: '1' },
    { title: 'other', renderUuid: '2' },
  ]);

  expect(groups).toHaveLength(2);
  expect(groups.map(({ key }) => key)).toEqual(['1', '2']);
});
