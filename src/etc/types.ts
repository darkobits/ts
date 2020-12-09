import type { getPackageInfo } from '@darkobits/ts/lib/utils';
import type bytes from 'bytes';
import type ms from 'ms';
import type webpack from 'webpack';
import type merge from 'webpack-merge';


/**
 * Webpack configuration's "modules" key where the "rules" array is required
 * rather than optional.
 */
export interface WebpackModuleConfiguration extends webpack.Module {
  rules: Array<webpack.RuleSetRule>;
}


/**
 * Webpack configuration object where `module.rules` and `plugins` are required
 * rather than optional.
 */
export interface WebpackConfiguration extends webpack.Configuration {
  module: WebpackModuleConfiguration;
  plugins: Array<webpack.Plugin>;
}


/**
 * First parameter passed to standard Webpack configuration factories.
 */
type Env = Parameters<webpack.ConfigurationFactory>[0];


/**
 * Second parameter passed to standard Webpack configuration factories.
 */
type Argv = Parameters<webpack.ConfigurationFactory>[1];


/**
 * Object passed to 'tsx' Webpack configuration factories.
 */
export interface WebpackConfigurationFactoryContext {
  env: Env;
  argv: Argv;

  /**
   * Normalized package.json for the project. Useful for extracting version
   * information and other metadata to include in build artifacts.
   */
  pkgJson: ReturnType<typeof getPackageInfo>['json'];

  /**
   * Resolved path to the project root (containing package.json). Useful for
   * defining various Webpack input/output paths without having to use __dirname
   * or relative paths.
   */
  pkgRoot: string;

  /**
   * Empty Webpack configuration scaffold that the configuration factory may
   * modify and return.
   */
  config: WebpackConfiguration;

  /**
   * Utility to parse a human readable string (ex: '512kb') to bytes (524288)
   * and vice-versa. Useful for specifying configuration options that expect
   * a number in bytes.
   *
   * See: https://github.com/visionmedia/bytes.js
   */
  bytes: typeof bytes;

  /**
   * Utility for converting a human readable string (ex: '2h') to milliseconds
   * (7200000). Useful for specifying configuration options that expect an
   * amount of time in milliseconds.
   *
   * See: https://github.com/vercel/ms
   */
  ms: typeof ms;

  /**
   * Utility for recursively merging objects.
   *
   * See: https://github.com/survivejs/webpack-merge
   */
  merge: typeof merge;

  /**
   * True if argv.mode equals 'production'.
   */
  isProduction: boolean;

  /**
   * True if argv.mode equals 'development';
   */
  isDevelopment: boolean;
}


/**
 * Signature of a 'tsx' Webpack configuration factory.
 */
export type WebpackConfigurationFactory = (
  opts: WebpackConfigurationFactoryContext
) => void | WebpackConfiguration | Promise<void | WebpackConfiguration>;
