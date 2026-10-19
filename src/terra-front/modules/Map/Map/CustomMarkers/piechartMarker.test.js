import piechart from './piechartMarker';

const fields = [
  { name: 'a', color: '#63a2c6' },
  { name: 'b', color: '#68e2ba' },
];

const render = (props, showTotal = false) => piechart.createMarker(
  props,
  { fields, advancedStyle: { show_total: showTotal } },
  { 'circle-radius': 50 },
);

it('should draw one segment per field', () => {
  const marker = render({ a: 1, b: 3 });

  expect(marker.querySelectorAll('path')).toHaveLength(2);
  expect(marker.innerHTML).not.toContain('NaN');
});

it('should ignore invalid values', () => {
  const marker = render({ a: 'n/a', b: 2 }, true);

  expect(marker.innerHTML).not.toContain('NaN');
  expect(marker.querySelector('text').textContent.trim()).toBe('2');
});

it('should read numeric strings as numbers', () => {
  const marker = render({ a: '1', b: '3' }, true);

  expect(marker.querySelector('text').textContent.trim()).toBe('4');
});

it('should draw no segment when every value is invalid', () => {
  const marker = render({ a: undefined, b: null }, true);

  expect(marker.querySelectorAll('path')).toHaveLength(0);
  expect(marker.querySelector('text').textContent.trim()).toBe('0');
});
