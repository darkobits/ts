require('./src/etc/babel-register');

module.exports = {
  extends: require('./src').eslint,
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'max-len': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-abusive-eslint-disable': 'off'
  }
};
