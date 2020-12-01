module.exports = {
  extends: require('@darkobits/ts').eslint,
  rules: {
    // N.B. This package makes extensive use of require().
    '@typescript-eslint/no-var-requires': 'off'
  }
};
