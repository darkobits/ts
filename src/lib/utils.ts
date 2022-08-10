import path from 'path';

import env from '@darkobits/env';
import ms from 'ms';

import { GetDefault, NpmConfigArgv, PkgInfo } from 'etc/types';
import log from 'lib/log';

import type { NormalizedPackageJson } from 'read-pkg-up';


/**
 * Searches for a directory containing a package.json starting from
 * `process.cwd()` or the provided directory. Returns an object containing a
 * normalized package.json manifest and the root directory of the project.
 *
 * Basically a wrapper for read-pkg-up that:
 * - Throws if a package.json cannot be found.
 * - Returns the root directory of the package rather than the path to its
 *   package.json.
 */
export async function getPackageInfo(cwd?: string): Promise<PkgInfo> {
  // Note: This package is ESM.
  const { readPackageUp } = await import('read-pkg-up');
  const pkgInfo = await readPackageUp(cwd ? { cwd } : undefined);

  if (!pkgInfo) {
    throw new Error(`${log.prefix('getPackageInfo')} Unable to find a package.json for the project.`);
  }

  return {
    json: pkgInfo.packageJson,
    rootDir: path.dirname(pkgInfo.path)
  };
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
 * Utility to extract the "true" default export from a module when importing
 * CJS from ESM or vice versa, where in some cases the default export is not
 * configured correctly and may wind up being at
 * <default imported module>.default.default.
 */
export function getDefaultExport<T extends Record<string, any>>(value: T): GetDefault<T> {
  let result = Reflect.get(value, 'default');

  while (Reflect.has(result, 'default')) {
    result = Reflect.get(result, 'default');
  }

  return result;
}


/**
 * Provided a normalized package.json object, renders an update notification in
 * the terminal.
 */
export async function showUpdateNotification(pkg: NormalizedPackageJson) {
  // Note: This package is ESM.
  const updateNotifier = getDefaultExport(await import('update-notifier'));

  const getStyledUpdateType = (updateType?: string) => {
    switch (updateType) {
      case 'major':
        return log.chalk.yellowBright.bold(updateType);
      case 'minor':
        return log.chalk.green.bold(updateType);
      case 'patch':
        return log.chalk.cyanBright(updateType);
      // case 'alpha':
      // case 'beta':
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
    distTag: 'latest'
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
