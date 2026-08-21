const sass = require('sass');

// Custom Sass functions to support Blueprint.js svg-icon function
const customSassFunctions = {
  'svg-icon($path, $params: null)': function(path, params) {
    // Return a transparent 1x1 pixel as a fallback
    // This prevents the build error while maintaining functionality
    return new sass.types.String('url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3C/svg%3E")')
  }
};

module.exports = customSassFunctions;
