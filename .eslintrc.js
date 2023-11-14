const error  = 'error';
const warn   = 'warn';
const off    = 'off';
const always = 'always';

module.exports = {
  extends: 'makina',

  settings: {
    'import/resolver': { // Load webpack.config to allow resolving aliases in imports
      webpack: {
        config: 'webpack.config.eslint.js',
      }
    },
  },

  rules: {
    'import/no-cycle': [off],
    'import/no-unresolved': [warn, { ignore: ['^@storybook'] }],
    'jsx-a11y/label-has-associated-control': [error, {
      controlComponents: ['InputGroup'],
    }],
    'operator-linebreak': [off],
    'react/destructuring-assignment': [error],
    'react/no-access-state-in-setstate': [error],
    'react/no-this-in-sfc': [error],
  },

  overrides: [
    {
      files: ['src/terra-front/**/*.js'],
      rules: {
        camelcase: [off],
      },
    }
  ],
};
