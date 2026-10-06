import fetchFeatures, { clear } from './fetchFeatures';

const okResponse = payload => vi.fn(() => ({ json: () => payload }));

beforeEach(() => {
  clear();
  global.fetch = okResponse({});
});

it('should resolve with the fetched payload', async () => {
  const expected = {};
  global.fetch = okResponse(expected);

  await expect(fetchFeatures('some/url/1')).resolves.toBe(expected);
});

it('should return the same promise for a url already requested', () => {
  expect(fetchFeatures('some/url/2')).toBe(fetchFeatures('some/url/2'));
});

it('should reject with the status text when the request fails', async () => {
  global.fetch = vi.fn(() => ({ status: 404, statusText: 'not found' }));

  await expect(fetchFeatures('some/url/3')).rejects.toThrow('not found');
});
