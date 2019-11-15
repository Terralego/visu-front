import Api, { POST, EVENT_FAILURE } from '../../Api';
import log from './log';

const TOKEN_KEY = 'tf:auth:token';
const ENDPOINT_OBTAIN_TOKEN = 'auth/obtain-token/';
const ENDPOINT_REFRESH_TOKEN = 'auth/refresh-token/';
const ENDPOINT_CREATE_TOKEN = 'accounts/register/'; // => auth/create-token/

export function parseToken (token) {
  const [, payload = ''] = token.split('.');
  const base64 = payload.replace('-', '+').replace('_', '/');

  try {
    return JSON.parse(atob(base64));
  } catch (e) {
    return {};
  }
}

/**
 * Return wether given JWT token is still valid
 */
export const checkToken = token => {
  if (!token) {
    return null;
  }

  const { exp } = parseToken(token);

  const hasExpired = Date.now() >= (exp * 1000);
  if (!exp || hasExpired) {
    console.info('Stored token has expired.'); // eslint-disable-line no-console
    return false;
  }

  return true;
};

export async function createToken (properties) {
  log('create auth token start');
  return Api.request(ENDPOINT_CREATE_TOKEN, {
    method: POST,
    body: properties,
  });
}

export async function obtainToken (email, password) {
  log('auth request start');
  const { token } = await Api.request(ENDPOINT_OBTAIN_TOKEN, {
    method: POST,
    body: { email, password },
  });

  global.localStorage.setItem(TOKEN_KEY, token);

  return token;
}

export const getToken = () => {
  const storedToken = global.localStorage.getItem(TOKEN_KEY);

  return checkToken(storedToken)
    ? storedToken
    : undefined;
};

export const clearToken = () => global.localStorage.removeItem(TOKEN_KEY);

export const invalidToken = clearToken; // Legacy

export async function refreshToken () {
  const currentToken = getToken();
  if (!currentToken) {
    return null;
  }

  const { token } = await Api.request(ENDPOINT_REFRESH_TOKEN, {
    method: POST,
    body: { token: currentToken },
  });

  global.localStorage.setItem(TOKEN_KEY, token);
  return token;
}

Api.on(EVENT_FAILURE, response => {
  if (response.status === 401) {
    clearToken();
  }
});

export default {
  checkToken,
  clearToken,
  createToken,
  getToken,
  obtainToken,
  parseToken,
  refreshToken,
};
