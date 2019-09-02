import React from 'react';

import Header from './Header';
import Content from './Content';
import MainProvider from './Provider';

import './styles.scss';

export const Main = () => (
  <MainProvider>
    <main className="main">
      <Header />
      <Content />
    </main>
  </MainProvider>
);

export default Main;
