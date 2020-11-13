import fs from 'fs';
import path from 'path';
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
