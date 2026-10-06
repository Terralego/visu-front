import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as sass from 'sass';

const root = import.meta.dirname;

const processEnvDefines = {
  'process.env.BLUEPRINT_NAMESPACE': 'undefined',
  'process.env.REACT_APP_BLUEPRINT_NAMESPACE': 'undefined',
};

const cjsMainDefines = {
  'require.main': 'undefined',
};

const tildeImporter = {
  findFileUrl(url) {
    if (!url.startsWith('~')) return null;
    return pathToFileURL(path.resolve(root, 'node_modules', url.slice(1)));
  },
};
const backend = process.env.BACKEND_PROXY || 'http://localhost:8000';

const proxy = {
  target: backend,
  changeOrigin: true,
  secure: false,
};

export default defineConfig(({ mode }) => {
  const splitChunks = mode !== 'non-split';

  return {
    plugins: [
      react({
        include: /\.(js|jsx)$/,
        babel: {
          presets: [['@babel/preset-react', { runtime: 'automatic' }]],
        },
      }),
    ],

    define: {
      ...processEnvDefines,
      ...cjsMainDefines,
      global: 'globalThis',
    },

    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' },
        define: processEnvDefines,
      },
    },

    resolve: {
      alias: [
        {
          find: '@terralego/core',
          replacement: path.resolve(root, 'src/terra-front'),
        },
        {
          find: /^@mui\/system\/(?!esm\/)(.+)$/,
          replacement: '@mui/system/esm/$1',
        },
      ],
      dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
    },

    server: {
      port: 3000,
      proxy: {
        '/api': proxy,
        '/static_dj': proxy,
      },
    },

    preview: {
      proxy: {
        '/api': proxy,
        '/static_dj': proxy,
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          importers: [tildeImporter],
          loadPaths: [root, path.resolve(root, 'node_modules'), path.resolve(root, 'src')],
          quietDeps: true,
          silenceDeprecations: [
            'import',
            'global-builtin',
            'color-functions',
            'legacy-js-api',
            'slash-div',
            'mixed-decls',
          ],
          functions: {
            'svg-icon($path, $params: null)': () =>
              new sass.SassString(
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3C/svg%3E")',
                { quotes: false },
              ),
          },
        },
      },
    },

    build: {
      outDir: 'build',
      cssCodeSplit: splitChunks,
      assetsDir: 'static',
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: splitChunks ? 'static/js/main.[hash].js' : 'static/js/main.js',
          chunkFileNames: 'static/js/[name].[hash].chunk.js',
          assetFileNames: info => {
            if (!info.name?.endsWith('.css')) return 'static/media/[name].[hash][extname]';
            if (!splitChunks) return 'static/css/main.css';
            const isEntry = info.originalFileNames?.includes('index.html');
            return isEntry ? 'static/css/main.[hash].css' : 'static/css/[name].[hash].chunk.css';
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      environmentOptions: {
        jsdom: { url: 'http://localhost' },
      },
      globals: true,
      include: ['src/**/*.test.js'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.js'],
        exclude: ['src/App.js', 'src/config/i18n.js', 'src/**/index.js'],
      },
    },
  };
});
