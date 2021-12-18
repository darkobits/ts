import path from 'path';

import { getPackageInfo } from '@darkobits/ts/lib/utils';
import bytes from 'bytes';
import merge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import mem from 'mem';
import ms from 'ms';
import readPkg from 'read-pkg';
import inspect from 'vite-plugin-inspect';

import {
  ViteConfiguration,
  ViteConfigurationFactory,
  ViteConfigurationFnContext
} from 'etc/types';
import log from 'lib/log';

import type { UserConfigFn } from 'vite';

/**
 * @private
 *
 * Utility that generates a base Vite configuration scaffold with certain common
 * keys/paths pre-defined (and typed as such), reducing the amount of
 * boilerplate the user has to write.
 */
function generateViteConfigurationScaffold(): ViteConfiguration {
  return {
    build: {},
    plugins: [],
    resolve: {},
    server: {}
  };
}


/**
 * Provided a path like /foo/bar/baz/node_modules/qux/pkg, searches for a
 * package.json file at the directory immediately beneath node_modules,
 * proceeding downward until one is found.
 */
export const getPackageManifest = mem((id: string) => {
  const search = 'node_modules';
  const searchSegment = id.indexOf('node_modules');
  const basePath = id.slice(0, searchSegment + search.length);
  const searchSegments = id.slice(searchSegment + search.length).split('/').filter(Boolean);

  for (let i = 1; i <= searchSegments.length; i++) {
    const curPath = path.join(basePath, ...searchSegments.slice(0, i));

    try {
      return readPkg.sync({ cwd: curPath });
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // No package.json at this path.
        continue;
      }

      throw err;
    }
  }
});


/**
 * @private
 *
 * Provided a Vite configuration object, returns a function that accepts a
 * plugin name and configuration object. The function then finds the plugin and
 * merges the provided configuration object with the plugin's existing
 * configuration.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reconfigurePlugin(config: ViteConfiguration) {
  // TODO(joshua): Re-implement this.
  return (pluginName: string, pluginConfig: any) => {
    log.info(log.prefix('reconfigurePlugin'), pluginName, pluginConfig);
  };
}


/**
 * Function that accepts a "base" 'tsx' Webpack configuration factory and
 * returns a function that accepts a user-provided 'tsx' Webpack configuration
 * factory, then returns a 'standard' Webpack configuration factory that will be
 * passed to Webpack.
 */
export const createViteConfigurationPreset = (
  baseConfigFactory: ViteConfigurationFactory
) => (
  userConfigFactory?: ViteConfigurationFactory
): UserConfigFn => async ({ command, mode }) => {
  // Get host package metadata.
  const pkg = getPackageInfo();

  const context: Omit<ViteConfigurationFnContext, 'config' | 'reconfigurePlugin'> = {
    command,
    mode,
    pkg,
    bytes,
    ms,
    isProduction: mode === 'production',
    isDevelopment: mode === 'development',
    isDevServer: command === 'serve',
    merge
  };


  // ----- Generate Base Configuration -----------------------------------------

  const baseConfigScaffold = generateViteConfigurationScaffold();

  // Invoke base config factory passing all primitives from our context plus a
  // reference to our base config scaffold and a plugin re-configurator.
  const returnedBaseConfig = await baseConfigFactory({
    ...context,
    config: baseConfigScaffold,
    reconfigurePlugin: reconfigurePlugin(baseConfigScaffold)
  });

  // If the factory did not return a value, defer to the config object we
  // passed-in and modified in-place.
  const baseConfig = returnedBaseConfig ?? baseConfigScaffold;


  // ----- Generate User Configuration -----------------------------------------

  // N.B. If the user only wants to use the base configuration, they may
  // invoke thus function without any arguments.
  if (!userConfigFactory) {
    return baseConfig;
  }

  const userConfigScaffold = generateViteConfigurationScaffold();

  const returnedUserConfig = await userConfigFactory({
    ...context,
    config: userConfigScaffold,
    reconfigurePlugin: reconfigurePlugin(baseConfig)
  });

  // If the factory did not return a value, defer to the baseConfig object we
  // passed-in and modified in-place.
  const userConfig = returnedUserConfig ?? userConfigScaffold;


  // ----- Merge Configurations ------------------------------------------------

  const finalConfig = merge(baseConfig, userConfig, {
    customMerge: (key: string) => (a: any, b: any) => {
      if (key === 'plugins') {
        return [...a, ...b];
      }

      if (isPlainObject(a) && isPlainObject(b)) {
        return {...a, ...b};
      }

      if (Array.isArray(a) || Array.isArray(b)) {
        log.warn(`[${key}] Encountered arrays:`, a, b);
        return b;
      }

      log.warn(`[${key}] Encountered unknown:`, a, b);

      return a;
    }
  });

  if (finalConfig.inspect) {
    finalConfig.plugins.push(inspect());
    log.info(log.prefix('inspect'), `${log.chalk.bold('"vite-plugin-inspect"')} added to compilation.`);
  }

  return finalConfig;
};
