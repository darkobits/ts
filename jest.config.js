require('./src/etc/babel-register');

module.exports = require('./src/config/jest')({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/bin',
    '<rootDir>/src/config',
    '<rootDir>/src/etc'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      lines: 80
    }
  }
});
