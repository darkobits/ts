// N.B. `module.exports` must be used in this file because it configures Babel,
// which lets us use `export default` in all other files.
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: [
        'node 12'
      ]
    }],
    '@babel/preset-typescript',
    '@babel/preset-react'
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
      extensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json'
      ]
    }]
  ],
  // N.B. This is set to `false` to prevent Babel from stripping-out Webpack
  // 'magic' comments before Webpack can parse them.
  comments: false
};
