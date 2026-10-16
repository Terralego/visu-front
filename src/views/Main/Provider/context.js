import React from 'react';
import connect from 'react-ctx-connect';

export const contextSettings = React.createContext({});
export const connectSettings = connect(contextSettings);
