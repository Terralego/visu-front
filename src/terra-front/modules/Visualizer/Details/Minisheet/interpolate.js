const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

export const interpolate = (text, properties = {}) =>
  (text ?? '').replace(PLACEHOLDER, (_, name) => {
    const value = properties[name];
    return value === null || value === undefined ? '' : String(value);
  });

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#|\?)/i;

export const interpolateHref = (href, properties) => {
  const link = interpolate(href, properties).trim();
  return SAFE_HREF.test(link) ? link : null;
};

export default interpolate;
