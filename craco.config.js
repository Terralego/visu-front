const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      '@terralego/core': path.resolve(__dirname, 'src/terra-front'),
    }
  },
};
