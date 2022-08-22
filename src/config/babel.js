const { EXTENSIONS, SRC_DIR } = require('../etc/constants');

const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '16' },
      modules: 'cjs',
      // Do not transpile import() statements. This will allow packages that
      // publish CommonJS to import ES Modules.
      exclude: NODE_ENV === 'test'
        // When testing with Jest, however, we still need to transform dynamic
        // imports into require() statements.
        ? []
        : ['@babel/plugin-proposal-dynamic-import']
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
      extensions: EXTENSIONS
    }]
  ],
  comments: false,
  compact: false,
  sourceType: 'unambiguous'
};
