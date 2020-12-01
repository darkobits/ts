import fs from 'fs';
import path from 'path';

import { getBinPathSync } from 'get-bin-path';
// @ts-expect-error: Package does not have type defs.
import * as npsUtils from 'nps-utils';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';

import {
  NPSConfiguration,
  NPSConfigurationFactory
} from 'etc/types';
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
 * Provided a package name and optional binary name, resolves the path to the
 * binary from this package (ensuring nested node_modules are traversed) then
 * require()s the module.
 */
export function requireBin(pkgName: string, binName?: string) {
  const name = binName ?? pkgName;

  const cwd = resolvePkg(pkgName, { cwd: __dirname });
  const binPath = getBinPathSync({ cwd, name });
  const pkg = getPackageInfo(cwd);

  if (!binPath) {
    if (binName) {
      throw new Error(`${log.prefix('requireBin')} Unable to resolve path to binary ${log.chalk.green(binName)} from package ${log.chalk.green(pkgName)}`);
    }

    throw new Error(`${log.prefix('requireBin')} Unable to resolve path to binary: ${log.chalk.green(pkgName)}`);
  }

  log.verbose(log.prefix(name), `Using ${log.chalk.yellow.bold(`${pkg.json.name}@${pkg.json.version}`)}.`);
  log.verbose(log.prefix(name), `${log.chalk.gray('=>')} ${log.chalk.green(binPath)}`);

  require(binPath);
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
        `${log.chalk.green(tsConfigPath)}.but the file does not exist. You will`,
        'need to create a tsconfig.json or set parserOptions.project manually.'
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
export function getUserScripts(userArgument?: NPSConfiguration | NPSConfigurationFactory) {
  let userScripts: NPSConfiguration = {
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
