import rankMatches from './rankMatches';

const items = ['Montoulieu', 'Toulouse', 'La Tour', 'Toulon', 'Hostouň']
  .map(label => ({ label, value: label }));

it('puts the values starting with the query first', () => {
  expect(rankMatches(items, 'Tou').map(({ label }) => label))
    .toEqual(['Toulon', 'Toulouse', 'Hostouň', 'La Tour', 'Montoulieu']);
});

it('ignores the case', () => {
  expect(rankMatches(items, 'TOUL').map(({ label }) => label))
    .toEqual(['Toulon', 'Toulouse', 'Montoulieu']);
});

it('drops the values that do not match', () => {
  expect(rankMatches(items, 'zzz')).toEqual([]);
});

it('keeps the list untouched without a query', () => {
  expect(rankMatches(items, '')).toEqual(items);
});

it('caps the list so a huge value set stays renderable', () => {
  const many = Array.from({ length: 1000 }, (_, i) => ({ label: `Tou ${i}`, value: i }));
  expect(rankMatches(many, 'Tou', 200)).toHaveLength(200);
  expect(rankMatches(many, '', 200)).toHaveLength(200);
});
