import Api from '@terralego/core/modules/Api';
import searchInMap, { fetchNominatim } from './searchService';

global.fetch = jest.fn(() => Promise.resolve({
  json: () =>
    Promise.resolve({
      features: [
        {
          bbox: [0, 1, 2, 3],
          properties: { osm_id: 1, display_name: 'label' },
        },
      ],
    }),
}));

beforeEach(() => {
  fetch.mockClear();
  Api.request = jest.fn(() =>
    Promise.resolve({
      count: 1,
      results: [{ identifier: 1, properties: { mainfield: 'Paris' } }],
    }));
});

describe('fetchNominatim', () => {
  it('Should format nominatim results correctly', async () => {
    const result = await fetchNominatim({
      query: 'fake query',
      language: 'en',
      baseUrl: 'https://going.nowhere',
      translate: () => 'text',
    });
    expect(result).toEqual([
      {
        total: 1,
        group: 'text',
        results: [{ bounds: [0, 1, 2, 3], id: 1, label: 'label' }],
      },
    ]);
  });

  it('Should return an empty array when fetch error occured', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API is down')));
    const result = await fetchNominatim({
      query: 'fake query',
      translate: () => 'text',
      language: 'en',
      baseUrl: 'https://going.nowhere',
    });
    expect(result).toEqual([]);
  });

  it('Should be called with viewbow param when viewbox is passed', async () => {
    const query = 'fake query';
    const language = 'en';
    const baseUrl = 'https://going.nowhere';
    const viewbox = [1, 40, 2, 50];
    await fetchNominatim({
      query,
      language,
      translate: () => 'text',
      baseUrl,
      options: { viewbox },
    });

    const url = new URL(baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'geojson');
    url.searchParams.set('accept-language', language);
    url.searchParams.set('viewbox', viewbox);
    url.searchParams.set('polygon_geojson', 1);
    url.searchParams.set('bounded', 1);
    expect(fetch).toHaveBeenCalledWith(url);
  });

  it('Should work with default language', async () => {
    const result = await fetchNominatim({
      query: 'fake query',
      translate: () => 'text',
      baseUrl: 'https://going.nowhere',
    });
    expect(result).toEqual([
      {
        total: 1,
        group: 'text',
        results: [{ bounds: [0, 1, 2, 3], id: 1, label: 'label' }],
      },
    ]);
  });
});

describe('searchInMap', () => {
  const layers = [
    [
      {
        label: 'label',
        layers: ['layer1', 'layer2'],
        filters: { layer: 'layer-slug', mainField: 'mainfield' },
      },
    ],
  ];

  const searchProvider = {
    baseUrl: 'https://going.nowhere',
    provider: 'nominatim',
    options: { viewbox: [1, 40, 2, 50] },
  };

  it('Should return a function', async () => {
    const searchFunction = searchInMap({ searchProvider: {} });
    expect(typeof searchFunction).toBe('function');
  });

  it('Should return an array of results', async () => {
    const searchFunction = searchInMap({
      searchProvider,
      layers,
      language: 'en',
      translate: () => 'text',
    });

    expect(await searchFunction('fake query')).toEqual([
      {
        group: 'label',
        total: 1,
        results: [
          {
            mainfield: 'Paris',
            label: 'Paris',
            id: 1,
            _feature_id: 1,
            matchedField: undefined,
            matchedValue: undefined,
            source: 'layer-slug',
            layers: ['layer1', 'layer2'],
          },
        ],
      },
    ]);
  });

  it('Should return results merged with location results', async () => {
    const searchFunction = searchInMap({
      searchProvider,
      layers,
      locationsEnable: true,
      language: 'en',
      translate: () => 'text',
    });

    expect(await searchFunction('fake query')).toEqual([
      expect.objectContaining({ group: 'label' }),
      {
        total: 1,
        group: 'text',
        results: [{ bounds: [0, 1, 2, 3], id: 1, label: 'label' }],
      },
    ]);
  });
});
