import b64u from 'base64url';

import Api from '../../Api';
import { obtainToken, refreshToken, getToken, clearToken, createToken } from './auth';
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
