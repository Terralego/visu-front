import { fetchEnv, getEnv } from './env';

const envConfig = {
  API_HOST: 'http://foo/api',
  VIEW_ROOT_PATH: 'visualiser',
  DEFAULT_VIEWNAME: 'population',
};

vi.hoisted(() => {
  global.fetch = vi.fn(() => Promise.resolve({ json: () => ({}) }));
});

it('should resolve the env config fetched from the public folder', async () => {
  global.fetch = vi.fn(() => Promise.resolve({ json: () => envConfig }));

  await expect(fetchEnv()).resolves.toBe(envConfig);
  expect(global.fetch).toHaveBeenCalledWith('/env.json');
});

it('should expose the config fetched once at startup', async () => {
  expect(getEnv()).toBe(getEnv());
  await expect(getEnv()).resolves.toEqual({});
});
