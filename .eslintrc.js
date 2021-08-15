module.exports = {
  extends: 'plugin:@darkobits/ts',
  rules: {
    '@typescript-eslint/indent': ['error', 2, {
      ignoredNodes: ['ConditionalExpression']
    }]
  }
};
