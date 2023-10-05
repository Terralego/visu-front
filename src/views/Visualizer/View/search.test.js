import searchService from '@terralego/core/modules/Visualizer/services/search';
import searchInMap, { fetchNominatim } from './search';

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
    expect(fetch).toHaveBeenCalledWith(url, {
      headers: { map: { 'content-type': 'application/json' } },
    });
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
  const mockEsReponse = {
    responses: [
      {
        hits: {
          total: { value: 1 },
          hits: [
            {
              _id: 1,
              _source: {
                geom: {
                  coordinates: [
                    [
                      [-5.551753747838916, 50.1324346099444],
                      [-5.551753747838916, 50.111374837193324],
                      [-5.521121570443739, 50.111374837193324],
                      [-5.521121570443739, 50.1324346099444],
                      [-5.551753747838916, 50.1324346099444],
                    ],
                  ],
                  type: 'Polygon',
                },
              },
            },
          ],
        },
      },
    ],
  };

  it('Should return a function', async () => {
    const searchFunction = searchInMap({ searchProvider: {} });
    expect(typeof searchFunction).toBe('function');
  });

  it('Should return an array of results', async () => {
    searchService.msearch = jest.fn(() => Promise.resolve(mockEsReponse));
    const layers = [
      [
        {
          filters: { layer: 'layer-id', mainField: 'mainfield' },
          baseEsQuery: 'some base query',
          label: 'label',
          layers: ['layer1', 'layer2'],
        },
      ],
    ];
    const searchFunction = searchInMap({
      searchProvider: {
        baseUrl: 'https://going.nowhere',
        provider: 'Nominatim',
        options: { viewbox: [1, 40, 2, 50] },
      },
      layers,
      language: 'en',
      translate: () => 'text',
    });
    const result = await searchFunction('fake query');
    expect(result).toEqual([
      {
        group: 'label',
        results: [
          {
            bounds: [
              -5.551753747838916, 50.111374837193324, -5.521121570443739,
              50.1324346099444,
            ],
            center: [-5.536437659141328, 50.12190472356886],
            geom: {
              coordinates: [
                [
                  [-5.551753747838916, 50.1324346099444],
                  [-5.551753747838916, 50.111374837193324],
                  [-5.521121570443739, 50.111374837193324],
                  [-5.521121570443739, 50.1324346099444],
                  [-5.551753747838916, 50.1324346099444],
                ],
              ],
              type: 'Polygon',
            },
            id: 1,
            label: 1,
            layers: ['layer1', 'layer2'],
          },
        ],
        total: 1,
      },
    ]);
  });

  it('Should return results merged with location results', async () => {
    searchService.msearch = jest.fn(() => Promise.resolve(mockEsReponse));
    const layers = [
      [
        {
          filters: { layer: 'layer-id', mainField: 'mainfield' },
          baseEsQuery: 'some base query',
          label: 'label',
          layers: ['layer1', 'layer2'],
        },
      ],
    ];
    const searchFunction = searchInMap({
      searchProvider: {
        baseUrl: 'https://going.nowhere',
        provider: 'Nominatim',
        options: { viewbox: [1, 40, 2, 50] },
      },
      layers,
      locationsEnable: true,
      language: 'en',
      translate: () => 'text',
    });
    const result = await searchFunction('fake query');
    expect(result).toEqual([
      {
        group: 'label',
        results: [
          {
            bounds: [
              -5.551753747838916, 50.111374837193324, -5.521121570443739,
              50.1324346099444,
            ],
            center: [-5.536437659141328, 50.12190472356886],
            geom: {
              coordinates: [
                [
                  [-5.551753747838916, 50.1324346099444],
                  [-5.551753747838916, 50.111374837193324],
                  [-5.521121570443739, 50.111374837193324],
                  [-5.521121570443739, 50.1324346099444],
                  [-5.551753747838916, 50.1324346099444],
                ],
              ],
              type: 'Polygon',
            },
            id: 1,
            label: 1,
            layers: ['layer1', 'layer2'],
          },
        ],
        total: 1,
      },
      {
        total: 1,
        group: 'text',
        results: [{ bounds: [0, 1, 2, 3], id: 1, label: 'label' }],
      },
    ]);
  });
});
