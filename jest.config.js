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
      statements: 15,
      branches: 10,
      functions: 10,
      lines: 15
    }
  },
  transformIgnorePatterns: []
});
