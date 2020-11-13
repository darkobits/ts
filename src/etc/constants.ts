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
export const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'node'];


/**
 * Above list mapped such that each extension begins with a dot, as is required
 * by some tooling.
 */
export const EXTENSIONS_WITH_DOT = EXTENSIONS.map(ext => `.${ext}`);
