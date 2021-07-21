/**
 * Note: Do not import/require anything in this file and use CommonJS syntax
 * only. This file configures Babel, which allows the use of these features.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '14' },
      modules: 'cjs',
      // Do not transpile import() statements. This will allow packages that
      // publish CommonJS to import ES Modules.
      exclude: ['@babel/plugin-proposal-dynamic-import']
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    'babel-plugin-add-module-exports',
    ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
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
