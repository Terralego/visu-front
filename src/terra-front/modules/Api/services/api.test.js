import b64u from 'base64url';

import { Api, EVENT_FAILURE, EVENT_SUCCESS, buildHeaders } from './api';

const IMPERISHABLE_TOKEN = `hdr.${b64u(JSON.stringify({ exp: 99999999999, user: { id: 42 } }))}.sig`;

const response = (status, payload) => Promise.resolve({
  status,
  json: async () => payload,
  text: async () => JSON.stringify(payload),
});

global.fetch = vi.fn(path => (path.endsWith('/wrongpath')
  ? response(404, { detail: 'not found' })
  : response(200, { ok: true })));

beforeEach(() => {
  global.localStorage.clear();
  global.fetch.mockClear();
});

it('should build url', () => {
  const api = new Api();
  api.host = 'http://foo.bar';
  expect(api.buildUrl({ endpoint: '' })).toBe('http://foo.bar/');
  expect(api.buildUrl({ endpoint: 'foo/bar' })).toBe('http://foo.bar/foo/bar');
  expect(api.buildUrl({ endpoint: 'foo//bar' })).toBe('http://foo.bar/foo/bar');
  expect(api.buildUrl({ endpoint: 'foo', querystring: { bar: 'bar' } })).toBe('http://foo.bar/foo?bar=bar');
});

it('should fetch a request', async () => {
  const api = new Api();
  api.host = 'http://foo.bar';
  await api.request('');

  expect(global.fetch).toHaveBeenCalledWith('http://foo.bar/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
});

it('should request a formData', async () => {
  const api = new Api();
  api.host = '';
  const body = new FormData();
  await api.request('', { body });
  expect(global.fetch).toHaveBeenCalledWith('/', {
    method: 'GET',
    headers: {},
    body,
  });
});


it('should catch a failed fetch', async () => {
  const api = new Api();
  api.host = '';
  let error;
  try {
    await api.request('wrongpath');
  } catch (e) {
    error = e;
  }
  expect(error.constructor).toBe(Error);
});

it('should fire events', () => {
  const api = new Api();
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  api.on(EVENT_FAILURE, listener1);
  api.on(EVENT_SUCCESS, listener2);
  api.handleError({});
  expect(listener1).toHaveBeenCalled();
  api.handleSuccess({});
  expect(listener2).toHaveBeenCalled();
});

it('should off event', () => {
  const api = new Api();
  const off = api.on('foo', () => null);
  expect(api.listeners.length).toBe(1);
  off();
  expect(api.listeners.length).toBe(0);
  off();
  expect(api.listeners.length).toBe(0);
});

describe('should build headers', () => {
  it('with no token', () => {
    const headers = buildHeaders({ foo: 'bar' });
    expect(headers).toEqual({ foo: 'bar' });
  });

  it('with token', () => {
    global.localStorage.setItem('tf:auth:token', IMPERISHABLE_TOKEN);
    const headersWithToken = buildHeaders({ foo: 'bar' });
    expect(headersWithToken).toEqual({ foo: 'bar', Authorization: `JWT ${IMPERISHABLE_TOKEN}` });
  });
});

it('should fire and catch an event', () => {
  const api = new Api();
  const listener = vi.fn();
  api.on('foo', listener);
  api.fire('foo', 'bar');
  expect(listener).toHaveBeenCalledWith('bar');
});
