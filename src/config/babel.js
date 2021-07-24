// -----------------------------------------------------------------------------
// ----- Babel Configuration ---------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {
  extends: require('@darkobits/ts').babel,
  presets: [
    [require.resolve('@babel/preset-env'), {
      useBuiltIns: 'entry',
      corejs: 3
    }],
    require.resolve('@babel/preset-react'),
    require.resolve('@linaria/babel-preset')
  ],
  plugins: [
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('react-hot-loader/babel')
  ],
  // This is set to `true`, inverting the default setting from 'ts') to prevent
  // Babel from stripping-out Webpack 'magic' comments before Webpack can parse
  // them. Comments will then be removed by Webpack's minifier.
  comments: true
};
