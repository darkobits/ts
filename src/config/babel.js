// -----------------------------------------------------------------------------
// ----- Babel Configuration ---------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Uses 'extends': Yes
 * Non-CJS config: No
 * Babel Config:   N/A
 *
 * Additionally, require() must use relative paths because this file configures
 * Babel, which is responsible for re-writing path aliases.
 */
const { EXTENSIONS_WITH_DOT } = require('../etc/constants');


module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: [
        'node 12'
      ]
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // This plugin must come before @babel/plugin-proposal-class-properties.
    ['@babel/plugin-proposal-decorators', {legacy: true, loose: true}],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-add-module-exports',
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: [...EXTENSIONS_WITH_DOT, '.json']
    }]
  ],
  // Strip comments from transpiled code.
  comments: false
};
