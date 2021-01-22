import path from 'path';

import env from '@darkobits/env';
import fs from 'fs-extra';
import { getBinPathSync } from 'get-bin-path';
import IS_CI from 'is-ci';
import ms from 'ms';
// @ts-expect-error: Package does not have type defs.
import * as npsUtils from 'nps-utils';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';
import updateNotifier from 'update-notifier';

import {
  NpmConfigArgv,
  NPSConfiguration,
  NPSConfigurationFactory,
  SkipWarningPayload
} from 'etc/types';
import log from 'lib/log';


/**
 * @private
 *
 * Extracts an NPS script name from the value of a key/value pair in the
 * "scripts" object in package.json.
 */
function getRootNpsScriptName(npmScriptValue = '') {
  const npsScriptNameMatches = /^nps (.*)+$/g.exec(npmScriptValue);

  if (npsScriptNameMatches) {
    return npsScriptNameMatches[1];
  }
}


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


/**
 * Synchronously searches for a directory containing a package.json starting
 * from process.cwd() or the provided directory. Returns an object containing
 * a normalized package.json manifest and the root directory of the project.
 *
 * Basically a wrapper for readPkgUp that handles throwing if a package.json
 * cannot be found, and that returns the root directory of the package rather
 * than the path to where package.json was found.
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
 *
 * @example
 *
 * "@babel/cli" places an executable script named "babel" in the local
 * node_modules/.bin folder when installed. Therefore, the following invocation:
 *
 * requireBin('@babel/cli', 'babel')
 *
 * would load that script.
 *
 * @example
 *
 * "standard-version" places an executable script named "standard-version" in
 * the local node_modules/.bin folder when installed. Therefore, the following
 * invocation:
 *
 * requireBin('standard-version')
 *
 * would load that script.
 */
export function requireBin(pkgName: string, binName?: string) {
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
      throw new Error(`${log.prefix('requireBin')} Unable to resolve path to binary ${log.chalk.green(binName)} from package ${log.chalk.green(pkgName)}`);
    }

    throw new Error(`${log.prefix('requireBin')} Unable to resolve path to binary: ${log.chalk.green(pkgName)}`);
  }

  if (log.isLevelAtLeast('verbose')) {
    // Additionally, load the manifest for the package. This is used for logging
    // purposes only.
    const pkg = getPackageInfo(pkgPath);
    log.verbose(log.prefix(name), `Using ${log.chalk.yellow.bold(`${pkg.json.name}@${pkg.json.version}`)}.`);
    log.verbose(log.prefix(name), `${log.chalk.gray('=>')} ${log.chalk.green(binPath)}`);
  }

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
    userScripts = userArgument({
      npsUtils,
      IS_CI
    });
  }

  if (typeof userArgument === 'object') {
    userScripts = userArgument;
  }

  if (!Reflect.has(userScripts, 'scripts') && !Reflect.has(userScripts, 'options')) {
    log.warn(log.prefix('package-scripts'), 'Object returned did not contain "scripts" or "options" keys. This may be an error.');
  }

  return userScripts;
}


/**
 * Provided a string representing a command or set of scripts to run, checks to
 * ensure that (1) we are not in a CI environment and (2) we are not being run
 * as part of an NPM lifecycle. If both of these conditions are met, the
 * provided scripts will be returned (presumably to NPS) for execution.
 * Otherwise, an empty string will be returned, causing NPS to no-op.
 *
 * Rationale:
 *
 * Recommended configuration for TS is to alias the "prepare" NPM lifecycle
 * script in package.json to the NPS "prepare" script. This ensures that when a
 * developer clones a repo based on TS and invokes "npm install", the project
 * will lint, build, and test, giving the developer confidence that they are
 * starting with working code.
 *
 * However, in a CI context, it may be preferable to separate these tasks into
 * explicit commands/invocations so that (1) anyone reading the CI script can
 * discern exactly what's going on (just seeing "npm ci" or "npm install" does
 * not make it clear that this will perform all of the above tasks) and (2) it
 * gives the developer the ability to run alternate build/test scripts in CI.
 *
 * For example, a developer may want to run the "test.coverage" script to
 * generate a coverage report as opposed to the standard "test" script.
 *
 * Without this helper, the developer would have to either (1) invoke their
 * install script with the "--ignore-scripts" option or (2) let the CI job run
 * build/test tasks twice, neither of which are desirable.
 */
export function skipIfCiNpmLifecycle(npsScriptName: string, npsScripts: string) {
  const npmConfigArgv = env<NpmConfigArgv>('npm_config_argv');
  const npmCommand = `npm ${npmConfigArgv?.original.join(' ')}`;
  const npmScriptName = env('npm_lifecycle_event');
  const npmScriptValue = env('npm_lifecycle_script');

  const isNpmInstall = npmConfigArgv?.original.includes('install');
  const isNpmCi = npmConfigArgv?.original.includes('ci');

  const rootNpsScriptName = getRootNpsScriptName(npmScriptValue) ?? '';

  const data = toBase64<SkipWarningPayload>({
    npmCommand,
    npmScriptName,
    npmScriptValue,
    rootNpsScriptName,
    localNpsScriptName: npsScriptName
  });

  if (IS_CI && (isNpmInstall || isNpmCi)) {
    return `babel-node --require ${require.resolve('etc/babel-register')} ${require.resolve('etc/scripts/skip-warning')} "${data}"`;
  }

  return npsScripts;
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
