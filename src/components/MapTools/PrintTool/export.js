import JsPdf from 'jspdf';
import html2canvas from 'html2canvas';

export default async function exportPdf(map, orientation, format = 'a4') {
  // html2canvas fails to render elements on top of page so we need to scroll
  window.scrollTo(0, 0);

  // Increase DPI temporarily
  const dpi = 300;
  const actualPixelRatio = window.devicePixelRatio;
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => dpi / 96,
  });

  const mapContainer = map.getContainer();
  let container = mapContainer.parentElement;

  while (container && !container.classList.contains('visualizer__print')) {
    container = container.parentElement;
  }
  if (!container) {
    container = mapContainer.parentElement;
  }

  const canvas = map.getCanvas();
  const canvasRoot = canvas.parentNode;

  const doc = new JsPdf({ format, orientation, units: 'mm' });

  // Rendering canvas to an image is needed for Chrome/Edge
  // eslint-disable-next-line no-async-promise-executor
  const fixedMap = await new Promise(async resolve => {
    map.once('render', () => resolve(map.getCanvas().toDataURL()));
    // trigger render by resizing so that new devicePixelRatio is handled
    map.resize();
  });
  const img = new Image();
  img.src = fixedMap;
  ['position', 'width', 'height'].forEach(style => {
    img.style[style] = canvas.style[style];
  });

  canvasRoot.appendChild(img);
  canvasRoot.removeChild(canvas);

  const renderedContainer = await html2canvas(container, {
    scale: dpi / 96,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    // Remove control elements except attribution and scale
    ignoreElements: element => {
      const classes = element.className;
      if (typeof classes !== 'string') return false;

      // Keep attribution and scale controls
      if (classes.includes('mapboxgl-ctrl-attrib') || classes.includes('mapboxgl-ctrl-scale')) {
        return false;
      }

      // Ignore other controls (but not the container itself, just individual controls)
      if (classes.includes('mapboxgl-ctrl-group') || classes.includes('mapboxgl-ctrl-print')) {
        return true;
      }

      return false;
    },
  });

  // Get PDF page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Put the image full page
  doc.addImage(renderedContainer, 'PNG', 0, 0, pageWidth, pageHeight);
  doc.save(`export (${new Date(Date.now()).toLocaleDateString()}).pdf`);

  // Set back previous DPI, map will be resized back by control
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => actualPixelRatio,
  });

  canvasRoot.removeChild(img);
  canvasRoot.appendChild(canvas);
}
