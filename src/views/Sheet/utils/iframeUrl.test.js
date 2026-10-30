import { buildIframeUrl } from './iframeUrl';

const fields = [{ field_name: 'nom' }, { field_name: 'code' }];

describe('buildIframeUrl', () => {
  it('replaces the variables declared in the block fields', () => {
    expect(buildIframeUrl('https://example.com/{{nom}}/{{ code }}', fields, { nom: 'Lyon', code: 69 }))
      .toBe('https://example.com/Lyon/69');
  });

  it('encodes the values', () => {
    expect(buildIframeUrl('https://example.com/?q={{nom}}', fields, { nom: 'Saint-Étienne & co/2' }))
      .toBe('https://example.com/?q=Saint-%C3%89tienne%20%26%20co%2F2');
  });

  it('empties the variables missing from the block fields, even when the data has them', () => {
    expect(buildIframeUrl('https://example.com/{{nom}}/{{secret}}', fields, { nom: 'Lyon', secret: 'x' }))
      .toBe('https://example.com/Lyon/');
  });

  it('empties the variables without value', () => {
    expect(buildIframeUrl('https://example.com/{{nom}}-{{code}}', fields, { nom: null }))
      .toBe('https://example.com/-');
  });

  it('keeps a falsy value', () => {
    expect(buildIframeUrl('https://example.com/{{code}}', fields, { code: 0 }))
      .toBe('https://example.com/0');
  });

  it('returns an empty string without template', () => {
    expect(buildIframeUrl(null, fields, {})).toBe('');
  });

  it('tolerates missing fields and data', () => {
    expect(buildIframeUrl('https://example.com/{{nom}}')).toBe('https://example.com/');
  });
});
