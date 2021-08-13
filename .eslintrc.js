module.exports = {
  extends: './src/config/eslint',
  overrides: [{
    files: ['*.test.*', '*.spec.*'],
    rules: {
      '@typescript-eslint/unbound-method': 'off'
    }
  }]
};
