import path from 'path';

import { getPackageInfo } from '@darkobits/ts/lib/utils';
import bytes from 'bytes';
import fs from 'fs-extra';
import ms from 'ms';
import webpack from 'webpack';
import merge from 'webpack-merge';

import { WebpackConfiguration, WebpackConfigurationFactory } from 'etc/types';
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
 * Ensures there is an index.tsx file at the expected path. Creates one if it
 * doesn't exist.
 */
export function ensureIndexEntrypoint(pkgRoot: string) {
  const indexEntrypoint = path.resolve(pkgRoot, 'src', 'index.tsx');

  try {
    fs.accessSync(indexEntrypoint);
    log.verbose(`Using entrypoint: ${log.chalk.green(indexEntrypoint)}`);
    return indexEntrypoint;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  try {
    const indexEntrypointTemplate = require.resolve('etc/index-template.txt');
    fs.ensureDirSync(path.dirname(indexEntrypoint));
    fs.copyFileSync(indexEntrypointTemplate, indexEntrypoint);
    log.info(log.prefix('webpack'), `Created entrypoint at: ${log.chalk.green(indexEntrypoint)}`);
    return indexEntrypoint;
  } catch (err) {
    log.error(log.prefix('webpack'), `Error creating entrypoint at ${log.chalk.green(indexEntrypoint)}: ${err.message}`);
    throw err;
  }
}


/**
 * Ensures there is an index.html file at the expected path. Creates one if it
 * doesn't exist.
 */
export function ensureIndexHtml(pkgRoot: string) {
  const indexHtml = path.resolve(pkgRoot, 'src', 'index.html');

  try {
    fs.accessSync(indexHtml);
    log.verbose(`Using index.html at: ${log.chalk.green(indexHtml)}`);
    return indexHtml;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  try {
    const indexHtmlTemplate = require.resolve('etc/index-template.html');
    fs.ensureDirSync(path.dirname(indexHtml));
    fs.copyFileSync(indexHtmlTemplate, indexHtml);
    log.info(log.prefix('webpack'), `Created index.html at: ${log.chalk.green(indexHtml)}`);
    return indexHtml;
  } catch (err) {
    log.error(log.prefix('webpack'), `Error creating index.html at ${log.chalk.green(indexHtml)}: ${err.message}`);
    throw err;
  }
}


/**
 * Function that accepts a "base" 'tsx' Webpack configuration factory and
 * returns a function that accepts a user-provided 'tsx' Webpack configuration
 * factory, then returns a 'standard' Webpack configuration factory that will be
 * passed to Webpack.
 */
export function createWebpackConfigurationPreset(baseConfigFactory: WebpackConfigurationFactory) {
  return (userConfigFactory: WebpackConfigurationFactory): webpack.ConfigurationFactory => async (env, argv = {}) => {
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
