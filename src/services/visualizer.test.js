import Api from '@terralego/core/modules/Api';

import { fetchAllViews, fetchViewConfig, normalizeExtents } from './visualizer';

vi.mock('@terralego/core/modules/Api', () => ({
  default: { host: 'http://backend/api', request: vi.fn() },
}));

const viewConfig = overrides => ({
  layersTree: [],
  map: { customStyle: { sources: [], layers: [] } },
  ...overrides,
});

beforeEach(() => {
  Api.request.mockReset();
  fetchViewConfig.clear();
});

describe('fetchViewConfig', () => {
  it('should rewrite backend relative urls with the api host', async () => {
    Api.request.mockResolvedValue(viewConfig({ logo: '/api/media/logo.png' }));

    const config = await fetchViewConfig('with-media');

    expect(config.logo).toBe('http://backend/api/media/logo.png');
  });

  it('should order the custom layers so the first tree layer is drawn on top', async () => {
    Api.request.mockResolvedValue({
      layersTree: [{ label: 'first', layers: ['a'] }, { label: 'second', layers: ['b'] }],
      map: { customStyle: { layers: [{ id: 'b' }, { id: 'a' }, { id: 'untracked' }] } },
    });

    const { map: { customStyle: { layers } } } = await fetchViewConfig('ordered');

    expect(layers.map(({ id }) => id)).toEqual(['b', 'a', 'untracked']);
  });

  it('should resolve to null when the request fails', async () => {
    Api.request.mockRejectedValue(new Error('backend is down'));

    await expect(fetchViewConfig('failing')).resolves.toBe(null);
  });

  it('should fit the map on the main extent when several are offered', async () => {
    Api.request.mockResolvedValue(viewConfig({
      map: {
        customStyle: { layers: [] },
        extent_type: 'multiple',
        extra_extents: [{ id: 1, name: 'Occitanie', minLon: '0', minLat: '1', maxLon: '2', maxLat: '3' }],
      },
    }));

    const { map: { fitBounds } } = await fetchViewConfig('multiple-extents');

    expect(fitBounds.coordinates).toEqual([[0, 1], [2, 3]]);
  });

  it('should drop the fit bounds when the view defines none', async () => {
    Api.request.mockResolvedValue(viewConfig());

    const { map: { fitBounds } } = await fetchViewConfig('no-extent');

    expect(fitBounds).toBeUndefined();
  });

  it('should only request the backend once per view', async () => {
    Api.request.mockResolvedValue(viewConfig());

    await fetchViewConfig('memoized');
    await fetchViewConfig('memoized');

    expect(Api.request).toHaveBeenCalledTimes(1);
  });
});

describe('normalizeExtents', () => {
  it('should discard extents whose bounds are not numbers', () => {
    const { extents } = normalizeExtents({
      map: {
        extra_extents: [
          { id: 1, name: 'valid', minLon: '0', minLat: '1', maxLon: '2', maxLat: '3' },
          { id: 2, name: 'broken', minLon: 'nope', minLat: '1', maxLon: '2', maxLat: '3' },
        ],
      },
    });

    expect(extents.map(({ id }) => id)).toEqual([1]);
  });

  it('should tolerate a view without extents', () => {
    expect(normalizeExtents()).toEqual({ extentType: undefined, extents: [] });
  });
});

describe('fetchAllViews', () => {
  it('should turn the scenes into navigation entries', async () => {
    Api.request.mockResolvedValue({
      results: [{ name: 'Vue', slug: 'vue', custom_icon: '/api/media/icon.png' }],
    });

    await expect(fetchAllViews('view')).resolves.toEqual([
      {
        id: 'nav-vue',
        label: 'Vue',
        href: '/view/vue',
        icon: 'http://backend/api/media/icon.png',
      },
    ]);
  });

  it('should fall back to the default icon and the root path', async () => {
    Api.request.mockResolvedValue({ results: [{ name: 'Vue', slug: 'vue', custom_icon: null }] });

    const [entry] = await fetchAllViews();

    expect(entry.href).toBe('/vue');
    expect(entry.icon).toBeTruthy();
  });

  it('should let the caller know when the request fails', async () => {
    Api.request.mockRejectedValue(new Error('backend is down'));

    await expect(fetchAllViews()).rejects.toThrow('backend is down');
  });
});
