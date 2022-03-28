module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '16' },
      // Transpile to CommonJS when testing with Jest, as it still has
      // lackluster support for native ESM, especially when used with TypeScript
      // source files.
      modules: process.env.NODE_ENV === 'test' ? 'cjs' : false,
      exclude: ['@babel/plugin-proposal-dynamic-import']
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    'babel-plugin-add-module-exports',
    ['@babel/plugin-proposal-decorators', {
      legacy: true,
      loose: true
    }],
    ['babel-plugin-module-resolver', {
      cwd: 'babelrc',
      root: ['./src'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
    }]
  ],
  comments: false,
  compact: false,
  sourceType: 'unambiguous'
};
