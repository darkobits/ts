/**
 * N.B. This file must only use CJS syntax and relative require() paths, as it
 * is used by our Babel configuration file.
 */

/**
 * Directory where source files are located.
 */
const SRC_DIR = 'src';


/**
 * Directory where build artifacts will be created.
 */
const OUT_DIR = 'dist';


/**
 * List of common file extensions we want tools to work with.
 */
const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'];


/**
 * Above list mapped such that each extension begins with a dot, as is required
 * by some tooling.
 */
const EXTENSIONS_WITH_DOT = EXTENSIONS.map(ext => `.${ext}`);


module.exports = {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS,
  EXTENSIONS_WITH_DOT
};
