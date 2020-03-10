import React, { useState, useEffect } from 'react';

import withEnv from '../../../config/withEnv';

import { contextSettings } from './context';

const { Provider } = contextSettings;
const defaultSettings = {
  favicon: '/favicon.png',
  title: 'terra-visu',
  theme: {
    logo: '/images/terravisu-logo.png',
    style: ['<URL>'],
  },
};
const getSettings =  async SETTINGS => {
  try {
    const customSettings = await fetch(`/${SETTINGS}`);
    return await customSettings.json();
  } catch (e) {
    console.error('settings.json is invalid. Please create a public/settings.json from public/settings.dist.json');
    return defaultSettings;
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
