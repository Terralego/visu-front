import React, { useState, useEffect } from 'react';

import Api from '@terralego/core/modules/Api';
import { connectAuthProvider } from '@terralego/core/modules/Auth';

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

export const SettingsProvider = ({ children, setAuthenticated }) => {
  const [settings, setSettings] = useState({});


  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const nextSettings = await getSettings();
      if (!isMounted) return;
      if (nextSettings.token && !global.localStorage.getItem(TERRA_TOKEN_KEY)) {
        global.localStorage.setItem(TERRA_TOKEN_KEY, nextSettings.token);
        setAuthenticated(true);
      }
      setSettings(nextSettings);
    };

    loadSettings();

    return () => { isMounted = false; };
  }, [setSettings, setAuthenticated]);

  const value = { settings };

  return (
    <Provider value={value}>
      {children}
    </Provider>
  );
};

export default connectAuthProvider('setAuthenticated')(SettingsProvider);
