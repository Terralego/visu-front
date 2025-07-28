const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      '@terralego/core': path.resolve(__dirname, 'src/terra-front'),
    },
    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ['console'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    configure: webpackConfig => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        vm: require.resolve('vm-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        fs: false,
        net: false,
        tls: false,
      };

      // Define process.env for browser
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
          process: JSON.stringify({ env: process.env }),
        }),
      );

      return webpackConfig;
    },
  },
};
