import memoize from 'memoize-one';

const CUSTOM_ICON_PREFIX = 'custom:';

// Normalize icons in a square so background, border and scale behave the same
// whatever the source icon's dimensions are
const VBOX = 100;

// On-map size, in pixels, of a custom icon at `icon-size: 1`
const MAP_ICON_SIZE = 32;

const DEFAULT_CUSTOMIZATION = {
  iconColor: '#000000',
  showBackground: false,
  backgroundColor: '#ffffff',
  backgroundBorderRadius: 0,
  iconScale: 1,
  showBorder: false,
  backgroundBorderWidth: 1,
  backgroundBorderColor: '#000000',
};

export const isCustomIconId = id => typeof id === 'string' && id.startsWith(CUSTOM_ICON_PREFIX);

// Mirrors the admin's SvgMockIcon component, both must be kept in sync
export const buildIconSvg = icon => {
  const { width, height, pathData = [], viewBox, customization } = icon;
  const c = { ...DEFAULT_CUSTOMIZATION, ...customization };

  const [minX, minY, vbW, vbH] = viewBox ? viewBox.map(Number) : [0, 0, width, height];

  const fit = VBOX / Math.max(vbW, vbH);
  const offsetX = (VBOX - vbW * fit) / 2 - minX * fit;
  const offsetY = (VBOX - vbH * fit) / 2 - minY * fit;
  const half = VBOX / 2;
  const iconTransform =
    `translate(${half} ${half}) scale(${c.iconScale}) translate(${-half} ${-half}) ` +
    `translate(${offsetX} ${offsetY}) scale(${fit})`;

  const showRect = c.showBackground;
  const bw = showRect && c.showBorder ? c.backgroundBorderWidth : 0;
  const radius = (c.backgroundBorderRadius / 100) * half;

  const rectAttrs =
    `x="${bw / 2}" y="${bw / 2}" width="${VBOX - bw}" height="${VBOX - bw}" ` +
    `rx="${radius}" ry="${radius}"`;

  const bg = showRect
    ? `<rect ${rectAttrs} fill="${c.backgroundColor}" ` +
      `stroke="${c.showBorder ? c.backgroundBorderColor : 'none'}" stroke-width="${bw}"/>`
    : '';

  const clipId = 'clip';
  const paths = pathData.map(p => `<path d="${p.d}" fill="${c.iconColor}"/>`).join('');
  const clipped = showRect
    ? `<g clip-path="url(#${clipId})"><g transform="${iconTransform}">${paths}</g></g>`
    : `<g transform="${iconTransform}">${paths}</g>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${VBOX}" height="${VBOX}" viewBox="0 0 ${VBOX} ${VBOX}">` +
    `<defs><clipPath id="${clipId}"><rect ${rectAttrs}/></clipPath></defs>` +
    `${bg}${clipped}</svg>`
  );
};

export const getCustomIcons = memoize((customStyleLayers = []) => customStyleLayers.reduce(
  (icons, { advanced_style: { custom_icons: customIcons } = {} }) => ({
    ...icons,
    ...customIcons,
  }),
  {},
));

export const addCustomIconToMap = (map, id, icon) => {
  if (map.hasImage(id)) return;

  const dpr = window.devicePixelRatio || 1;
  const size = VBOX * dpr;
  // Rasterize at the full VBOX size to keep the icon crisp when a layer scales
  // it up with `icon-size`
  const pixelRatio = dpr * (VBOX / MAP_ICON_SIZE);
  const img = new Image(size, size);

  img.onload = () => {
    if (map.hasImage(id)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);

    try {
      map.addImage(id, ctx.getImageData(0, 0, size, size), { pixelRatio });
    } catch (e) {
      console.error(`Unable to add custom icon ${id}`, e); // eslint-disable-line no-console
    }
  };
  img.onerror = () => {
    console.error(`Unable to render custom icon ${id}`); // eslint-disable-line no-console
  };

  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildIconSvg(icon))}`;
};

export default { buildIconSvg, getCustomIcons, addCustomIconToMap, isCustomIconId };
