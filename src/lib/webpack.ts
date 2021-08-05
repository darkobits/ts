import { getPackageInfo } from '@darkobits/ts/lib/utils';
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
    plugins: []
  };
}


/**
 * @private
 *
 * Ensures there is an index.tsx file at the expected path. Creates one if it
 * doesn't exist.
 */
async function ensureIndexEntrypoint(config: webpack.Configuration) {
  if (typeof config.entry !== 'object') {
    log.verbose(log.prefix('ensureIndexEntrypoint'), 'Configuration path "entry" is not an object.');
    return;
  }

  // @ts-expect-error
  const entryPath = config.entry.index;

  if (typeof entryPath !== 'string') {
    log.verbose(log.prefix('ensureIndexEntrypoint'), 'Configuration path "entry.index" is not a string.');
    return;
  }

  try {
    await fs.access(entryPath);
    log.verbose(log.prefix('ensureIndexEntrypoint'), `Using index entrypoint at: ${log.chalk.green(entryPath)}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.warn(log.prefix('ensureIndexEntrypoint'), `Index entrypoint ${log.chalk.green(entryPath)} does not exist.`);
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
    const pluginInstance: any = config.plugins?.find(p => {
      return p?.constructor?.name === pluginName;
    });

    if (!pluginInstance) {
      throw new Error(`${log.prefix('reconfigurePlugin')} Configuration does not contain an instance of plugin ${log.chalk.yellow(pluginName)}.`);
    }

    pluginInstance.options = merge(pluginInstance.options, pluginConfig);
    log.verbose(log.prefix('reconfigurePlugin'), `Reconfigured ${log.chalk.yellow(pluginName)}:`, pluginInstance.options);
  };
}


/**
 * Function that accepts a "base" 'tsx' Webpack configuration factory and
 * returns a function that accepts a user-provided 'tsx' Webpack configuration
 * factory, then returns a 'standard' Webpack configuration factory that will be
 * passed to Webpack.
 */
export function createWebpackConfigurationPreset(baseConfigFactory: WebpackConfigurationFactory) {
  return (userConfigFactory?: WebpackConfigurationFactory): NativeWebpackConfigurationFactory => async (env, argv = {}) => {
    // ----- Build Context -----------------------------------------------------

    // Get host package metadata.
    const pkg = getPackageInfo();

    const context: Omit<WebpackConfigurationFactoryContext, 'config' | 'reconfigurePlugin'> = {
      env,
      argv,
      pkgJson: pkg.json,
      pkgRoot: pkg.rootDir,
      bytes,
      ms,
      isProduction: argv.mode === 'production',
      isDevelopment: argv.mode === 'development',
      merge,
      webpack
    };


    // ----- Generate Base Configuration ---------------------------------------

    const baseConfigScaffold = generateWebpackConfigurationScaffold();

    const returnedBaseConfig = await baseConfigFactory({
      ...context,
      config: baseConfigScaffold,
      reconfigurePlugin: reconfigurePlugin(baseConfigScaffold)
    });

    // If the factory did not return a value, defer to the config object we
    // passed-in and modified in-place.
    const baseConfig = returnedBaseConfig || baseConfigScaffold;


    // ----- Update Mode -------------------------------------------------------

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

    // N.B. The user may invoke the configuration generator with no argument if
    // they do not need to modify the base configuration.
    if (!userConfigFactory) {
      return baseConfig;
    }

    const returnedUserConfig = await userConfigFactory({
      ...context,
      config: baseConfig,
      reconfigurePlugin: reconfigurePlugin(baseConfig)
    });

    // If the factory did not return a value, use the baseConfig object we
    // passed-in and modified in-place.
    const finalConfig = returnedUserConfig || baseConfig;


    // ----- Issue Warnings ----------------------------------------------------

    // Warn if config.entry.index does not exist.
    await ensureIndexEntrypoint(finalConfig);

    // Warn if HtmlWebpackPlugin was configured with a "template" that does not
    // exist.
    // await ensureIndexHtml(finalConfig);

    return finalConfig;
  };
}
