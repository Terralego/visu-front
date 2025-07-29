const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');
const customSassFunctions = require('../src/sass-functions');

module.exports = {
  webpack: {
    alias: {
      '@terralego/core': path.resolve(__dirname, '../src/terra-front'),
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
      const newWebpackConfig = webpackConfig;
      const miniCssExtractPlugin = newWebpackConfig.plugins.find(
        webpackPlugin => webpackPlugin instanceof MiniCssExtractPlugin,
      );
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.filename = 'css/[name].css';
        miniCssExtractPlugin.options.moduleFilename = () => 'static/css/main.css';
      }

      newWebpackConfig.output.filename = 'static/js/[name].js';
      newWebpackConfig.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      newWebpackConfig.optimization.runtimeChunk = false;

      // Add fallbacks for Node.js modules (same as main config)
      newWebpackConfig.resolve.fallback = {
        ...newWebpackConfig.resolve.fallback,
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

      // Configure Sass loader with custom functions
      const sassRule = newWebpackConfig.module.rules
        .find(rule => rule.oneOf)
        ?.oneOf.find(rule => rule.test && rule.test.toString().includes('scss|sass'));
      
      if (sassRule) {
        const sassLoader = sassRule.use.find(loader => 
          loader.loader && loader.loader.includes('sass-loader')
        );
        
        if (sassLoader) {
          sassLoader.options = {
            ...sassLoader.options,
            sassOptions: {
              ...sassLoader.options?.sassOptions,
              functions: customSassFunctions,
              quietDeps: true,
              includePaths: [
                path.resolve(__dirname, '..', 'node_modules'),
                path.resolve(__dirname, '..', 'src')
              ]
            }
          };
        }
      }

      return newWebpackConfig;
    },
  },
};
