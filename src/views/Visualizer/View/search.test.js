import fetchNominatim from './search';

global.fetch = jest.fn(() => Promise.resolve({
  json: () =>
    Promise.resolve({
      features: [
        { bbox: [0, 1, 2, 3], properties: { osm_id: 1, display_name: 'label' } },
      ],
    }),
}));

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
