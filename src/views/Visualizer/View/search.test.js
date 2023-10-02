import fetchNominatim from './search';

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
  const result = await fetchNominatim(query, language, translate);
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
  const searchProvider = 'https//going.nowhere';

  const result = await fetchNominatim(query, language, translate, searchProvider);
  expect(result).toEqual([]);
});

it('Should be called with viewbow param when viewbox is passed', async () => {
  const query = 'fake query';
  const translate = () => 'text';
  const language = 'en';
  const searchProvider = 'https//going.nowhere';
  const viewbox = [1, 40, 2, 50];
  await fetchNominatim(query, language, translate, searchProvider, viewbox);

  const params = new URLSearchParams({
    q: query,
    format: 'geojson',
    'accept-language': language,
    viewbox,
    polygon_geojson: 1,
    bounded: 1,
  });
  expect(fetch).toHaveBeenCalledWith(
    `${searchProvider}${params}`,
    { headers: { map: { 'content-type': 'application/json' } } },
  );
});
