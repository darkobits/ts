require('./src/etc/babel-register');

module.exports = {
  extends: require('./src').eslint,
  rules: {
    '@typescript-eslint/no-var-requires': 'off'
  }
};
