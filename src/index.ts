/* eslint-disable unicorn/prefer-export-from */

import nr from './config/nr';
import * as vite from './config/vite';
import { EXTENSIONS } from './etc/constants';
import { getPackageContext } from './lib/utils';

// This approach, rather than "export from" syntax, ensures TypeScript compiles
// our code such that named imports in ESM consumers work as expected.
export {
  nr,
  vite,
  getPackageContext,
  EXTENSIONS
};
