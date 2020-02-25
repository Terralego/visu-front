import React, { useState, useEffect } from 'react';

import withEnv from '../../../config/withEnv';

import { contextSettings } from './context';

const { Provider } = contextSettings;
const DEFAULT_SETTINGS = {
  favicon: '/favicon.png',
  title: 'terra-visu',
  theme: {
    logo: '/images/terravisu-logo.png',
    style: [],
  },
};
const getSettings =  async settingsPath => {
  try {
    const customSettings = await fetch(`/${settingsPath}`);
    return await customSettings.json();
  } catch (e) {
    console.error('settings.json is missing. Please create a public/settings.json from public/settings.dist.json');
    return DEFAULT_SETTINGS;
  }
};

export const SettingsProvider = ({ env: { SETTINGS }, children }) => {
  const [settings, setSettings] = useState({});


  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      const nextSettings = await getSettings(SETTINGS);
      if (!isMounted) return;
      setSettings(nextSettings);
    };

    loadSettings();

    return () => { isMounted = false; };
  }, [SETTINGS, setSettings]);

  const value = { settings };

  return (
    <Provider value={value}>
      {children}
    </Provider>
  );
};

export default withEnv(SettingsProvider);
