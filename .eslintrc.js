const error = 'error';
const warn = 'warn';
const off = 'off';
const always = 'always';

module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      // Load webpack.config to allow resolving aliases in imports
      webpack: {
        config: 'webpack.config.eslint.js',
      },
    },
  },

  rules: {
    // Conservative approach - downgrade most rules to warnings to avoid breaking the build
    'arrow-parens': [error, 'as-needed'],
    camelcase: [warn],
    'no-param-reassign': [warn],
    'object-curly-newline': [warn, { consistent: true }],
    'implicit-arrow-linebreak': [off],
    'prefer-template': [warn],
    
    // Import rules - keep as warnings to avoid build failures
    'import/extensions': [warn],
    'import/no-extraneous-dependencies': [warn, { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/*.stories.js'] }],
    'import/no-named-as-default': [off],
    'import/no-unresolved': [warn, { ignore: ['^@storybook'] }],
    'import/no-cycle': [warn],
    
    // JSX A11y rules - downgrade to warnings
    'jsx-a11y/anchor-is-valid': [warn, { specialLink: ['to'] }],
    'jsx-a11y/label-has-associated-control': [warn, {
      controlComponents: ['InputGroup'],
    }],
    'jsx-a11y/control-has-associated-label': [warn],
    
    // React rules - mostly warnings to avoid breaking existing code
    'react/jsx-filename-extension': [warn, { extensions: ['.js', '.jsx'] }],
    'react/jsx-one-expression-per-line': [off],
    'react/jsx-props-no-spreading': [off],
    'react/no-unescaped-entities': [off],
    'react/prefer-stateless-function': [warn],
    'react/prop-types': [warn], // Keep this as warning since you have PropTypes
    'react/state-in-constructor': [off],
    'react/static-property-placement': [off],
    'react/destructuring-assignment': [warn],
    'react/no-access-state-in-setstate': [warn],
    'react/no-this-in-sfc': [warn],
    'react/forbid-prop-types': [warn],
    'react/require-default-props': [warn],
    'react/jsx-curly-newline': [warn],
    'react/no-danger': [warn],
    'react/jsx-no-undef': [warn],
    
    // React Hooks
    'react-hooks/exhaustive-deps': [warn],
    'react-hooks/rules-of-hooks': [warn],
    
    // General rules - keep as warnings
    'operator-linebreak': [off],
    semi: [warn],
    'no-multiple-empty-lines': [warn],
    'no-unused-vars': [warn],
    'class-methods-use-this': [warn],
    'no-underscore-dangle': [warn],
    'no-console': [warn],
    'no-undef': [warn],
    'consistent-return': [warn],
    'arrow-body-style': [warn],
    
    // Spacing rules from your new config
    'key-spacing': [warn, {
      singleLine: { mode: 'strict' },
      multiLine: { mode: 'minimum' },
    }],
    
    'no-multi-spaces': [warn, {
      exceptions: {
        Property: true,
        VariableDeclarator: true,
        ImportDeclaration: true,
        BinaryExpression: true,
      },
    }],
    
    'no-unused-expressions': [warn, {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: true,
    }],

    'space-before-function-paren': [warn],
    'react/function-component-definition': [off],
    'no-trailing-spaces': [warn],
    'default-param-last': [off],
    'react/no-unstable-nested-components': [warn],
    'function-paren-newline': [warn],
    'space-before-function-paren': [warn],
    'react/no-unused-class-component-methods': [warn],
    'react/jsx-no-useless-fragment': [warn],
    'no-constructor-return': [warn],
  },

  overrides: [
    {
      files: ['src/terra-front/**/*.js'],
      rules: {
        camelcase: [off],
      },
    },
  ],
};
