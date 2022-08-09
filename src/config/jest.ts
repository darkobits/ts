import merge from 'deepmerge';

import { EXTENSIONS, SRC_DIR, OUT_DIR } from 'etc/constants';

import type { Config } from '@jest/types';


// Paths we always want Jest to ignore.
const ALWAYS_IGNORE = [
  '/node_modules/',
  `<rootDir>/${OUT_DIR}`
];


// Note: Having this function return `any` prevents a TS9006 declaration emit
// error for consumers because Config.InitialOptions uses a private type.
// However, we can still use it to type our config parameter to provide
// type safety to consumers.
export default (userConfig: Config.InitialOptions = {}) => merge<any>({
  testEnvironment: 'node',
  testMatch: [`<rootDir>/${SRC_DIR}/**/*.spec.*`],
  testPathIgnorePatterns: ALWAYS_IGNORE,
  clearMocks: true,
  collectCoverageFrom: [
    `<rootDir>/${SRC_DIR}/**/*.{${[...EXTENSIONS, 'node'].join(',')}}`,
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: ALWAYS_IGNORE,
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  moduleFileExtensions: EXTENSIONS,
  // Exit without error if Jest could not find any test files to run.
  passWithNoTests: true,
  // Watchman started causing issues with M1 / Monterey. This dependency is
  // difficult to debug, and disabling it does not seem to entail performance
  // degradations for small/medium projects.
  watchman: false
}, userConfig);
