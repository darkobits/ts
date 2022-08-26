import merge from 'deepmerge';

import { EXTENSIONS, SRC_DIR, OUT_DIR } from 'etc/constants';

import type { Config } from '@jest/types';

// Strip leading . from extensions.
const bareExtensions = EXTENSIONS.map(ext => ext.replace(/^\./, ''));

// Paths we always want Jest to ignore.
const ignorePatterns = [
  '/node_modules/',
  `<rootDir>/${OUT_DIR}`
];


// Note: Having this function return `any` prevents a TS9006 declaration emit
// error for consumers because Config.InitialOptions uses a private type.
// However, we can still use it to type our config parameter to provide
// type safety to consumers.
export default (userConfig: Config.InitialOptions = {}) => merge<any>({
  // The new default test runner is jest-circus, but its currently unstable.
  // Revisit removing this and using jest-circus when it is more stable.
  testRunner: 'jest-jasmine2',
  testEnvironment: 'node',
  testMatch: [
    `<rootDir>/${SRC_DIR}/**/*.spec.*`
  ],
  collectCoverageFrom: [
    `<rootDir>/${SRC_DIR}/**/*.{${[...bareExtensions, 'node'].join(',')}}`,
    '!**/node_modules/**'
  ],
  testPathIgnorePatterns: ignorePatterns,
  coveragePathIgnorePatterns: ignorePatterns,
  clearMocks: true,
  moduleFileExtensions: bareExtensions,
  // Exit without error if Jest could not find any test files to run.
  passWithNoTests: true,
  // Watchman started causing issues with M1 / Monterey. This dependency is
  // difficult to debug, and disabling it does not seem to entail performance
  // degradations for small/medium projects.
  watchman: false,
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}, userConfig);
