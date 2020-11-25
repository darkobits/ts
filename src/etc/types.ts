import type webpack from 'webpack';
import type { getPackageInfo } from '@darkobits/ts/lib/utils';


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
export interface WebpackConfigurationFactoryOptions {
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
}


/**
 * Signature of a 'tsx' Webpack configuration factory.
 */
export type WebpackConfigurationFactory = (opts: WebpackConfigurationFactoryOptions) => webpack.Configuration;
