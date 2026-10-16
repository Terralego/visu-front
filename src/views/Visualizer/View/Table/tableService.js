import searchService, {
  getExtent,
  getSearchParamFromProperty,
} from '@terralego/core/modules/Visualizer/services/search';

export { getExtent };

const buildIncludeFields = fields => {
  if (!fields) return [];
  return fields.reduce((all, { value }) => {
    const interpolation = value.match(/\{[^}]+\}/g);
    return [
      ...all,
      ...(interpolation
        ? interpolation.map(match => match.match(/\{([^}]+)\}/)[1])
        : [value]),
    ];
  }, []);
};

const buildProperties = (filters, form) => Object.keys(filters).reduce(
  (all, key) => ({
    ...all,
    ...getSearchParamFromProperty(filters, form, key),
  }),
  {},
);

export const fetchTableData = async ({
  layer,
  fields,
  form,
  filters,
  baseEsQuery,
  query,
  boundingBox,
}) => {
  const properties = buildProperties(filters, form);
  const includeFields = buildIncludeFields(fields);
  const hasFilters = query || Object.keys(properties).length > 0 || boundingBox;

  const queries = [
    {
      index: layer,
      query,
      properties,
      boundingBox,
      baseQuery: baseEsQuery,
      include: includeFields,
    },
  ];

  if (hasFilters) {
    // Second query: no filters at all to get the global total
    queries.push({
      index: layer,
      baseQuery: baseEsQuery,
      include: [],
      size: 0,
    });
  }

  const { responses } = await searchService.msearch(queries);

  const { hits: { hits, total: { value: total } } } = responses[0];
  const unfilteredTotal = hasFilters
    ? responses[1]?.hits?.total?.value ?? total
    : total;

  return { hits, total, unfilteredTotal };
};

export const fetchGeometriesByIds = async ({ layer, ids, baseEsQuery }) => {
  const resp = await searchService.search({
    index: layer,
    properties: {
      _id: { type: 'terms', value: ids },
    },
    include: ['geom'],
    baseQuery: baseEsQuery,
    size: ids.length,
  });

  return resp?.hits?.hits
    ?.map(hit => hit._source?.geom)
    .filter(Boolean) || [];
};
