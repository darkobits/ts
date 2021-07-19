/**
 * N.B. This file must only use CJS syntax and relative require() paths, as it
 * is used by our Babel configuration file.
 */

/**
 * Directory where source files are located.
 */
export const SRC_DIR = 'src';


/**
 * Directory where build artifacts will be created.
 */
export const OUT_DIR = 'dist';


/**
 * List of common file extensions we want tools to work with.
 */
export const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'];


/**
 * Above list mapped such that each extension begins with a dot, as is required
 * by some tooling.
 */
export const EXTENSIONS_WITH_DOT = EXTENSIONS.map(ext => `.${ext}`);


export default {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS,
  EXTENSIONS_WITH_DOT
};
