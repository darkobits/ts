import type { getPackageInfo } from '@darkobits/ts/lib/utils';
import type bytes from 'bytes';
import type merge from 'deepmerge';
import type ms from 'ms';
import type { UserConfig } from 'vite';


export interface ViteConfiguration extends UserConfig {
  build: NonNullable<UserConfig['build']>;
  plugins: NonNullable<UserConfig['plugins']>;
  resolve: NonNullable<UserConfig['resolve']>;
  server: NonNullable<UserConfig['server']>;

  /**
   * Internal flag that, if true, will cause TSX to include
   * "vite-plugin-inspect" when starting the dev server.
   *
   * See: https://github.com/antfu/vite-plugin-inspect
   */
  inspect?: boolean;
}


/**
 * Object passed to 'tsx' Vite configuration factories.
 */
export interface ViteConfigurationFnContext {
  command: 'build' | 'serve';

  mode: string;

  /**
   * Normalized package.json and resolved root directory of the host project.
   */
  pkg: ReturnType<typeof getPackageInfo>;

  /**
   * Empty Vite configuration scaffold that the configuration factory may
   * modify and return.
   */
  config: ViteConfiguration;

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
   */
  merge: typeof merge;

  /**
   * True if mode === 'production'.
   */
  isProduction: boolean;

  /**
   * True if mode === 'development';
   */
  isDevelopment: boolean;

  /**
   * True if the compilation was started with the `serve` command.
   */
  isDevServer: boolean;

  /**
   * Provides a declarative way to look-up and re-configure existing plugins.
   *
   * Provided a plugin name and a configuration object, merges the provided
   * configuration with the plugin's base configuration.
   */
  reconfigurePlugin: (pluginName: string, pluginConfiguration: any) => void;
}


/**
 * Signature of a 'tsx' Vite configuration factory.
 */
export type ViteConfigurationFactory = (
  opts: ViteConfigurationFnContext
) => void | ViteConfiguration | Promise<void | ViteConfiguration>;
