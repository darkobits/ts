module.exports = {
  extends: require('@darkobits/ts').babel,
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'entry',
      corejs: 3
    }],
    require.resolve('linaria/babel')
  ],
  plugins: [
    require.resolve('react-hot-loader/babel')
  ]
};
