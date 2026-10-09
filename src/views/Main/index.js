import React from 'react';

import Header from './Header';
import Content from './Content';
import Head from './Head';
import './styles.scss';
import SettingsProvider from './Provider/SettingsProvider';

export const Main = () => (
  <SettingsProvider>
    <Head />
    <main className="main">
      <Header />
      <Content />
    </main>
  </SettingsProvider>
);
export default Main;
