import React from 'react';

import Header from './Header';
import Content from './Content';

import './styles.scss';

export const Main = () => (
  <main className="main">
    <Header />
    <Content />
  </main>
);

export default Main;
