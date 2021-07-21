const { resolvePath } = require('babel-plugin-module-resolver');

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      },
      modules: false
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
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
      stripExtensions: [],
      resolvePath: (sourcePath, currentFile, opts) => {
        const resolvedPath = resolvePath(sourcePath, currentFile, opts);

        if (typeof resolvedPath === 'string') {
          return resolvedPath.replace(/\.\w{2}$/g, '.js');
        }
      }
    }]
  ],
  // Strip comments from transpiled code.
  comments: false,
  sourceType: 'unambiguous'
};
