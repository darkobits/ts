const { EXTENSIONS_WITH_DOT } = require('../etc/constants');

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
    'babel-plugin-transform-import-meta',
    ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: EXTENSIONS_WITH_DOT
    }]
  ],
  comments: false,
  compact: false,
  sourceType: 'unambiguous'
};
