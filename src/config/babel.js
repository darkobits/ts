/**
 * Note: Do not import/require anything in this file and use CommonJS syntax
 * only. This file configures Babel, which allows the use of these features.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: [
        'node 14'
      ],
      modules: 'cjs'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // This plugin must come before @babel/plugin-proposal-class-properties.
    ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-add-module-exports',
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']
    }]
  ],
  // Strip comments from transpiled code.
  comments: false,
  sourceType: 'unambiguous'
};
