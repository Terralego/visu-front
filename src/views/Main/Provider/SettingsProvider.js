import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import Api from '@terralego/core/modules/Api';
import { connectAuthProvider } from '@terralego/core/modules/Auth';
import { useLocation } from 'react-router';
import { contextSettings } from './context';

const { Provider } = contextSettings;

const SETTINGS_PATH = '/settings.json';

const DEFAULT_SETTINGS = {
  favicon: '/terravisu/favicon.png',
  title: 'TerraVisu',
  version: 'v0.1',
  credits: 'Source: Terravisu',
  theme: {
    logo: '/images/terravisu-logo.png',
    brandLogo: '/images/terravisu-logo.png',
    logoUrl: '/',
    styles: [],
  },
  extraMenuItems: [],
  allowUserRegistration: false,
  frontendTools: {
    measureControl: {
      enable: false,
      styles: [],
    },
    searchInLayers: true,
    searchInLocations: {
      enable: false,
      searchProvider: {
        provider: 'nominatim',
      },
    },
  },
  sentry: {
    dsn: '',
    environment: '',
    release: '',
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  },
};

const TERRA_TOKEN_KEY = 'tf:auth:token';


const getSettings =  async () => {
  try {
    const customSettings = await fetch(SETTINGS_PATH);
    return await customSettings.json();
  } catch (e) {
    try {
      return await Api.request('settings/frontend');
    } catch (exc) {
      // eslint-disable-next-line no-console
      console.log('settings.json is missing. Please create a public/settings.json from public/settings.dist.json');
      return DEFAULT_SETTINGS;
    }
  }
};

export const SettingsProvider = ({ children, authenticated, setAuthenticated }) => {
  const [settings, setSettings] = useState({});


  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const nextSettings = await getSettings();
      if (!isMounted) return;
      if (nextSettings.token && !global.localStorage.getItem(TERRA_TOKEN_KEY)) {
        global.localStorage.setItem(TERRA_TOKEN_KEY, nextSettings.token);
        !authenticated && setAuthenticated(true);
      }
      setSettings(nextSettings);

      if (nextSettings?.sentry?.dsn) {
        Sentry.init({
          sendDefaultPii: nextSettings.sentry.sendDefaultPii,
          dsn: nextSettings.sentry.dsn,
          release: nextSettings.sentry.release,
          environment: nextSettings.sentry.environment,
          integrations: [
            new Sentry.BrowserTracing({
              // See docs for support of different versions of variation of react router
              // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
              routingInstrumentation: Sentry.reactRouterV5Instrumentation(
                React.useEffect,
                useLocation,
              ),
            }),
            new Sentry.Replay(),
          ],
          tracesSampleRate: nextSettings.sentry.tracesSampleRate,
          replaysSessionSampleRate: nextSettings.sentry.replaysSessionSampleRate,
          replaysOnErrorSampleRate: nextSettings.sentry.replaysOnErrorSampleRate,
        });
      }
    };

    loadSettings();


    return () => { isMounted = false; };
  }, [setSettings, authenticated, setAuthenticated]);

  const value = { settings };

  return (
    <Provider value={value}>
      {children}
    </Provider>
  );
};

export default connectAuthProvider('authenticated', 'setAuthenticated')(SettingsProvider);
