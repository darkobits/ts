/**
 * Function that accepts an optional user-defined Jest configuration object and
 * merges it with the base Jest configuration.
 */
export const jest = require('@darkobits/ts').jest;


/**
 * Path to base Babel configuration.
 */
export const babel = require.resolve('config/babel');


/**
 * Function that accepts an optional user-defined NPS configuration object and
 * merges it with the base NPS configuration.
 */
export const nps = require('config/package-scripts');


/**
 * Function that accepts an optional user-defined Webpack configuration factory
 * and merges it with the base Webpack configuration.
 */
export const webpack = require('config/webpack');


/**
 * Path to base ESLint rules for Rect projects.
 */
export const eslint = require.resolve('config/eslint');


// N.B. tsconfig.json must be imported using its full path because TSC's
// "extends" only supports paths.
