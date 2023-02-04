/**
 * List of common file extensions we want tools to work with.
 */
export const EXTENSIONS_PLAIN = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'cts'];


/**
 * List of common file extensions we want tools to work with, with leading
 * periods.
 */
export const EXTENSIONS = EXTENSIONS_PLAIN.map(ext => `.${ext}`);
