const VARIABLE = /\{\{\s*([^{}]+?)\s*\}\}/g;

export const buildIframeUrl = (template, fields = [], data = {}) => {
  if (!template) return '';
  const allowed = new Set((fields || []).map(field => field.field_name));
  return template.replace(VARIABLE, (match, name) => {
    if (!allowed.has(name)) return '';
    const value = data?.[name];
    if (value === null || value === undefined) return '';
    return encodeURIComponent(String(value));
  });
};
