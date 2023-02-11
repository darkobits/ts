/* eslint-disable unicorn/prefer-export-from */
import nr from './config/nr';
import vitest from './config/vitest';
import { EXTENSIONS } from './etc/constants';
import { getSourceAndOutputDirectories } from './lib/utils';

// This approach, rather than "export from" syntax, ensures TypeScript compiles
// our code such that named imports in ESM consumers work as expected.
export {
  nr,
  vitest,
  getSourceAndOutputDirectories,
  EXTENSIONS
};
