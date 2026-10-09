import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import NavigationTools from './NavigationTools';

const translate = key => key;

const createMap = (state = {}) => {
  const view = { zoom: 5, maxZoom: 20, minZoom: 0, bearing: 0, pitch: 0, ...state };
  const handlers = {};

  return {
    view,
    addControl: vi.fn(control => document.body.appendChild(control.onAdd())),
    removeControl: vi.fn(),
    on: vi.fn((event, handler) => { handlers[event] = handler; }),
    off: vi.fn(),
    getZoom: () => view.zoom,
    getMaxZoom: () => view.maxZoom,
    getMinZoom: () => view.minZoom,
    getBearing: () => view.bearing,
    getPitch: () => view.pitch,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    easeTo: vi.fn(),
  };
};

const renderTools = map => render(<NavigationTools map={map} translate={translate} />);

afterEach(() => {
  document.querySelectorAll('.map-navigation-tools').forEach(node => node.remove());
});

it('should zoom the map in and out', () => {
  const map = createMap();
  renderTools(map);

  fireEvent.click(screen.getByRole('button', { name: 'terralego.map.zoom_in_control.title' }));
  fireEvent.click(screen.getByRole('button', { name: 'terralego.map.zoom_out_control.title' }));

  expect(map.zoomIn).toHaveBeenCalled();
  expect(map.zoomOut).toHaveBeenCalled();
});

it('should disable zooming past the map limits', () => {
  renderTools(createMap({ zoom: 20, maxZoom: 20 }));

  expect(screen.getByRole('button', { name: 'terralego.map.zoom_in_control.title' }).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'terralego.map.zoom_out_control.title' }).disabled).toBe(false);
});

it('should hide the compass while the map faces north', () => {
  renderTools(createMap());

  expect(screen.queryByRole('button', { name: 'terralego.map.compass_arrow_control.title' })).toBe(null);
});

it('should show a compass turned to the map bearing once rotated', () => {
  renderTools(createMap({ bearing: 40 }));

  const compass = screen.getByRole('button', { name: 'terralego.map.compass_arrow_control.title' });
  expect(compass.querySelector('svg').style.transform).toBe('rotate(-40deg)');
});

it('should show the compass when the map is only pitched', () => {
  renderTools(createMap({ pitch: 30 }));

  expect(screen.getByRole('button', { name: 'terralego.map.compass_arrow_control.title' })).toBeTruthy();
});

it('should bring the map back to north and flat', () => {
  const map = createMap({ bearing: 40, pitch: 30 });
  renderTools(map);

  fireEvent.click(screen.getByRole('button', { name: 'terralego.map.compass_arrow_control.title' }));

  expect(map.easeTo).toHaveBeenCalledWith({ bearing: 0, pitch: 0 });
});

it('should not offer the legend toggle without legends', () => {
  renderTools(createMap());

  expect(screen.queryByRole('button', { name: 'terralego.map.legend_control.hide' })).toBe(null);
});

it('should ask to hide the legends while they show', () => {
  const onToggleLegends = vi.fn();
  render(<NavigationTools
    map={createMap()}
    translate={translate}
    hasLegends
    areLegendsVisible
    onToggleLegends={onToggleLegends}
  />);

  fireEvent.click(screen.getByRole('button', { name: 'terralego.map.legend_control.hide' }));

  expect(onToggleLegends).toHaveBeenCalled();
});

it('should ask to show the legends once hidden', () => {
  render(<NavigationTools
    map={createMap()}
    translate={translate}
    hasLegends
    areLegendsVisible={false}
    onToggleLegends={vi.fn()}
  />);

  expect(screen.getByRole('button', { name: 'terralego.map.legend_control.show' })).toBeTruthy();
});
