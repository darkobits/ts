import { getPackageInfo } from '@darkobits/ts/lib/utils';
import bytes from 'bytes';
import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ms from 'ms';
import webpack from 'webpack';
import merge from 'webpack-merge';

import {
  WebpackConfiguration,
  WebpackConfigurationFactory
} from 'etc/types';
import log from 'lib/log';


/**
 * Utility that generates a base Webpack configuration scaffold with certain
 * common keys/paths pre-defined (and typed as such), reducing the amount of
 * boilerplate the user has to write.
 *
 * For example, when adding a loader, the user need not initialize 'module' and
 * 'rules', they can simply write config.module.rules.push(<loader config>).
 */
export function generateWebpackConfigurationScaffold() {
  const config: any = {};
  config.module = {rules: []};
  config.plugins = [];
  return config as WebpackConfiguration;
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
    if (err.code !== 'ENOENT') {
      log.warn(log.prefix('ensureIndexEntrypoint'), `Index entrypoint ${log.chalk.green(entryPath)} does not exist.`);
      throw err;
    }
  }
}


/**
 * @private
 *
 * If the provided Webpack configuration uses HtmlWebpackPlugin, ensures that
 * the "template" option points to a file that exists.
 */
async function ensureIndexHtml(config: webpack.Configuration) {
  const htmlWebpackPluginInstance = config.plugins?.find(plugin => {
    return plugin instanceof HtmlWebpackPlugin;
  });

  if (!htmlWebpackPluginInstance) {
    log.verbose(log.prefix('ensureIndexHtml'), 'Configuration does not use HtmlWebpackPlugin.');
    return;
  }

  // @ts-expect-error: 'options' is not typed.
  const templatePath = htmlWebpackPluginInstance.options.template;

  try {
    await fs.access(templatePath);
    log.verbose(log.prefix('ensureIndexHtml'), `Using template at: ${log.chalk.green(templatePath)}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log.warn(log.prefix('ensureIndexHtml'), `Index template ${log.chalk.green(templatePath)} does not exist.`);
      throw err;
    }
  }
}


/**
 * Function that accepts a "base" 'tsx' Webpack configuration factory and
 * returns a function that accepts a user-provided 'tsx' Webpack configuration
 * factory, then returns a 'standard' Webpack configuration factory that will be
 * passed to Webpack.
 */
export function createWebpackConfigurationPreset(baseConfigFactory: WebpackConfigurationFactory) {
  return (userConfigFactory?: WebpackConfigurationFactory): webpack.ConfigurationFactory => async (env, argv = {}) => {
    // ----- Build Context -----------------------------------------------------

    // Get host package metadata.
    const pkg = getPackageInfo();

    const context = {
      env,
      argv,
      pkgJson: pkg.json,
      pkgRoot: pkg.rootDir,
      bytes,
      ms,
      isProduction: argv.mode === 'production',
      isDevelopment: argv.mode === 'development'
    };


    // ----- Generate Base Configuration ---------------------------------------

    const baseConfigScaffold = generateWebpackConfigurationScaffold();

    const returnedBaseConfig = await baseConfigFactory({
      ...context,
      config: baseConfigScaffold
    });

    // If the factory did not return a value, defer to the config object we
    // passed-in.
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

    const userConfigScaffold = generateWebpackConfigurationScaffold();

    const returnedUserConfig = await userConfigFactory({
      ...context,
      config: userConfigScaffold
    });

    const userConfig = returnedUserConfig || userConfigScaffold;

    // Merge and return the two configurations.
    return merge(baseConfig, userConfig);
  };
}
