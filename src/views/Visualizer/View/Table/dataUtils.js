export const extractColumns = (fields, hits) => {
  if (fields && fields.length > 0) {
    return fields;
  }
  if (!hits.length) {
    return [];
  }
  return Object.keys(hits[0]._source).map(value => ({ value }));
};

export const prepareData = (columns, hits) =>
  hits.map(({ _source: source }) =>
    columns.map(({ value }) => {
      const interpolation = value.match(/\{([^}]+)\}/);
      if (interpolation) {
        const [, key] = interpolation;
        return source[key];
      }
      return source[value];
    }));

/**
 * Export data in xlsx or csv format
 *
 * @param {string} name Filename
 * @param {[]} data
 * @param {function} callback Function to be called just before saving sheet (only for xlsx)
 * @param {string} format Export format: 'xlsx' or 'csv'
 * @returns {Promise<void>}
 */
export const exportSpreadsheet = async ({ name, data, callback, format = 'csv' }) => {
  if (!['xlsx', 'csv'].includes(format)) {
    throw new Error(`Unsupported format ${format}`);
  }

  const xlsx = await import('xlsx');
  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.aoa_to_sheet(data);

  if (callback) {
    callback(xlsx, sheet, workbook);
  }

  // xslx has a hard limit to 31 non-special chars
  // see https://support.office.com/en-us/article/Rename-a-worksheet-3F1F7148-EE83-404D-8EF0-9FF99FBAD1F9
  const cleanedName = name.replace(/[\][*?/\\:]/gi, '').substring(0, 30);
  xlsx.utils.book_append_sheet(workbook, sheet, cleanedName);
  xlsx.writeFile(workbook, `${name}.${format}`);
};
