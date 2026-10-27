import toPreviewParts, { wrapLegacy } from './previewParts';

const legacy = id => ({ id, type: 'legacy-field', template: `<p>${id}</p>` });

describe('toPreviewParts', () => {
  it('gives consecutive Legacy blocks a single envelope', () => {
    const parts = toPreviewParts([legacy('a'), legacy('b'), { id: 'e', type: 'expert', template: 'x' }, legacy('c')]);

    expect(parts).toEqual([
      { kind: 'nunjucks', key: 'a', template: wrapLegacy(['<p>a</p>', '<p>b</p>']) },
      { kind: 'nunjucks', key: 'e', template: 'x' },
      { kind: 'nunjucks', key: 'c', template: wrapLegacy(['<p>c</p>']) },
    ]);
  });

  it('leaves other blocks to their component', () => {
    const chart = { id: 'g', type: 'chart' };

    expect(toPreviewParts([chart])).toEqual([{ kind: 'block', key: 'g', block: chart }]);
  });

  it('gives nothing without blocks', () => {
    expect(toPreviewParts()).toEqual([]);
  });
});
