import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

import exportPdf from './export';

vi.mock('jspdf', () => {
  const instance = {
    addImage: vi.fn(),
    save: vi.fn(),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  };
  function JsPdfStub () {
    return instance;
  }
  const jspdfMock = vi.fn(JsPdfStub);
  jspdfMock.instance = instance;
  return { default: jspdfMock };
});

vi.mock('html2canvas', () => {
  const canvas = {};
  const html2canvasMock = vi.fn(() => canvas);
  html2canvasMock.canvas = canvas;
  return { default: html2canvasMock };
});

const printContainer = { classList: { contains: () => true }, parentElement: null };

const mapStub = () => {
  const canvas = { style: {}, parentNode: { appendChild () {}, removeChild () {} }, toDataURL: () => 'dataurl' };
  const listeners = [];
  return {
    listeners,
    getContainer: vi.fn(() => ({ parentElement: printContainer })),
    getCanvas: vi.fn(() => canvas),
    resize: vi.fn(),
    once: (event, listener) => listeners.push(listener),
  };
};

const runExport = async (map, orientation = 'portrait') => {
  const pending = exportPdf(map, orientation);
  map.listeners[0]();
  await pending;
};

beforeEach(() => {
  vi.clearAllMocks();
  window.scrollTo = vi.fn();
  vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('mocked date');
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('should render the print container at the requested format', async () => {
  const map = mapStub();

  await runExport(map, 'landscape');

  expect(jspdf).toHaveBeenCalledWith({ format: 'a4', orientation: 'landscape', units: 'mm' });
  expect(html2canvas).toHaveBeenCalledWith(printContainer, expect.objectContaining({
    ignoreElements: expect.any(Function),
  }));
  expect(jspdf.instance.addImage).toHaveBeenCalledWith(html2canvas.canvas, 'PNG', 0, 0, 210, 297);
});

it('should name the file after the current date', async () => {
  await runExport(mapStub());

  expect(jspdf.instance.save).toHaveBeenCalledWith('export (mocked date).pdf');
});

it('should restore the device pixel ratio once done', async () => {
  const before = window.devicePixelRatio;

  await runExport(mapStub());

  expect(window.devicePixelRatio).toBe(before);
});

describe('the captured elements', () => {
  const ignoreElements = async () => {
    await runExport(mapStub());
    return html2canvas.mock.calls[0][1].ignoreElements;
  };

  it('should keep the attribution and the scale', async () => {
    const ignore = await ignoreElements();

    expect(ignore({ className: 'mapboxgl-ctrl-attrib' })).toBe(false);
    expect(ignore({ className: 'mapboxgl-ctrl-scale' })).toBe(false);
  });

  it('should drop the control groups and the print button', async () => {
    const ignore = await ignoreElements();

    expect(ignore({ className: 'mapboxgl-ctrl-group' })).toBe(true);
    expect(ignore({ className: 'mapboxgl-ctrl-print' })).toBe(true);
  });

  it('should keep elements without a string class name', async () => {
    const ignore = await ignoreElements();

    expect(ignore({ className: undefined })).toBe(false);
    expect(ignore({ className: 'anything-else' })).toBe(false);
  });
});
