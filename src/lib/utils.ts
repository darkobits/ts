import fs from 'fs';
import path from 'path';

// @ts-expect-error - No type defs exist for this package.
import * as npsUtils from 'nps-utils';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';

import log from 'lib/log';


/**
 * Synchronously searches for a directory containing a package.json starting
 * from process.cwd() or the provided directory. Returns an object containing
 * a normalized package.json manifest and the root directory of the project.
 */
export function getPackageInfo(cwd?: string) {
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
 * Resolves the absolute path to the binary of a given package. Some packages
 * export multiple binaries, or binaries that do not match the package's name.
 * In such cases, a second argument may be provided to indicate the name of the
 * binary to look up.
 */
export function resolveBin(pkgName: string, binName?: string) {
  // Resolve the absolute path to the desired package, starting from our current
  // directory, thereby ensuring that any nested node_modules folders between
  // us and the host package are included in the search.
  const rootDir = resolvePkg(pkgName, { cwd: __dirname });

  if (!rootDir) {
    throw new Error(`${log.prefix('resolveBin')} Unable to resolve path to package "${pkgName}".`);
  }

  // Load the package.json for the package.
  const pkg = getPackageInfo(rootDir);

  if (!pkg) {
    throw new Error(`${log.prefix('resolveBin')} Unable to find a package.json for package "${pkgName}".`);
  }

  if (!pkg.json.bin) {
    throw new Error(`${log.prefix('resolveBin')} Package "${pkgName}" does not export any binaries.`);
  }

  // Get the relative path to the indicated binary.
  const relativeBinPath = binName ? pkg.json.bin[binName] : pkg.json.bin[pkgName];

  if (!relativeBinPath) {
    throw new Error(`${log.prefix('resolveBin')} Package "${pkgName}" does not export a binary named "${binName ?? pkgName}".`);
  }

  // Return the absolute path to the indicated binary.
  return {
    path: path.resolve(rootDir, relativeBinPath),
    version: pkg.json.version
  };
}


/**
 * Provided a package name and optional binary name, loads the binary.
 */
export function requireBin(pkgName: string, binName?: string) {
  const binInfo = resolveBin(pkgName, binName);
  log.verbose(log.prefix('bin'), `Using ${log.chalk.bold(`${binName ?? pkgName}`)} version ${log.chalk.green(binInfo.version)}.`);
  require(binInfo.path);
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
        `${log.chalk.green(tsConfigPath)}, but the file does not exist. You may need to set`,
        'parserOptions.project manually.'
      ].join(' '));
    }

    return false;
  }

  return tsConfigPath;
}


/**
 * Because 'ts' shares the below scripts with its own dependents, we need
 * to differentiate when a binary is being invoked by us and when it is being
 * invoked by a dependent, because during out install/prepare phase, NPM will
 * not have linked the "bin" entries from our package.json yet, and those
 * entries point to files in our "dist" folder, which will not have been created
 * yet.
 *
 * So, when used by us, a script needs to use the canonical/standard bin name,
 * and when used by a dependent, a script needs to use the prefixed bin name.
 *
 * This function checks the name of the closest package.json file (walking up
 * the directory tree from process.cwd) and compares it to our package name to
 * determine if prefixing should occur.
 */
export function prefixBin(binName: string) {
  const pkg = getPackageInfo();

  if (pkg && pkg.json.name === '@darkobits/ts') {
    return binName;
  }

  return `ts.${binName}`;
}


/**
 * Introspects the argument passed to our NPS configuration function. If a
 * configuration factory was provided, invokes it and returns the result. If an
 * object was provided, returns it. If no argument was provided, returns a
 * configuration scaffold object.
 */
export function getUserScripts(userArgument?: any) {
  let userScripts = {
    scripts: {},
    options: {}
  };

  if (typeof userArgument === 'function') {
    userScripts = userArgument({ npsUtils });
  }

  if (typeof userArgument === 'object') {
    userScripts = userArgument;
  }

  if (!Reflect.has(userScripts, 'scripts') && !Reflect.has(userScripts, 'options')) {
    log.warn(log.prefix('package-scripts'), 'Object returned did not contain "scripts" or "options" keys. This may be an error.');
  }

  return userScripts;
}
