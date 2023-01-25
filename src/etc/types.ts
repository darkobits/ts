import type { NormalizedPackageJson } from 'read-pkg-up';


/**
 * Similar to the return type of read-pkg-up, but returns the package's root
 * directory instead of the full path to its package.json.
 */
export interface PkgInfo {
  json: NormalizedPackageJson;
  rootDir: string;
}
