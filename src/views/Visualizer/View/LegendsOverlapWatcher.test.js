import { render } from '@testing-library/react';
import React from 'react';

import LegendsOverlapWatcher, { rectsOverlap } from './LegendsOverlapWatcher';

const rect = (left, top, right, bottom) => ({
  left, top, right, bottom, width: right - left, height: bottom - top,
});

const place = (element, box) => {
  // eslint-disable-next-line no-param-reassign
  element.getBoundingClientRect = () => box;
};

let observed;

beforeEach(() => {
  observed = [];
  global.ResizeObserver = class {
    observe (element) { observed.push(element); }

    disconnect () {}
  };
  document.body.innerHTML = '<div class="interactive-map__legends"></div><div class="map-overlay-panel"></div>';
});

const setup = ({ legends, panel }) => {
  place(document.querySelector('.interactive-map__legends'), legends);
  place(document.querySelector('.map-overlay-panel'), panel);
};

it('should tell apart overlapping and disjoint rectangles', () => {
  expect(rectsOverlap(rect(0, 0, 10, 10), rect(5, 5, 15, 15))).toBe(true);
  expect(rectsOverlap(rect(0, 0, 10, 10), rect(10, 0, 20, 10))).toBe(false);
  expect(rectsOverlap(rect(0, 0, 10, 10), rect(0, 0, 0, 0))).toBe(false);
});

it('should report an overlap between the legends and the details panel', () => {
  const onChange = vi.fn();
  setup({ legends: rect(900, 300, 1100, 800), panel: rect(1000, 100, 1300, 500) });

  render(<LegendsOverlapWatcher panelsOpen onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(true);
  expect(observed).toHaveLength(2);
});

it('should report no overlap when the panel sits clear of the legends', () => {
  const onChange = vi.fn();
  setup({ legends: rect(400, 300, 600, 800), panel: rect(1000, 100, 1300, 500) });

  render(<LegendsOverlapWatcher panelsOpen onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(false);
});

it('should ignore the panels while none is open', () => {
  const onChange = vi.fn();
  setup({ legends: rect(900, 300, 1100, 800), panel: rect(1000, 100, 1300, 500) });

  render(<LegendsOverlapWatcher panelsOpen={false} onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(false);
  expect(observed).toEqual([document.querySelector('.interactive-map__legends')]);
});

it('should recheck when the panel finishes its transition', () => {
  const onChange = vi.fn();
  setup({ legends: rect(900, 300, 1100, 800), panel: rect(1400, 100, 1700, 500) });

  render(<LegendsOverlapWatcher panelsOpen onChange={onChange} />);
  expect(onChange).toHaveBeenLastCalledWith(false);

  const panel = document.querySelector('.map-overlay-panel');
  place(panel, rect(1000, 100, 1300, 500));
  panel.dispatchEvent(new Event('transitionend'));

  expect(onChange).toHaveBeenLastCalledWith(true);
});

it('should also watch the other map panels', () => {
  const onChange = vi.fn();
  document.body.innerHTML = '<div class="interactive-map__legends"></div>'
    + '<div class="map-overlay-panel" id="share"></div>'
    + '<div class="map-overlay-panel" id="declaration"></div>';
  place(document.querySelector('.interactive-map__legends'), rect(900, 300, 1100, 800));
  place(document.querySelector('#share'), rect(1400, 100, 1700, 500));
  place(document.querySelector('#declaration'), rect(1000, 100, 1300, 500));

  render(<LegendsOverlapWatcher panelsOpen onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(true);
  expect(observed).toHaveLength(3);
});

it('should hide legends taller than half the screen on a small device', () => {
  const onChange = vi.fn();
  window.innerWidth = 400;
  window.innerHeight = 800;
  setup({ legends: rect(0, 100, 200, 600), panel: rect(1400, 100, 1700, 500) });

  render(<LegendsOverlapWatcher onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(true);
});

it('should keep short legends on a small device', () => {
  const onChange = vi.fn();
  window.innerWidth = 400;
  window.innerHeight = 800;
  setup({ legends: rect(0, 100, 200, 400), panel: rect(1400, 100, 1700, 500) });

  render(<LegendsOverlapWatcher onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(false);
});

it('should not mind tall legends on a large screen', () => {
  const onChange = vi.fn();
  window.innerWidth = 1200;
  window.innerHeight = 800;
  setup({ legends: rect(0, 100, 200, 600), panel: rect(1400, 100, 1700, 500) });

  render(<LegendsOverlapWatcher onChange={onChange} />);

  expect(onChange).toHaveBeenLastCalledWith(false);
});
