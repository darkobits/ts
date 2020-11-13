import merge from 'deepmerge';
import {EXTENSIONS, SRC_DIR, OUT_DIR} from 'etc/constants';


// Paths we always want Jest to ignore.
const ALWAYS_IGNORE = [
  '/node_modules/',
  `<rootDir>/${OUT_DIR}`
];


export default (userConfig = {}) => merge({
  testEnvironment: 'node',
  testRegex: '^.+\\.spec.*$',
  testPathIgnorePatterns: ALWAYS_IGNORE,
  clearMocks: true,
  collectCoverageFrom: [
    `<rootDir>/${SRC_DIR}/**/*.{${EXTENSIONS.join(',')}}`,
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: ALWAYS_IGNORE,
  moduleFileExtensions: [...EXTENSIONS, 'json'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}, userConfig);
