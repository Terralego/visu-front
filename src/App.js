import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '@terralego/core/modules/Auth';
import { ApiProvider } from '@terralego/core/modules/Api';
import StateProvider from '@terralego/core/modules/State/Hash';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './app.scss';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';

import withEnv from './config/withEnv';
import Main from './views/Main';

const App = ({ env: { API_HOST } }) => (
  <ApiProvider host={API_HOST}>
    <AuthProvider>
      <StateProvider>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </StateProvider>
    </AuthProvider>
  </ApiProvider>
);

export default withEnv(App);
