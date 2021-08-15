
module.exports = api => {
  const target = api.caller(caller => caller && caller.target);

  // If compiling with Webpack and the 'target' has been set to 'node', use the
  // base preset only.
  if (target === 'node') {
    return {
      extends: require('@darkobits/ts').babel
    };
  }

  return {
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
    // This is set to `true`, inverting the default setting from 'ts') to
    // prevent Babel from stripping-out Webpack 'magic' comments before Webpack
    // can parse them. Comments will then be removed by Webpack's minifier.
    comments: true
  };
};
