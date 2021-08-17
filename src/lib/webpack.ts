import path from 'path';

import parseEnv from '@darkobits/env';
import { getPackageInfo, PkgInfo } from '@darkobits/ts/lib/utils';
import bytes from 'bytes';
import fs from 'fs-extra';
import ms from 'ms';
import webpack from 'webpack';
import merge from 'webpack-merge';

import {
  NativeWebpackConfigurationFactory,
  WebpackConfiguration,
  WebpackConfigurationFactory,
  WebpackConfigurationFactoryContext
} from 'etc/types';
import log from 'lib/log';


/**
 * @private
 *
 * Utility that generates a base Webpack configuration scaffold with certain
 * common keys/paths pre-defined (and typed as such), reducing the amount of
 * boilerplate the user has to write.
 *
 * For example, when adding a loader, the user need not initialize 'module' and
 * 'rules', they can simply write config.module.rules.push(<loader config>).
 */
function generateWebpackConfigurationScaffold(): WebpackConfiguration {
  return {
    entry: {},
    output: {},
    module: {
      rules: []
    },
    plugins: [],
    optimization: {}
  };
}


/**
 * Provided a module context (re: directory), scans downward from the first
 * directory beneath node_modules until a package.json is found. This algorithm
 * is better suited to loading the correct package.json for a packages with
 * nested package.json files.
 */
export function getPackageManifest(moduleContext: string) {
  const search = 'node_modules';
  const searchSegment = moduleContext.indexOf('node_modules');
  const basePath = moduleContext.slice(0, searchSegment + search.length);
  const searchSegments = moduleContext.slice(searchSegment + search.length).split('/').filter(Boolean);

  for (let i = 1; i <= searchSegments.length; i++) {
    const curPath = path.join(basePath, ...searchSegments.slice(0, i), 'package.json');

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const manifest: PkgInfo['json'] = require(curPath);

      if (manifest) {
        return manifest;
      }
    } catch {
      // No package.json at this path.
    }
  }
}


/**
 * Ensures that the provided Webpack configuration has a readable file at
 * `entry.index`. If one is not set, attempts to use the "main" field from the
 * host project's package.json.
 */
export async function ensureIndexEntrypoint(config: webpack.Configuration, pkg: PkgInfo) {
  let indexEntry: string | undefined;

  if (typeof config.entry === 'object') {
    // @ts-expect-error
    const entryPath = config.entry.index;

    if (typeof entryPath === 'string') {
      log.silly(log.prefix('ensureIndexEntrypoint'), `Using index entry from config: ${log.chalk.green(entryPath)}`);
      indexEntry = entryPath;
    } else {
      log.silly(log.prefix('ensureIndexEntrypoint'), 'Configuration path "entry.index" is not a string.');
    }
  } else {
    log.silly(log.prefix('ensureIndexEntrypoint'), 'Configuration path "entry" is not an object.');
  }

  if (typeof pkg.json?.main === 'string') {
    log.silly(log.prefix('ensureIndexEntrypoint'), `Using index entry from package.json: ${log.chalk.green(pkg.json.main)}`);
    indexEntry = path.resolve(pkg.rootDir, pkg.json.main);
  }

  if (!indexEntry) {
    throw new Error('Unable to determine entrypoint. Set "entry.index" in your Webpack configuration or "main" in package.json.');
  }

  try {
    await fs.access(indexEntry);
    log.verbose(log.prefix('ensureIndexEntrypoint'), `Using index entrypoint: ${log.chalk.green(indexEntry)}`);
    return indexEntry;
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.warn(log.prefix('ensureIndexEntrypoint'), `Entrypoint ${log.chalk.green(indexEntry)} does not exist.`);
    }

    throw err;
  }
}


/**
 * @private
 *
 * Provided a Webpack configuration object, returns a function that accepts a
 * plugin name and configuration object. The function then finds the plugin and
 * merges the provided configuration object with the plugin's existing
 * configuration.
 */
function reconfigurePlugin(config: webpack.Configuration) {
  return (pluginName: string, pluginConfig: any) => {
    const pluginInstance = config.plugins?.find(p => p?.constructor?.name === pluginName);

    if (!pluginInstance) {
      throw new Error(`${log.prefix('reconfigurePlugin')} Configuration does not contain an instance of plugin ${log.chalk.yellow(pluginName)}.`);
    }

    if (Reflect.has(pluginInstance, 'options')) {
      Reflect.set(pluginInstance, 'options', merge(Reflect.get(pluginInstance, 'options'), pluginConfig));
      log.verbose(log.prefix('reconfigurePlugin'), `Reconfigured ${log.chalk.yellow(pluginName)}:`, Reflect.get(pluginInstance, 'options'));
    } else if (Reflect.has(pluginInstance, 'userOptions')) {
      Reflect.set(pluginInstance, 'userOptions', merge(Reflect.get(pluginInstance, 'userOptions'), pluginConfig));
      log.verbose(log.prefix('reconfigurePlugin'), `Reconfigured ${log.chalk.yellow(pluginName)}:`, Reflect.get(pluginInstance, 'userOptions'));
    } else {
      throw new Error(`${log.prefix('reconfigurePlugin')} Plugin ${log.chalk.yellow(pluginName)} lacks "options" and "userOptions" properties.`);
    }
  };
}


/**
 * Function that accepts a "base" 'tsx' Webpack configuration factory and
 * returns a function that accepts a user-provided 'tsx' Webpack configuration
 * factory, then returns a 'standard' Webpack configuration factory that will be
 * passed to Webpack.
 */
export function createWebpackConfigurationPreset(baseConfigFactory: WebpackConfigurationFactory, postConfigFactory?: WebpackConfigurationFactory) {
  return (userConfigFactory?: WebpackConfigurationFactory): NativeWebpackConfigurationFactory => async (env, argv = {}) => {
    // ----- Build Context -----------------------------------------------------

    // Get host package metadata.
    const pkg = getPackageInfo();

    const context: Omit<WebpackConfigurationFactoryContext, 'config' | 'reconfigurePlugin'> = {
      env,
      argv,
      pkg,
      bytes,
      ms,
      isProduction: argv.mode === 'production',
      isDevelopment: argv.mode === 'development',
      isDevServer: parseEnv.has('WEBPACK_DEV_SERVER'),
      merge,
      webpack
    };


    // ----- Generate Base Configuration ---------------------------------------

    const baseConfigScaffold = generateWebpackConfigurationScaffold();

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


    // ----- Update "Mode" -----------------------------------------------------

    // In certain cases, argv.mode may not be set, so if the base configuration
    // set config.mode, set argv.mode to the same value and update predicates in
    // our context object. This will ensure things "just work" in the user's
    // configuration factory.
    if (argv.mode === undefined && baseConfig.mode) {
      // eslint-disable-next-line require-atomic-updates
      argv.mode = baseConfig.mode;
      context.isProduction = argv.mode === 'production';
      context.isDevelopment = argv.mode === 'development';
      log.silly(log.prefix('webpack'), `Set ${log.chalk.bold('argv.mode')} to ${log.chalk.bold('config.mode')} from base configuration: ${baseConfig.mode}`);
    }


    // ----- Generate User Configuration ---------------------------------------

    // N.B. If the user only wants to use the base configuration, they may
    // invoke thus function without any arguments.
    if (!userConfigFactory) {
      return baseConfig;
    }

    const returnedUserConfig = await userConfigFactory({
      ...context,
      config: baseConfig,
      reconfigurePlugin: reconfigurePlugin(baseConfig)
    });

    // If the factory did not return a value, defer to the baseConfig object we
    // passed-in and modified in-place.
    let finalConfig = returnedUserConfig ?? baseConfig;


    // ----- Apply Post-User Config --------------------------------------------

    if (typeof postConfigFactory === 'function') {
      const returnedPostConfig = await postConfigFactory({
        ...context,
        config: finalConfig,
        reconfigurePlugin: reconfigurePlugin(finalConfig)
      });

      finalConfig = returnedPostConfig ?? finalConfig;
    }

    // ----- Issue Warnings ----------------------------------------------------

    // Warn if config.entry.index does not exist.
    // finalConfig.entry.index = await ensureIndexEntrypoint(finalConfig, pkg);

    return finalConfig;
  };
}
