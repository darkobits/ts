import merge from 'deepmerge';

import { EXTENSIONS, SRC_DIR, OUT_DIR } from 'etc/constants';

import type { Config } from '@jest/types';


// Paths we always want Jest to ignore.
const ALWAYS_IGNORE = [
  '/node_modules/',
  `<rootDir>/${OUT_DIR}`
];

export default (userConfig: Config.InitialOptions = {}) => merge({
  testEnvironment: 'node',
  testMatch: [`<rootDir>/${SRC_DIR}/**/*.spec.*`],
  testPathIgnorePatterns: ALWAYS_IGNORE,
  clearMocks: true,
  collectCoverageFrom: [
    `<rootDir>/${SRC_DIR}/**/*.{${[...EXTENSIONS, 'node'].join(',')}}`,
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: ALWAYS_IGNORE,
  moduleFileExtensions: EXTENSIONS,
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  // Watchman started causing issues with M1 / Monterey. This dependency is
  // difficult to debug, and disabling it does not seem to entail performance
  // degradations for small/medium projects.
  watchman: false
}, userConfig);
