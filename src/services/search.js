import elasticsearch from 'elasticsearch';
import bodybuilder from 'bodybuilder';
import debounce from 'debounce';

export const DEFAULT_INDEX = 'features';
export const MAX_SIZE = 10000;
export const SEARCHES_QUEUE = new Set();

export const getExtent = map => {
  const [[lngMin, latMin], [lngMax, latMax]] = map.getBounds().toArray();
  return [[lngMin, latMax], [lngMax, latMin]];
};

/**
 * Construct an object representing the current properties to search on.
 *
 * @param properties {{}} Filter properties
 * @param form {{}} Schema form containing filters
 * @param key {string} Property key
 * @return {{}} An object usable by searchService (Search.search() or Search.msearch())
 */
export const getSearchParamFromProperty = (properties, form, key) => {
  const { type, values } = form.find(({ property }) => property === key);
  if (properties[key]) {
    // First case, we have a range, the search should be within its bounds
    if (type === 'range') {
      return {
        [key]: {
          type: 'range',
          value: { min: properties[key][0], max: properties[key][1] },
        },
      };
    }
    // Else we have a single or many, the form depends on if we provided values
    if (values) {
      // Then its a keyword, because we already know the values
      return {
        [`${key}.keyword`]: {
          type: 'term',
          value: properties[key],
        },
      };
    }
    // Or else its a "full text" search
    return { [key]: properties[key] };
  }
  return {};
};

export const buildQuery = ({
  query = '',
  boundingBox,
  size = MAX_SIZE,
  properties/* = { propName: value }, { propName: { value, type: 'term'} } */,
  include,
  exclude,
  aggregations/* = [{ type, field, name, options }] */,
}) => {
  const body = bodybuilder();
  body.size(size);
  if (query) {
    body.query('query_string', 'query', query.split(/\s+/).map(subquery => `*${subquery}*`).join(' AND '));
  }

  if (properties) {
    Object.keys(properties).forEach(property => {
      const rawValue = properties[property];
      const { value, type = 'match' } = (typeof rawValue === 'object' && !Array.isArray(rawValue))
        ? rawValue
        : { value: rawValue };
      if (value) {
        if (typeof value.min === 'number' && typeof value.max === 'number') {
          const { min, max } = value;
          body.filter('range', property, { gte: +min, lte: +max });
        } else {
          const values = Array.isArray(value) ? value : [value];
          values.forEach(val => {
            if (type === 'match' && typeof val === 'string') {
              body.filter('bool', q => q
                .orFilter(type, property, val)
                .orFilter('wildcard', property, `*${val}*`));
            } else {
              body.filter(type, property, val);
            }
          });
        }
      }
    });
  }

  if (boundingBox) {
    body.filter('geo_shape', 'geom', {
      shape: {
        type: 'envelope',
        coordinates: boundingBox,
      },
    });
  }

  if (aggregations) {
    aggregations.forEach(({ type = 'terms', field, options, name }) =>
      body.aggregation(type, field, options, name));
  }

  const bodyBuild = body.build();

  if (include || exclude) {
    const sourceAttr = '_source';
    bodyBuild[sourceAttr] = {};
    if ((include && !include.length)) {
      bodyBuild[sourceAttr] = false;
    } else {
      if (include) {
        bodyBuild[sourceAttr].include = include;
      }
      if (exclude) {
        bodyBuild[sourceAttr].exclude = exclude;
      }
    }
  }

  return bodyBuild;
};

export class Search {
  constructor (host) {
    this.host = host;
  }

  set host (host) {
    this.client = new elasticsearch.Client({ host });
  }

  async search (query = {/*
    query = '',
    boundingBox,
    properties,
    include,
    size = MAX_SIZE,
    index = DEFAULT_INDEX,
  */}) {
    const body = buildQuery(query);
    const action = {
      body,
    };
    const promise = new Promise(resolve => {
      action.resolve = resolve;
    });

    SEARCHES_QUEUE.add(action);
    this.batchSearch();
    return promise;
  }

  async msearch (queries = [/* {
      query: String,q
      include: String,
      properties: {
        property: String,
        //…
      }
    } */]) {
    if (!queries.length) throw new Error('`queries` must not be empty');

    const searches = queries
      .map(({ size = MAX_SIZE / queries.length, ...query }) => buildQuery({ size, ...query }))
      .reduce((body, { index, ...query }) => (index
        ? [...body, { index }, query]
        : [...body, { }, query]),
      []);
    return this.client.msearch({ body: searches });
  }

  batchSearch = debounce(async () => {
    const [bodies, resolves] = Array
      .from(SEARCHES_QUEUE.values())
      .reduce(([allBodies, allResolves], { body, resolve }) =>
        [[...allBodies, body], [...allResolves, resolve]], [[], []]);
    const batchBody = bodies
      .reduce((body, { index, ...query }) => (index
        ? [...body, { index }, query]
        : [...body, { }, query]),
      []);
    SEARCHES_QUEUE.clear();
    const { responses } = await this.client.msearch({ body: batchBody });
    resolves.forEach((resolve, index) => resolve(responses[index]));
  }, 500)
}

export default new Search();
