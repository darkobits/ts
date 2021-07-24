/**
 * ----- WARNING ---------------------------------------------------------------
 *
 * This file is read directly by other tools and IDEs, and should therefore be
 * written in CommonJS until tooling supports ES Module syntax natively.
 */
require('./src/etc/babel-register');

module.exports = {
  extends: require.resolve('./src/config/eslint'),
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'max-len': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-abusive-eslint-disable': 'off'
  }
};
