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
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];


module.exports = {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS
};
