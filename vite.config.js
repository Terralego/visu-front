import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import { sassNull } from 'sass';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'process.env': {},
    _: {},
  },
  resolve: {
    alias: [
      { find: '@terralego/core', replacement: path.resolve(__dirname, './src/terra-front') },
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: '$1',
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src', './node_modules'],
        functions: {
          'svg-icon($path, $selectors: null)': () => sassNull,
        },
      },
    },
  },
});
