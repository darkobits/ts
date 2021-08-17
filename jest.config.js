import { jest } from './src';

export default jest({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/bin',
    '<rootDir>/src/config',
    '<rootDir>/src/etc',
    '<rootDir>/src/index'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 45,
      functions: 60,
      lines: 50
    }
  }
});
