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

const mockSplitApi = ({ view, details = {}, layers = {}, sources = {} }) => {
  Api.request.mockImplementation(url => {
    const layerId = url.split('/').pop();
    if (url.includes('/layersTree/layer/')) return Promise.resolve(details[layerId]);
    if (url.includes('/customStyle/layers/')) return Promise.resolve(layers[layerId] || []);
    if (url.includes('/customStyle/source/')) return Promise.resolve(sources[layerId] || []);
    return Promise.resolve(view);
  });
};

const activeNode = (id, label) => ({ id, label, initialState: { active: true } });

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
    mockSplitApi({
      view: { layersTree: [activeNode(1, 'first'), activeNode(2, 'second')], map: {} },
      layers: {
        1: [{ id: 'a', type: 'fill', layerId: 1 }],
        2: [{ id: 'b', type: 'fill', layerId: 2 }],
      },
    });

    const { map: { customStyle: { layers } } } = await fetchViewConfig('ordered');

    expect(layers.map(({ id }) => id)).toEqual(['b', 'a']);
  });

  it('should only fetch the layers active on load', async () => {
    mockSplitApi({
      view: {
        layersTree: [activeNode(1, 'active'), { id: 2, label: 'idle', initialState: { active: false } }],
        map: {},
      },
      layers: { 1: [{ id: 'a', type: 'fill', layerId: 1 }] },
    });

    await fetchViewConfig('partial');

    const requested = Api.request.mock.calls.map(([url]) => url);
    expect(requested).toContain('geolayer/view/partial/customStyle/layers/1');
    expect(requested).not.toContain('geolayer/view/partial/customStyle/layers/2');
  });

  it('should merge the layer details into its tree node', async () => {
    mockSplitApi({
      view: { layersTree: [activeNode(1, 'first')], map: {} },
      details: { 1: { filters: { layer: 'index' }, legends: [{ title: 'legend' }] } },
    });

    const { layersTree: [node] } = await fetchViewConfig('details');

    expect(node.filters).toEqual({ layer: 'index' });
    expect(node.legends).toEqual([{ title: 'legend' }]);
    expect(node.fetched).toBe(true);
  });

  it('should deduplicate the sources shared by several layers', async () => {
    mockSplitApi({
      view: { layersTree: [activeNode(1, 'first'), activeNode(2, 'second')], map: {} },
      sources: { 1: [{ id: 'shared' }], 2: [{ id: 'shared' }, { id: 'own' }] },
    });

    const { map: { customStyle: { sources } } } = await fetchViewConfig('shared-sources');

    expect(sources.map(({ id }) => id)).toEqual(['shared', 'own']);
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
