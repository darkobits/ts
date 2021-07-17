// ----- Miscellaneous ---------------------------------------------------------

/**
 * Parsed value of the "npm_config_argv" environment variable present when a
 * process is run as part of an NPM lifecycle.
 */
export interface NpmConfigArgv {
  original: Array<string>;
  cooked: Array<string>;
  remain: Array<string>;
}
