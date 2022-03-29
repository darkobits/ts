import jest from './src/config/jest';


export default jest({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/bin',
    '<rootDir>/src/config',
    '<rootDir>/src/etc',
    '<rootDir>/src/index'
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 20,
      functions: 45,
      lines: 35
    }
  }
});
