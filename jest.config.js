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
      statements: 32,
      branches: 22,
      functions: 45,
      lines: 32
    }
  }
});
