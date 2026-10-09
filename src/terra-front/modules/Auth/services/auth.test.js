import b64u from 'base64url';

import Api from '../../Api';
import {
  obtainToken,
  refreshToken,
  getToken,
  clearToken,
  closeServerSession,
  createToken,
  isSessionToken,
  storeSessionToken,
} from './auth';
import { getTokenPayload } from '../../../utils/jwt';

export const MOCKED_PAYLOAD = { exp: 1516239022, user: { id: 42 } };
export const MOCKED_TOKEN = `xxx.${b64u(JSON.stringify({ ...MOCKED_PAYLOAD }))}.xxx`;
export const IMPERISHABLE_TOKEN = `imp.${b64u(JSON.stringify({ ...MOCKED_PAYLOAD, exp: 99999999999 }))}.xxx`;
export const EXPIRED_TOKEN = `exp.${b64u(JSON.stringify({ ...MOCKED_PAYLOAD, exp: 0 }))}.xxx`;

const apiListeners = vi.hoisted(() => ({ failure: null }));

vi.mock('../../Api', async () => {
  const { default: b64uM } = await import('base64url');

  const api = {
    EVENT_FAILURE: 'failure',
    on: vi.fn((event, fn) => {
      apiListeners.failure = fn;
    }),
    request: vi.fn((endpoint, { body: { token } }) => {
      if (endpoint === 'auth/obtain-token/') {
        return { token: 'newToken' };
      }

      if (endpoint === 'auth/refresh-token/') {
        const [, b64Payload] = token.split('.');
        const payload = JSON.parse(b64uM.decode(b64Payload));
        const isValid = (payload.exp * 1000) >= Date.now();

        if (token === 'invalid' || !isValid) {
          throw new Error('Invalid token');
        }

        return { token: 'refreshedToken' };
      }

      return {};
    }),
  };

  return { default: api, EVENT_FAILURE: api.EVENT_FAILURE, POST: 'POST' };
});

beforeEach(() => {
  global.localStorage.clear();
});

it('should clear the token when the api rejects it as unauthorized', () => {
  global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);

  apiListeners.failure({ status: 401 });

  expect(getToken()).toBeFalsy();
});

it('should keep the token on other api failures', () => {
  global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);

  apiListeners.failure({ status: 500 });

  expect(getToken()).toBe(IMPERISHABLE_TOKEN);
});

it('should not refresh token', async () => {
  const token = await refreshToken();
  expect(token).toBe(null);
});

it('should request a token', async () => {
  const token = await obtainToken('foo@bar', 'bar');
  expect(Api.request).toHaveBeenCalledWith('auth/obtain-token/', {
    method: 'POST',
    body: { email: 'foo@bar', password: 'bar' },
  });
  expect(token).toBe('newToken');
  expect(global.localStorage.getItem('tf:auth:token')).toBe('newToken');
});

it('should refresh token', async () => {
  global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);

  const token = await refreshToken();
  expect(Api.request).toHaveBeenCalledWith('auth/refresh-token/', {
    method: 'POST',
    body: { token: IMPERISHABLE_TOKEN },
  });
  expect(token).toBe('refreshedToken');
});

it('should get token', () => {
  global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);
  const token = getToken();
  expect(token).toBe(IMPERISHABLE_TOKEN);
});

it('should invalidate token', () => {
  global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);
  clearToken();
  expect(getToken()).toBeFalsy();
});

it('should parse token', () => {
  const data = getTokenPayload(MOCKED_TOKEN);
  expect(data).toEqual(MOCKED_PAYLOAD);
});

it('should parse an invalid token', () => {
  const data = getTokenPayload('foo');
  expect(data).toEqual({});
});

it('should create a token', () => {
  const properties = { foo: 'bar' };
  createToken(properties);
  expect(Api.request).toHaveBeenCalledWith('accounts/register/', {
    method: 'POST',
    body: { foo: 'bar' },
  });
});

it('should delete invalid token on refresh', async () => {
  global.localStorage.setItem('tf:auth:token', 'invalid');
  await refreshToken();
  expect(getToken()).not.toBeDefined();
});

describe('closeServerSession', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('should post to the admin logout, the only one nginx proxies', async () => {
    document.cookie = 'csrftoken=abc123';
    const fetchMock = vi.fn().mockResolvedValue({ status: 302 });
    vi.stubGlobal('fetch', fetchMock);

    await closeServerSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/config/logout/');
    expect(options).toMatchObject({
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers: { 'X-CSRFToken': 'abc123' },
    });
  });

  it('should use the url it is given', async () => {
    document.cookie = 'csrftoken=abc123';
    const fetchMock = vi.fn().mockResolvedValue({ status: 302 });
    vi.stubGlobal('fetch', fetchMock);

    await closeServerSession('/sso/logout/');

    expect(String(fetchMock.mock.calls[0][0])).toContain('/sso/logout/');
  });

  it('should do nothing when no django session is open', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await closeServerSession();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should not throw when the logout request fails', async () => {
    document.cookie = 'csrftoken=abc123';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(closeServerSession()).resolves.toBeUndefined();
  });
});

describe('session tokens', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('should flag a token coming from the django session', () => {
    storeSessionToken(IMPERISHABLE_TOKEN);

    expect(global.localStorage.getItem('tf:auth:token')).toBe(IMPERISHABLE_TOKEN);
    expect(isSessionToken()).toBe(true);
  });

  it('should not flag a token coming from the login form', async () => {
    storeSessionToken(IMPERISHABLE_TOKEN);
    await obtainToken('foo@exemple.fr', 'password');

    expect(isSessionToken()).toBe(false);
  });

  it('should drop the flag along with the token', () => {
    storeSessionToken(IMPERISHABLE_TOKEN);
    clearToken();

    expect(global.localStorage.getItem('tf:auth:token')).toBe(null);
    expect(isSessionToken()).toBe(false);
  });

  it('should report no session token when nothing is stored', () => {
    expect(isSessionToken()).toBe(false);
  });
});
