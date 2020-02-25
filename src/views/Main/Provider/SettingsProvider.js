import React, { useState, useEffect } from 'react';

import { contextSettings } from './context';

import mockedSettings from '../settings_mock.json';

const { Provider } = contextSettings;

const getSettings =  async () => {
  // MOCK
  const response = mockedSettings;
  return response;
};

export const SettingsProvider = ({ children }) => {
  
  const [settings, setSettings] = useState({});

  
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
        const settings = await getSettings();
        if (!isMounted) return;
        setSettings(settings);
      };

    loadSettings();

    return (()=> isMounted = false)
  }, []);

  const value = { settings };

  return (
    <Provider value={value}>
      {children}
    </Provider>
  )
};

export default SettingsProvider;
