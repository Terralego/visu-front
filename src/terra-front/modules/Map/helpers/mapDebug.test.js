import mapBoxGl from 'mapbox-gl';
import MapboxInspect from 'mapbox-gl-inspect';
import renderInspectPopup from 'mapbox-gl-inspect/lib/renderPopup';

import { addMapDebug } from './mapDebug';

const mocks = vi.hoisted(() => ({
  popup: { on: vi.fn() },
  control: {},
}));

function popupStub () {
  return mocks.popup;
}

function inspectStub () {
  return mocks.control;
}

vi.mock('mapbox-gl', () => ({ default: { Popup: vi.fn(popupStub) } }));

vi.mock('mapbox-gl-inspect', () => ({ default: vi.fn(inspectStub) }));

vi.mock('mapbox-gl-inspect/lib/renderPopup', () => ({ default: vi.fn() }));

const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

const mapStub = () => ({ addControl: vi.fn() });

const debugMode = mode => global.localStorage.setItem('mapDebug', mode);

const inspectOptions = () => MapboxInspect.mock.calls[0][0];

beforeEach(() => {
  global.localStorage.clear();
  vi.clearAllMocks();
});

it('should leave the map untouched when debug is off', () => {
  const map = mapStub();

  expect(addMapDebug(map)).toBe(map);
  expect(map.addControl).not.toHaveBeenCalled();
  expect(mapBoxGl.Popup).not.toHaveBeenCalled();
});

describe.each(['*', 'console', 'popup'])('with mapDebug=%s', mode => {
  it('should add the inspect control to the map', () => {
    const map = mapStub();
    debugMode(mode);

    addMapDebug(map);

    expect(map.addControl).toHaveBeenCalledWith(mocks.control);
  });
});

it('should give the inspect control a non-interactive popup', () => {
  debugMode('*');

  addMapDebug(mapStub());

  expect(mapBoxGl.Popup).toHaveBeenCalledWith({ closeButton: false, closeOnClick: false });
  expect(inspectOptions().popup).toBe(mocks.popup);
});

describe.each(['*', 'popup'])('with mapDebug=%s', mode => {
  it('should keep the popup visible', () => {
    debugMode(mode);

    addMapDebug(mapStub());

    expect(mocks.popup.on).not.toHaveBeenCalled();
  });
});

it('should destroy the popup on open when only logging to the console', () => {
  debugMode('console');

  addMapDebug(mapStub());

  const [event, onOpen] = mocks.popup.on.mock.calls[0];
  const target = { remove: vi.fn() };
  onOpen({ target });

  expect(event).toBe('open');
  expect(target.remove).toHaveBeenCalled();
});

it('should disable every inspect interaction', () => {
  debugMode('*');

  addMapDebug(mapStub());

  expect(inspectOptions()).toMatchObject({
    showMapPopup: true,
    showMapPopupOnHover: false,
    showInspectButton: false,
    showInspectMap: false,
    showInspectMapPopupOnHover: false,
  });
});

it('should log the features and delegate the rendering when console debug is on', () => {
  debugMode('*');
  addMapDebug(mapStub());
  const features = [];

  inspectOptions().renderPopup(features);

  expect(logSpy).toHaveBeenCalledWith(features);
  expect(renderInspectPopup).toHaveBeenCalledWith(features);
});

it('should not log the features when only showing the popup', () => {
  debugMode('popup');
  addMapDebug(mapStub());

  inspectOptions().renderPopup([]);

  expect(logSpy).not.toHaveBeenCalled();
  expect(renderInspectPopup).toHaveBeenCalled();
});
