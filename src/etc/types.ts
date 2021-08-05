import type { getPackageInfo } from '@darkobits/ts/lib/utils';
import type bytes from 'bytes';
import type ms from 'ms';
import type webpack from 'webpack';
import type merge from 'webpack-merge';


/**
 * Options affecting the normal modules (NormalModuleFactory).
 *
 * Note: `tsx` pre-declares this property, so its type definition is
 * non-nullable.
 */
export interface TsxModuleConfiguration extends webpack.ModuleOptions {
  rules: Array<webpack.RuleSetRule>;
}


/**
 * Webpack configuration object where `module.rules` and `plugins` are required
 * rather than optional.
 */
export interface WebpackConfiguration extends webpack.Configuration {
  /**
   * `tsx` uses the object form for `entry`. You may assign any property to this
   * object to create an additional bundle.
   */
  entry: webpack.EntryObject;

  /**
   * Options affecting the output of the compilation. output options tell
   * Webpack how to write the compiled files to disk.
   *
   * Note: `tsx` pre-declares this property, so its type definition is
   * non-nullable.
   */
  output: NonNullable<webpack.Configuration['output']>;

  module: TsxModuleConfiguration;

  /**
   * Add additional plugins to the compiler.
   *
   * Note: `tsx` pre-declares this property, so its type definition is
   * non-nullable.
   */
  plugins: NonNullable<webpack.Configuration['plugins']>;
}


/**
 * First parameter passed to standard Webpack configuration factories.
 */
type Env = Record<string, string>;


/**
 * Second parameter passed to standard Webpack configuration factories.
 */
type Argv = Record<string, any>;


/**
 * Formerly `ConfigurationFactory` in Webpack 4, but was removed in Webpack 5.
 */
export type NativeWebpackConfigurationFactory = (env: Env, argv: Argv) => webpack.Configuration | Promise<webpack.Configuration>;


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

  /**
   * Provides a declarative way to look-up and re-configure existing plugins.
   *
   * Provided a plugin name (according to its constructor.name property) and a
   * configuration object, merges the provided configuration with the plugin's
   * base configuration.
   *
   * @example
   *
   * // Change the default path to the application's index.html template.
   * reconfigurePlugin('HtmlWebpackPlugin', {
   *   template: path.resolve('foo', 'bar', 'template.html')
   * })
   */
  reconfigurePlugin: (pluginName: string, pluginConfiguration: any) => void;

  webpack: typeof webpack;
}


/**
 * Signature of a 'tsx' Webpack configuration factory.
 */
export type WebpackConfigurationFactory = (
  opts: WebpackConfigurationFactoryContext
) => void | WebpackConfiguration | Promise<void | WebpackConfiguration>;
