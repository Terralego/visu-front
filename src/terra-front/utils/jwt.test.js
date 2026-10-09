import { checkTokenValidity, getTokenPayload } from './jwt';

const toBase64Url = value => window.btoa(
  Array.from(new TextEncoder().encode(value))
    .map(byte => String.fromCharCode(byte))
    .join(''),
).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = payload =>
  `${toBase64Url('{"alg":"HS256","typ":"JWT"}')}.${toBase64Url(JSON.stringify(payload))}.signature`;

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600;

beforeEach(() => {
  vi.stubGlobal('Buffer', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('should decode a payload without Buffer', () => {
  const token = makeToken({ exp: inAnHour(), email: 'someone@example.com' });

  expect(getTokenPayload(token)).toEqual({
    exp: expect.any(Number),
    email: 'someone@example.com',
  });
});

it('should decode accented characters', () => {
  const token = makeToken({ exp: inAnHour(), user: { name: 'Benoît Lefèvre', city: 'Nîmes' } });

  expect(getTokenPayload(token).user).toEqual({ name: 'Benoît Lefèvre', city: 'Nîmes' });
});

it('should decode a payload using the base64url alphabet', () => {
  const token = makeToken({ exp: inAnHour(), blob: '~~~???>>>???~~~' });

  expect(getTokenPayload(token).blob).toBe('~~~???>>>???~~~');
});

it('should return an empty payload for a garbled token', () => {
  expect(getTokenPayload('not.a.token')).toEqual({});
  expect(getTokenPayload('')).toEqual({});
  expect(getTokenPayload(undefined)).toEqual({});
});

it('should keep a token that has not expired valid', () => {
  expect(checkTokenValidity(makeToken({ exp: inAnHour() }))).toBe(true);
});

it('should reject an expired token', () => {
  expect(checkTokenValidity(makeToken({ exp: Math.floor(Date.now() / 1000) - 1 }))).toBe(false);
});

it('should reject a token carrying no expiry', () => {
  expect(checkTokenValidity(makeToken({ email: 'someone@example.com' }))).toBe(false);
});
