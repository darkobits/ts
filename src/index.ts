/**
 * Path to base Babel configuration.
 */
export const babel = require.resolve('config/babel');


/**
 * Path to base ESLint rules for non-React projects.
 */
export const eslint = require.resolve('config/eslint');


/**
 * Path to base ESLint rules for Rect projects.
 */
export const eslintReact = require.resolve('config/eslint-react');


/**
 * Function that accepts an optional user-defined Jest configuration object and
 * merges it with the base Jest configuration.
 */
export const jest = require('config/jest');


/**
 * Function that accepts an optional user-defined NPS configuration object and
 * merges it with the base NPS configuration.
 */
export const nps = require('config/package-scripts');


// N.B. tsconfig.json must be imported using its full path because TSC's
// "extends" only supports paths.
