import React from 'react';
import connect from 'react-ctx-connect';

export const context = React.createContext();
export const connectMain = connect(context);

export default context;
