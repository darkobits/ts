import path from 'path';

import fs from 'fs-extra';

import { WebpackConfiguration } from 'etc/types';
import log from 'lib/log';


/**
 * [webpack]
 *
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
 * [webpack]
 *
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
 * [webpack]
 *
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
 * Returns a short description of the current Git commit using 'git describe'.
 *
 * Example: "v0.12.7-17-g9d2f0dc"
 */
export function gitDescribe() {
  const git = chex.sync('git');
  const result = git(['describe', '--tags']).stdout;
  log.verbose(log.prefix('gitDescribe'), `Current Git description: ${log.chalk.green(result)}`);
  return result;
}

