/**
 * List of patterns that will match test files.
 *
 * For example: foo.spec.ts, bar.spec.tsx.
 */
export const TEST_FILE_PATTERNS = [
  'spec',
  'test'
] as const

/**
 * List of common file extensions we want tools to work with.
 */
export const BARE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'] as const

/**
 * List of common file extensions we want tools to work with, with leading
 * periods.
 */
export const EXTENSIONS = BARE_EXTENSIONS.map(ext => `.${ext}`)