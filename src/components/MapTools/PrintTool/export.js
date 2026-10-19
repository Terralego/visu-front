import JsPdf from 'jspdf';
import html2canvas from 'html2canvas';

const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const replaceBackgroundImage = async element => {
  const [, src] = getComputedStyle(element).backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [];
  const { clientWidth: width, clientHeight: height } = element;
  if (!src || !width || !height) return () => {};

  const image = await loadImage(src).catch(() => null);
  if (!image) return () => {};

  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const imageWidth = image.naturalWidth * ratio;
  const imageHeight = image.naturalHeight * ratio;
  Object.assign(image.style, {
    position: 'absolute',
    left: `${(width - imageWidth) / 2}px`,
    top: `${(height - imageHeight) / 2}px`,
    width: `${imageWidth}px`,
    height: `${imageHeight}px`,
  });

  const { position, backgroundImage } = element.style;
  element.style.position = 'relative';
  element.style.backgroundImage = 'none';
  element.appendChild(image);

  return () => {
    element.removeChild(image);
    element.style.position = position;
    element.style.backgroundImage = backgroundImage;
  };
};

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

  const restoreBackgroundImages = await Promise.all(
    Array.from(container.querySelectorAll('.print-header__image')).map(replaceBackgroundImage),
  );

  const renderedContainer = await html2canvas(container, {
    scale: dpi / 96,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    // Remove control elements except attribution and scale
    ignoreElements: element => {
      const classes = element.className;
      if (typeof classes !== 'string') return false;

      // Keep attribution and scale controls
      if (classes.includes('mapboxgl-ctrl-attrib') || classes.includes('mapboxgl-ctrl-scale')) {
        return false;
      }

      // Ignore other controls (but not the container itself, just individual controls)
      if (classes.includes('mapboxgl-ctrl-group')
        || classes.includes('mapboxgl-ctrl-print')
        || classes.includes('map-navigation-tools')
        || classes.includes('map-tools')) {
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

  restoreBackgroundImages.forEach(restore => restore());
  canvasRoot.removeChild(img);
  canvasRoot.appendChild(canvas);
}
