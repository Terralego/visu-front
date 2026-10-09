import Api, { POST, EVENT_FAILURE } from '../../Api';
import log from './log';
import { checkTokenValidity } from '../../../utils/jwt';

const TOKEN_KEY = 'tf:auth:token';
const SESSION_TOKEN_FLAG = 'tf:auth:from-session';
const ENDPOINT_OBTAIN_TOKEN = 'auth/obtain-token/';
const ENDPOINT_REFRESH_TOKEN = 'auth/refresh-token/';
const ENDPOINT_CREATE_TOKEN = 'accounts/register/'; // => auth/create-token/
const DJANGO_LOGOUT_URL = '/config/logout/';

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
  global.localStorage.removeItem(SESSION_TOKEN_FLAG);

  return token;
}

export const clearToken = () => {
  global.localStorage.removeItem(TOKEN_KEY);
  global.localStorage.removeItem(SESSION_TOKEN_FLAG);
};

export const storeSessionToken = token => {
  global.localStorage.setItem(TOKEN_KEY, token);
  global.localStorage.setItem(SESSION_TOKEN_FLAG, '1');
};

export const isSessionToken = () => global.localStorage.getItem(SESSION_TOKEN_FLAG) === '1';

const getCookie = name => document.cookie
  .split('; ')
  .find(row => row.startsWith(`${name}=`))
  ?.split('=')[1];

export const closeServerSession = async (logoutUrl = DJANGO_LOGOUT_URL) => {
  const csrfToken = getCookie('csrftoken');
  if (!csrfToken) return;

  try {
    await fetch(new URL(logoutUrl, window.location), {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers: { 'X-CSRFToken': decodeURIComponent(csrfToken) },
      redirect: 'manual',
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

export const getToken = () => {
  const storedToken = global.localStorage.getItem(TOKEN_KEY);
  if (checkTokenValidity(storedToken)) {
    return storedToken;
  }

  clearToken(); // Drop token if invalid
  return undefined;
};

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
  clearToken,
  closeServerSession,
  createToken,
  isSessionToken,
  storeSessionToken,
  getToken,
  obtainToken,
  refreshToken,
};
