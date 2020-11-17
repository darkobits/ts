require('./src/etc/babel-register');

module.exports = {
  extends: [
    './src/config/eslint'
  ],
  rules: {
    'unicorn/no-reduce': 'off'
  }
}
