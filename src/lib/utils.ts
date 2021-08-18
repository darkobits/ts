import path from 'path';

import env from '@darkobits/env';
import { dirname } from '@darkobits/fd-name';
import { createNodeCommand } from '@darkobits/nr/dist/lib/commands';
import merge from 'deepmerge';
import { getBinPathSync } from 'get-bin-path';
import ms from 'ms';
import readPkgUp, { NormalizedPackageJson } from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';
import updateNotifier from 'update-notifier';

import { NpmConfigArgv } from 'etc/types';
import log from 'lib/log';

export interface PkgInfo {
  json: NormalizedPackageJson;
  rootDir: string;
}

/**
 * Synchronously searches for a directory containing a package.json starting
 * from process.cwd() or the provided directory. Returns an object containing
 * a normalized package.json manifest and the root directory of the project.
 *
 * Basically a wrapper for readPkgUp that handles throwing if a package.json
 * cannot be found, and that returns the root directory of the package rather
 * than the path to where package.json was found.
 */
export function getPackageInfo(cwd?: string): PkgInfo {
  const pkgInfo = readPkgUp.sync({ cwd });

  if (!pkgInfo) {
    throw new Error(`${log.prefix('getPackageInfo')} Unable to find a package.json for the project.`);
  }

  return {
    json: pkgInfo.packageJson,
    rootDir: path.dirname(pkgInfo.path)
  };
}


/**
 * Provided a package name and optional binary name, resolves the path to the
 * binary from this package (ensuring nested node_modules are traversed).
 *
 * @example
 *
 * "@babel/cli" places an executable script named "babel" in the local
 * node_modules/.bin folder when installed. Therefore, the following invocation:
 *
 * resolveBin('@babel/cli', 'babel')
 *
 * would return the absolute path to the Babel CLI.
 *
 * @example
 *
 * "standard-version" places an executable script named "standard-version" in
 * the local node_modules/.bin folder when installed. Therefore, the following
 * invocation:
 *
 * resolveBin('standard-version')
 *
 * would return the absolute path to the standard-version CLI.
 */
export function resolveBin(pkgName: string, binName?: string) {
  const name = binName ?? pkgName;

  // Resolve the path to the package from our current directory. This will
  // ensure that if the package is installed in a nested node_modules, we should
  // still be able to find it.
  const pkgPath = resolvePkg(pkgName, { cwd: dirname() });

  // Resolve the path to the package's binary. If no additional "binName"
  // argument was provided, we assume that the binary name matches the package
  // name.
  const binPath = getBinPathSync({ cwd: pkgPath, name });

  if (!binPath) {
    if (binName) {
      throw new Error(`${log.prefix('resolveBin')} Unable to resolve path to binary ${log.chalk.green(binName)} from package ${log.chalk.green(pkgName)}`);
    }

    throw new Error(`${log.prefix('resolveBin')} Unable to resolve path to binary: ${log.chalk.green(pkgName)}`);
  }

  return { binPath, pkgPath };
}


/**
 * If called during the invocation of an NPM lifecycle, returns information
 * about the lifecycle event.
 */
export function getNpmInfo() {
  const npmConfigArgv = env<NpmConfigArgv>('npm_config_argv');

  return {
    command: npmConfigArgv?.original.join(' '),
    event: env('npm_lifecycle_event'),
    script: env('npm_lifecycle_script'),
    isInstall: npmConfigArgv?.original.includes('install'),
    isCi: npmConfigArgv?.original.includes('ci')
  };
}


/**
 * Provided a normalized package.json object, renders an update notification in
 * the terminal.
 */
export function doUpdateNotification(pkg: readPkgUp.NormalizedPackageJson) {
  const getStyledUpdateType = (updateType?: string) => {
    switch (updateType) {
      case 'major':
        return log.chalk.yellowBright.bold(updateType);
      case 'minor':
        return log.chalk.green.bold(updateType);
      case 'patch':
        return log.chalk.cyanBright(updateType);
      case 'alpha':
      case 'beta':
      default:
        return log.chalk.magentaBright(updateType);
    }
  };

  // TODO: Remove once this is working reliably.
  log.silly('Running update notifier.');

  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: ms('1 second'),
    shouldNotifyInNpmScript: true,
    distTag: 'beta'
  });

  const styledUpdateType = getStyledUpdateType(notifier.update?.type);

  notifier.notify({
    defer: false,
    isGlobal: false,
    message: [
      `Bonjour! 👋 A new ${styledUpdateType} version of ${log.chalk.rgb(14, 97, 212)(pkg.name)} is available!`,
      `Run ${log.chalk.bold('{updateCommand}')} to update from ${log.chalk.gray('{currentVersion}')} ➤ ${log.chalk.green('{latestVersion}')}. ✨`
    ].join('\n')
  });
}


/**
 * Using the same signature of `nr#createNodeCommand`, creates a command that
 * invokes Node with our pre-configured @babel/register script, ensuring any
 * Babel features enabled in the host project are available when parsing
 * configuration files.
 */
export function createBabelNodeCommand(...params: Parameters<typeof createNodeCommand>) {
  const [name, args, opts] = params;

  return createNodeCommand(name, args, merge({
    execaOptions: {
      nodeOptions: ['--require', require.resolve('etc/babel-register')]
    }
  }, opts ?? {}));
}
