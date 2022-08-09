import type { NormalizedPackageJson } from 'read-pkg-up';


/**
 * Parsed value of the "npm_config_argv" environment variable present when a
 * process is run as part of an NPM lifecycle.
 */
export interface NpmConfigArgv {
  original: Array<string>;
  cooked: Array<string>;
  remain: Array<string>;
}


/**
 * Recursively gets the value of key 'default' in the provided object until the
 * value is not itself an object containing the key 'default'.
 */
export type GetDefault<T extends Record<string, any>> = T extends { default: { default: any } }
 ? GetDefault<T['default']>
 : T['default'];


/**
 * Similar to the return type of read-pkg-up, but returns the package's root
 * directory instead of the full path to its package.json.
 */
export interface PkgInfo {
  json: NormalizedPackageJson;
  rootDir: string;
}
