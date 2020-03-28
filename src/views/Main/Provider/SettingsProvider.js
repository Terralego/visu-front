import React, { useState, useEffect } from 'react';

import { contextSettings } from './context';

const { Provider } = contextSettings;

const SETTINGS_PATH = '/settings.json';

const DEFAULT_SETTINGS = {
  favicon: '/favicon.png',
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
};


const getSettings =  async () => {
  try {
    const customSettings = await fetch(SETTINGS_PATH);
    return await customSettings.json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('settings.json is missing. Please create a public/settings.json from public/settings.dist.json');
    return DEFAULT_SETTINGS;
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});


  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const nextSettings = await getSettings();
      if (!isMounted) return;
      setSettings(nextSettings);
    };

    loadSettings();

    return () => { isMounted = false; };
  }, [setSettings]);

  const value = { settings };

  return (
    <Provider value={value}>
      {children}
    </Provider>
  );
};

export default SettingsProvider;
