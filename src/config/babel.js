const { EXTENSIONS_WITH_DOT, SRC_DIR } = require('../etc/constants');

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '16' },
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
    ['@babel/plugin-proposal-decorators', {
      legacy: true,
      loose: true
    }],
    ['babel-plugin-module-resolver', {
      cwd: 'babelrc',
      root: [`./${SRC_DIR}`],
      extensions: EXTENSIONS_WITH_DOT
    }]
  ],
  comments: false,
  compact: false,
  sourceType: 'unambiguous'
};
