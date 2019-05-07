import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '@terralego/core/modules/Auth';
import { ApiProvider } from '@terralego/core/modules/Api';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';

import withEnv from './config/withEnv';
import Main from './views/Main';

const App = ({ env: { API_HOST } }) => (
  <ApiProvider host={API_HOST}>
    <AuthProvider>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </AuthProvider>
  </ApiProvider>
);

export default withEnv(App);
