import { preventEnterKeyPress } from './event';

it('should prevent event Enter', () => {
  const preventDefault = vi.fn();

  preventEnterKeyPress({ key: 'Enter', preventDefault });
  expect(preventDefault).toHaveBeenCalled();

  preventDefault.mockClear();

  preventEnterKeyPress({ which: 31, preventDefault });
  expect(preventDefault).not.toHaveBeenCalled();
});
