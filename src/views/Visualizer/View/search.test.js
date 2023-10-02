import { fetchNominatim } from './search';

global.fetch = jest.fn(() => Promise.resolve({
  json: () =>
    Promise.resolve({
      features: [
        { bbox: [0, 1, 2, 3], properties: { osm_id: 1, display_name: 'label' } },
      ],
    }),
}));

beforeEach(() => {
  fetch.mockClear();
});


it('Should format nominatim results correctly', async () => {
  const query = 'fake query';
  const translate = () => 'text';
  const language = 'en';
  const searchProvider = 'https://going.nowhere';
  const result = await fetchNominatim({ query, language, translate, searchProvider });
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
  const query = 'fake query';
  const translate = () => 'text';
  const language = 'en';
  const searchProvider = 'https://going.nowhere';

  const result = await fetchNominatim({ query, language, translate, searchProvider });
  expect(result).toEqual([]);
});

it('Should be called with viewbow param when viewbox is passed', async () => {
  const query = 'fake query';
  const translate = () => 'text';
  const language = 'en';
  const searchProvider = 'https://going.nowhere';
  const viewbox = [1, 40, 2, 50];
  await fetchNominatim({ query, language, translate, searchProvider, viewbox });

  const url = new URL(searchProvider);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('accept-language', language);
  url.searchParams.set('viewbox', viewbox);
  url.searchParams.set('polygon_geojson', 1);
  url.searchParams.set('bounded', 1);
  expect(fetch).toHaveBeenCalledWith(
    url,
    { headers: { map: { 'content-type': 'application/json' } } },
  );
});
