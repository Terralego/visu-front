const toNumber = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
};

export const isFixedSeries = series => 'value' in series;

const seriesValue = (series, properties) =>
  toNumber(isFixedSeries(series) ? series.value : properties[series.field]);

export const getChartData = (series = [], properties = {}) => series
  .filter(item => seriesValue(item, properties) !== null)
  .map(item => Object.assign(
    { label: item.label || item.field || '', value: seriesValue(item, properties) },
    item.color && { color: item.color },
  ));

export default getChartData;
