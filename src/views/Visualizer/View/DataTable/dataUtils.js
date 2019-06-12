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

export const getData = (dataSource, key) => {
  const value = dataSource[key];
  if (Array.isArray(value)) return value.join(',');
  if (value && typeof value === 'object') return JSON.stringify(value, '  ');
  return [null, undefined].includes(value) ? '' : value;
};

export const prepareData = (fields = [], results) => {
  const properties = fields.map(({ value }) => value);
  return results
    .map(({ _id, _source: dataSource }) => properties.map(key => {
      const interpolation = key.match(/\{([^}]+)\}/g);
      if (interpolation) {
        return key.replace(/\{([^}]+)\}/g, (match, p1) => getData(dataSource, p1));
      }
      return getData({ _id, ...dataSource }, key);
    }));
};

export const exportData = async ({ name, data }) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, name);
  xlsx.writeFile(workbook, `${name}.xlsx`);
};

export default { extractColumns, prepareData };
