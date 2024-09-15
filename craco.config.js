const path = require('path');
// const inliner = require('@vgrid/sass-inline-svg');
const { sassNull } = require('sass');

module.exports = {
  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          includePaths: ['src', './node_modules'],
          functions: {
            /**
             * Sass function to inline a UI icon svg and change its path color.
             *
             * Usage:
             * svg-icon("16px/icon-name.svg", (path: (fill: $color)) )
             */

            'svg-icon($path, $selectors: null)': () => sassNull,
            // inliner(
            //   path.join(__dirname, 'ressources/icons'),
            //   {
            //     // run through SVGO first
            //     optimize: true,
            //     // minimal "uri" encoding is smaller than base64
            //     encodingFormat: 'uri',
            //   },
            // ),
          },
        },
      },
    },
  },
  webpack: {
    alias: {
      '@terralego/core': path.resolve(__dirname, 'src/terra-front'),
    },
  },
};
