import fs from 'fs';
import path from 'path';

// @ts-expect-error - No type defs exist for this package.
import * as npsUtils from 'nps-utils';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';

import log from 'lib/log';


/**
 * Resolves the absolute path to the binary of a given package.
 */
export async function resolveBin(pkgName: string, binName?: string) {
  // Resolve the indicated package relative to this package.
  const pkgPath = resolvePkg(pkgName, {cwd: __dirname});

  if (!pkgPath) {
    throw new Error(`[resolveBin] Unable to resolve path to package "${pkgName}".`);
  }

  // Load the package.json for the indicated package.
  const pkgData = await readPkgUp({cwd: pkgPath});

  if (!pkgData) {
    throw new Error('[resolveBin] Unable to find a package.json for the local project.');
  }

  if (!pkgData.packageJson.bin) {
    throw new Error(`[resolveBin] Package "${pkgName}" does not declare any binaries.`);
  }

  // Using the path to the package's package.json, compute the root directory
  // for the package.
  const pkgRoot = path.parse(pkgData.path).dir;

  // Extract the relative path to the indicated binary.
  const relativeBinPath = binName ? pkgData.packageJson.bin[binName] : pkgData.packageJson.bin[pkgName];

  if (!relativeBinPath) {
    throw new Error(`[resolveBin] Package "${pkgName}" does not have binary "${binName ?? pkgName}".`);
  }

  // Return the absolute path to the indicated binary.
  return {
    path: path.resolve(pkgRoot, relativeBinPath),
    version: pkgData.packageJson.version
  };
}


/**
 * Provided a package name and optional binary name, loads the binary.
 */
export async function requireBin(pkgName: string, binName?: string) {
  const binInfo = await resolveBin(pkgName, binName);
  log.verbose('bin', `Using ${log.chalk.bold(`${binName ?? pkgName}`)} version ${log.chalk.green(binInfo.version)}.`);
  require(binInfo.path);
}


/**
 * Synchronously reads package.json from the host package and returns its
 * contents and path.
 */
export function getPackageInfo() {
  const pkgInfo = readPkgUp.sync();

  if (!pkgInfo) {
    throw new Error('Unable to find a package.json for the project.');
  }

  return pkgInfo;
}


/**
 * Returns the path to the host package's tsconfig.json file. If a tsconfig.json
 * cannot be found, returns `false` and issues a warning telling the user they
 * will need to manually indicate the path to their tsconfig.json.
 */
export function findTsConfig() {
  const pkgRoot = path.dirname(getPackageInfo().path);
  const tsConfigPath = path.resolve(pkgRoot, 'tsconfig.json');

  try {
    fs.accessSync(tsConfigPath, fs.constants.R_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.warn(log.prefix('ts-unified'), [
        'Attempted to automatically set ESLint\'s parserOptions.project to',
        `${log.chalk.green(tsConfigPath)}, but the file does not exist. You may need to set`,
        'parserOptions.project manually.'
      ].join(' '));
    }

    return false;
  }

  return tsConfigPath;
}


/**
 * Because ts-unified shares the below scripts with its own dependents, we need
 * to differentiate when a binary is being invoked by ts-unified and when it is
 * being invoked by a dependent, because during the install/prepare phase for
 * ts-unified, NPM will not have linked the "bin" entries from our package.json
 * yet, and those entries point to files in our "dist" folder, which has not
 * been created yet.
 *
 * So, when used locally, a script needs to use the "raw" bin name, and when
 * used by a dependent, a script needs to use the "unified." prefix.
 *
 * This function checks the name of the closest package.json file (walking up
 * the directory tree from process.cwd) and compares it to our package name to
 * determine if prefixing should occur.
 */
export function prefixBin(binName: string) {
  const pkgInfo = getPackageInfo();

  if (pkgInfo && pkgInfo.packageJson.name === '@darkobits/ts') {
    return binName;
  }

  return `unified.${binName}`;
}


/**
 * Introspects the argument passed to this module's default export/function, and
 * returns an object representing any user-provided scripts/options.
 */
export function getUserScripts(userArgument: any) {
  let userScripts = {
    scripts: {},
    options: {}
  };

  if (typeof userArgument === 'function') {
    // TODO: Determine if "bin" is still needed here.
    userScripts = userArgument({ npsUtils, bin: prefixBin });
  }

  if (typeof userArgument === 'object') {
    userScripts = userArgument;
  }

  if (!Reflect.has(userScripts, 'scripts') && !Reflect.has(userScripts, 'options')) {
    log.warn(log.prefix('package-scripts'), 'Object returned did not contain "scripts" or "options" keys. This may be an error.');
  }

  return userScripts;
}
