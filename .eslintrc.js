require('./src/etc/babel-register');

module.exports = {
  extends: './src/config/eslint',
  rules: {
    '@typescript-eslint/no-var-requires': 'off'
  }
};
