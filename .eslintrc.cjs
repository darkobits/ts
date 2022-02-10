module.exports = {
  extends: 'plugin:@darkobits/ts',
  rules: {
    'import/no-unresolved': ['error', {
      // This rule does not work well with certain ESM packages.
      ignore: ['mem']
    }]
  }
};
