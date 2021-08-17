import { jest } from '@darkobits/ts';

export default jest({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/bin',
    '<rootDir>/src/config',
    '<rootDir>/src/etc',
    '<rootDir>/src/index',
    '<rootDir>/src/lib/log'
  ],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 10,
      functions: 20,
      lines: 20
    }
  }
});
