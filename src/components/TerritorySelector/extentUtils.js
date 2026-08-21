import PropTypes from 'prop-types';

const isCoordinate = coordinates =>
  Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite);

export const EXTENT_TYPE_MULTIPLE = 'multiple';

const isValidExtent = ({ id, label, bounds } = {}) =>
  id !== undefined &&
  id !== null &&
  !!label &&
  Array.isArray(bounds) &&
  bounds.length === 2 &&
  bounds.every(isCoordinate);

export const getUsableExtents = extents =>
  (Array.isArray(extents) ? extents : []).filter(isValidExtent);

const wrapLongitude = lng => ((((lng + 180) % 360) + 360) % 360) - 180;

const width = (west, east) => (((east - west) % 360) + 360) % 360;

const contains = ([[west, south], [east, north]], { lng, lat }) =>
  lat >= south && lat <= north && width(west, lng) <= width(west, east);

export const findExtentAtCenter = (extents, { lng, lat } = {}) => {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;

  const center = { lng: wrapLongitude(lng), lat };

  return extents
    .filter(({ bounds }) => contains(bounds, center))
    .sort(
      (a, b) =>
        width(a.bounds[0][0], a.bounds[1][0]) * (a.bounds[1][1] - a.bounds[0][1]) -
        width(b.bounds[0][0], b.bounds[1][0]) * (b.bounds[1][1] - b.bounds[0][1]),
    )[0];
};

const MIN_FIT_BOUNDS_PADDING = 24;

const getFitBoundsPadding = (map, visibleBoundingBox) => {
  const { top, left, width: boxWidth, height: boxHeight } = visibleBoundingBox || {};
  const container = map.getContainer && map.getContainer();

  if (!container || !boxWidth || !boxHeight) return MIN_FIT_BOUNDS_PADDING;

  const mapRect = container.getBoundingClientRect();
  const padding = {
    top: Math.max(0, top - mapRect.top) + MIN_FIT_BOUNDS_PADDING,
    left: Math.max(0, left - mapRect.left) + MIN_FIT_BOUNDS_PADDING,
    right: Math.max(0, mapRect.right - (left + boxWidth)) + MIN_FIT_BOUNDS_PADDING,
    bottom: Math.max(0, mapRect.bottom - (top + boxHeight)) + MIN_FIT_BOUNDS_PADDING,
  };

  const fits =
    padding.left + padding.right < mapRect.width - 2 * MIN_FIT_BOUNDS_PADDING &&
    padding.top + padding.bottom < mapRect.height - 2 * MIN_FIT_BOUNDS_PADDING;

  return fits ? padding : MIN_FIT_BOUNDS_PADDING;
};

export const isMultipleExtentMode = (extentType, extents = []) =>
  extentType === EXTENT_TYPE_MULTIPLE && extents.length > 0;

export const ExtentProps = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  category: PropTypes.string,
  icon: PropTypes.string,
  adaptToTheme: PropTypes.bool,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
});

export const BoundingBoxProps = PropTypes.shape({
  top: PropTypes.number,
  left: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
});

export const flyToExtent = (map, extent, visibleBoundingBox) =>
  map.fitBounds(extent.bounds, {
    padding: getFitBoundsPadding(map, visibleBoundingBox),
    duration: 800,
  });
