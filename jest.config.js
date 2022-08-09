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
      statements: 25,
      branches: 20,
      functions: 40,
      lines: 25
    }
  }
});
