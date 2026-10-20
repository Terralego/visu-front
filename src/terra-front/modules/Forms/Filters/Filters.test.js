import Checkboxes from '../Controls/Checkboxes';
import MultiSelect from '../Controls/MultiSelect';
import { getComponent, TYPE_MANY } from './Filters';

const values = count => Array.from({ length: count }, (_, i) => `value ${i}`);

it('should list a few values as checkboxes', () => {
  expect(getComponent(TYPE_MANY, values(5))).toBe(Checkboxes);
});

it('should use a multiselect for many values or when asked to', () => {
  expect(getComponent(TYPE_MANY, values(11))).toBe(MultiSelect);
  expect(getComponent(TYPE_MANY, values(5), 'select')).toBe(MultiSelect);
});

it('should keep the multiselect when a search narrows the values', () => {
  expect(getComponent(TYPE_MANY, values(3), undefined, undefined, true)).toBe(MultiSelect);
});
