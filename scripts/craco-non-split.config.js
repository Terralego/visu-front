const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  webpack: {
    alias: {
      '@terralego/core': path.resolve(__dirname, '../src/terra-front'),
    },
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

      return newWebpackConfig;
    },
  },
};
