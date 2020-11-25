module.exports = {
  extends: require('@darkobits/ts').babel,
  presets: [
    [require.resolve('@babel/preset-env'), {
      useBuiltIns: 'entry',
      corejs: 3
    }],
    require.resolve('linaria/babel'),
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('react-hot-loader/babel')
  ]
};
