/**
 * Round value with decimals
 *
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 */
const round = (value, decimals) => (Math.round(value * (10 ** decimals)) / (10 ** decimals));

export const extractColumns = (fields = [], results) => {
  if (fields.length) {
    return fields.map(({ value, label, display = true, sortable = true, ...props }) => ({
      value,
      label,
      display,
      sortable,
      ...props,
    }));
  }

  if (!results[0]) return [];

  const [{ _source: source }] = results;

  return Object.keys(source).map(column => ({
    value: column,
    display: true,
    sortable: true,
  }));
};

/**
 * Format value according to settings
 *
 * @param {string|number} value
 * @param {{}} settings Object of form {decimals: 1}
 * @returns {number|string}
 */
export const formatFromSettings = (value, settings) => {
  const { decimals } = settings;
  const isNumber = typeof value === 'number';
  let formattedData = value;

  if (isNumber) {
    if (decimals) {
      formattedData = round(formattedData, decimals);
    }
  }
  return formattedData;
};

/**
 * Get datum from ElasticSearch values and format it according to settings
 *
 * @param {{}} dataSource Values object fetch from ElasticSearch
 * @param {string} key Datum key to get
 * @param {{}} settings Object of form {decimals: 1}
 * @returns {string|string|*}
 */
export const getData = (dataSource, key, settings) => {
  let value = dataSource[key];
  const { objectIndent = 2 } = settings;
  if (Array.isArray(value)) return value.join(',');
  if (value && typeof value === 'object') return JSON.stringify(value, null, objectIndent);
  value = [null, undefined].includes(value) ? '' : value;
  return settings ? formatFromSettings(value, settings) : value;
};

/**
 * Map data to columns for display while interpolating a value from source if needed.
 *
 * @param {{}[]} fields List of columns objects {value: property key}
 * @param {{}[]} results List of objects containing id and source
 * @param {{}} settings Object of form {decimals: 1}
 * @returns {{}[][]} Each result mapped to each column
 */
export const prepareData = (fields = [], results, settings) => {
  const properties = fields.map(({ value }) => value);

  return results
    .map(({ _id, _source: dataSource }) => properties.map(key => {
      const interpolation = key.match(/{([^}]+)}/g);
      if (interpolation) {
        return key.replace(/{([^}]+)}/g, (match, p1) => getData(dataSource, p1, settings));
      }
      return getData({ _id, ...dataSource }, key, settings);
    }));
};

/**
 * Export data in xls from state
 *
 * @param {string} name
 * @param {[]} data
 * @returns {Promise<void>}
 */
export const exportData = async ({ name, data }) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, name);
  xlsx.writeFile(workbook, `${name}.xlsx`);
};

export default { extractColumns, prepareData };
