// Webpack config file generated dynamically so ESlint can use it

// eslint-disable-next-line import/no-extraneous-dependencies
const { createWebpackDevConfig } = require('@craco/craco');
const cracoConfig = require('./craco.config.js');

const webpackConfig = createWebpackDevConfig(cracoConfig);

module.exports = webpackConfig;
