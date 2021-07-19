import path from 'path';

import env from '@darkobits/env';
import esm from 'esm';
import fs from 'fs-extra';
import { getBinPathSync } from 'get-bin-path';
import ms from 'ms';
import readPkgUp, { NormalizedPackageJson } from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';
import updateNotifier from 'update-notifier';

import { NpmConfigArgv } from 'etc/types';
import log from 'lib/log';


/**
 * Provided any JSON-serializable value, returns a base-64 encoded representation
 * of that value.
 */
export function toBase64<T = any>(value: T): string {
  return Buffer.from(JSON.stringify(value)).toString('base64');
}


/**
 * Provided a base-64 encoded representation of a JSON-serializable value,
 * returns the un-serialized value.
 */
export function fromBase64<T = any>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64').toString('ascii'));
}


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
  // In rare cases we may have been passed an absolute path to a file. If so,
  // return it.
  if (path.isAbsolute(pkgName)) {
    return { binPath: pkgName };
  }

  const name = binName ?? pkgName;

  // Resolve the path to the package from our current directory. This will
  // ensure that if the package is installed in a nested node_modules, we should
  // still be able to find it.
  const pkgPath = resolvePkg(pkgName, { cwd: __dirname });

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
 * Provided a package name and optional binary name, resolves the path to the
 * binary from this package (ensuring nested node_modules are traversed) and
 * then loads it.
 */
export function requireBin(pkgName: string, binName?: string) {
  const { binPath, pkgPath } = resolveBin(pkgName, binName);

  if (log.isLevelAtLeast('verbose')) {
    // Additionally, load the manifest for the package. This is used for logging
    // purposes only.
    const pkg = getPackageInfo(pkgPath);
    const name = binName ?? pkgName;
    log.verbose(log.prefix(name), `Using ${log.chalk.yellow.bold(`${pkg.json.name}@${pkg.json.version}`)}.`);
    log.verbose(log.prefix(name), `${log.chalk.gray('=>')} ${log.chalk.green(binPath)}`);
  }

  const requireEsm = esm(module, {cjs: {dedefault: true }});
  requireEsm(binPath);
}


/**
 * Used by our ESLint configuration.
 *
 * Returns the path to the host package's tsconfig.json file. If a tsconfig.json
 * cannot be found, returns `false` and issues a warning telling the user they
 * will need to manually indicate the path to their tsconfig.json.
 */
export function findTsConfig() {
  const pkg = getPackageInfo();
  const tsConfigPath = path.resolve(pkg.rootDir, 'tsconfig.json');

  try {
    fs.accessSync(tsConfigPath, fs.constants.R_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.warn(log.prefix('ts'), [
        'Attempted to automatically set ESLint\'s parserOptions.project to',
        `${log.chalk.green(tsConfigPath)}, but the file does not exist. You`,
        'will need to create a tsconfig.json or set parserOptions.project',
        'yourself.'
      ].join(' '));
    }

    return false;
  }

  return tsConfigPath;
}


/**
 * Because this package shares many package scripts and tooling with its own
 * dependents, we need to differentiate between when a binary is being invoked
 * by this package and when it is being invoked by a dependent package.
 *
 * This is necessary because during this package's install/prepare phase, NPM
 * will not have linked the "bin" entries from our package.json yet, and those
 * entries point to files in our "dist" folder, which will not have been created
 * yet.
 *
 * So, when used by us, a package script needs to use the canonical/standard
 * binary name, and when used by a dependent package, a script needs to use the
 * prefixed bin name.
 *
 * This function makes this determination by checking the "name" field of the
 * closest package.json file (walking up the directory tree from process.cwd)
 * and compares it to our package name.
 */
export function prefixBin(binName: string) {
  const pkg = getPackageInfo();

  if (pkg && pkg.json.name === '@darkobits/ts') {
    // We are being called locally and need to do some extra work to resolve
    // the path to the indicated binary.
    const pkgRoot = pkg.rootDir;
    const dependencyBinaryPath = path.resolve(pkgRoot, 'node_modules', '.bin', binName);

    if (fs.pathExistsSync(dependencyBinaryPath)) {
      // We are likely calling something like 'eslint', and just need to return
      // the argument as-is.
      return binName;
    }

    // Otherwise, we may be trying to call one of our scripts, the source for
    // which will be in our 'dist' folder (requiring that the package has been
    // built) and we should return the absolute path to the script.
    const pkgBins = pkg.json.bin;

    // This is highly unlikely but necessary for type-safety.
    if (!pkgBins) {
      throw new Error('package.json does not declare any binaries.');
    }

    const binPath = pkgBins[`ts.${binName}`];
    const absBinPath = path.resolve(pkgRoot, binPath);
    return absBinPath;
  }

  // We are being called from a dependent package, and our own binaries will
  // have been linked to node_modules/.bin using the 'ts.' prefix (per our
  // package.json), so simply return the prefixed version of the indicated
  // binary.
  return `ts.${binName}`;
}


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
