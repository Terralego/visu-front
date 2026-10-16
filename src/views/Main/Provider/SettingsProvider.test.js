import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { authService } from '@terralego/core/modules/Auth';

import { SettingsProvider } from './SettingsProvider';

vi.mock('@terralego/core/modules/Api', () => ({
  default: {
    request: vi.fn().mockRejectedValue(new Error('no api')),
    on: vi.fn(),
  },
  EVENT_FAILURE: 'failure',
  POST: 'POST',
}));

const TOKEN_KEY = 'tf:auth:token';
const SESSION_TOKEN = 'session.token.value';
const FORM_TOKEN = 'form.token.value';

const renderWith = settings => {
  const setAuthenticated = vi.fn();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => settings }));
  render(
    <SettingsProvider authenticated={false} setAuthenticated={setAuthenticated}>
      <span />
    </SettingsProvider>,
  );
  return setAuthenticated;
};

beforeEach(() => {
  global.localStorage.clear();
  vi.unstubAllGlobals();
});

it('should adopt the token the django session hands over', async () => {
  const setAuthenticated = renderWith({ token: SESSION_TOKEN });

  await waitFor(() => expect(global.localStorage.getItem(TOKEN_KEY)).toBe(SESSION_TOKEN));
  expect(authService.isSessionToken()).toBe(true);
  expect(setAuthenticated).toHaveBeenCalledWith(true);
});

it('should drop a session token once the django session is closed', async () => {
  authService.storeSessionToken(SESSION_TOKEN);

  const setAuthenticated = renderWith({ token: null });

  await waitFor(() => expect(global.localStorage.getItem(TOKEN_KEY)).toBe(null));
  expect(setAuthenticated).toHaveBeenCalledWith(false);
});

it('should keep a token obtained from the login form', async () => {
  global.localStorage.setItem(TOKEN_KEY, FORM_TOKEN);

  const setAuthenticated = renderWith({ token: null });

  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(global.localStorage.getItem(TOKEN_KEY)).toBe(FORM_TOKEN);
  expect(setAuthenticated).not.toHaveBeenCalled();
});

it('should keep the token when the settings carry no token at all', async () => {
  authService.storeSessionToken(SESSION_TOKEN);

  const setAuthenticated = renderWith({ title: 'TerraVisu' });

  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(global.localStorage.getItem(TOKEN_KEY)).toBe(SESSION_TOKEN);
  expect(setAuthenticated).not.toHaveBeenCalled();
});
