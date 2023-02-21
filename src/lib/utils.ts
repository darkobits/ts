import path from 'path';

import merge from 'deepmerge';
import * as tsConfCk from 'tsconfck';

import log from './log';
import {
  BARE_EXTENSIONS,
  TEST_FILE_PATTERNS
} from '../etc/constants';

import type {
  PackageContext,
  CustomUserConfigExport,
  CustomConfigurationFactory,
  ConfigurationContext,
  ViteConfigurationScaffold
} from '../etc/types';
import type {
  ConfigEnv,
  PluginOption
} from 'vite';


/**
 * @private
 *
 * Uses duck-typing to determine if the provided value is Promise-like.
 */
function isPromise(value: any): value is PromiseLike<any> {
  return Reflect.has(value, 'then') && Reflect.has(value, 'catch');
}


/**
 * Infers information about the host package.
 */
export async function getPackageContext(): Promise<PackageContext> {
  try {
    const timer = log.createTimer();

    // N.B. These are ESM, so we must import them dynamically.
    const { readPackageUp } = await import('read-pkg-up');
    const { findUp } = await import('find-up');

    // Find and parse package.json.
    const pkgResult = await readPackageUp({ cwd: process.cwd() });
    if (!pkgResult) throw new Error('[ts:getPackageContext] Unable to find package.json.');
    const packageJson = pkgResult.packageJson;
    log.silly(log.prefix('getPackageContext'), log.chalk.bold('packageJson'), log.chalk.green(pkgResult.path));

    // Find tsconfig.json.
    const tsConfigPath = await findUp('tsconfig.json', { cwd: process.cwd() });
    if (!tsConfigPath) throw new Error('[ts:getPackageContext] Unable to find tsconfig.json');
    log.silly(log.prefix('getPackageContext'), log.chalk.bold('tsConfig'),  log.chalk.green(tsConfigPath));

    // If we found a package.json and tsconfig.json in the same folder, use that
    // folder as our root. Otherwise, use the directory where we found
    // tsconfig.json. This logic may not be ideal, but a valid edge case would
    // be needed to support a more involved implementation.
    const root = pkgResult.path === path.dirname(tsConfigPath)
      ? pkgResult.path
      : path.dirname(tsConfigPath);
    log.silly(log.prefix('getPackageContext'), log.chalk.bold('root'), root);

    // Parse tsconfig.json.
    const { tsconfig: tsConfig } = await tsConfCk.parse(tsConfigPath);

    // Infer source root. This will already be an absolute directory.
    const srcDir = tsConfig.compilerOptions.baseUrl;
    if (!srcDir) throw new Error('[ts:getPackageContext] "compilerOptions.baseUrl" must be set in tsconfig.json');
    log.silly(log.prefix('getPackageContext'), log.chalk.bold('srcDir'), log.chalk.green(srcDir));

    // Infer output directory. If it is not absolute, resolve it relative to the
    // root directory.
    const outDir = tsConfig.compilerOptions.outDir
      ? path.isAbsolute(tsConfig.compilerOptions.outDir)
        ? tsConfig.compilerOptions.outDir
        : path.resolve(root, tsConfig.compilerOptions.outDir)
      : undefined;
    if (!outDir) throw new Error('[ts:getPackageContext] "compilerOptions.outDir" must be set in tsconfig.json');
    log.silly(log.prefix('getPackageContext'), log.chalk.bold('outDir'), log.chalk.green(path.resolve(root, outDir)));

    // Build glob patterns to match source files and test files.
    const SOURCE_FILES = [srcDir, '**', `*.{${BARE_EXTENSIONS.join(',')}}`].join(path.sep);
    const TEST_FILES = [srcDir, '**', `*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`].join(path.sep);

    log.silly(log.prefix('getPackageContext'), `Done in ${timer}.`);

    return {
      root,
      srcDir,
      outDir,
      tsConfigPath,
      tsConfig,
      packageJson,
      patterns: {
        SOURCE_FILES,
        TEST_FILES
      }
    };
  } catch (err) {
    throw new Error(`[ts:getPackageContext] ${err}`);
  }
}


/**
 * Returns a ViteConfigurationScaffold.
 */
export function getViteConfigurationScaffold(): ViteConfigurationScaffold {
  return {
    build: {},
    plugins: [],
    resolve: {},
    server: {},
    test: {}
  };
}


/**
 * Provided a Vite configuration object, returns a function that accepts a
 * plugin name and configuration value. The function then finds the plugin and
 * merges the provided configuration object with the plugin's existing
 * configuration.
 */
export function createPluginReconfigurator(config: ViteConfigurationScaffold) {
  return async (newPluginReturnValue: PluginOption) => {
    if (!config) return;

    const existingPluginsAsFlatArray = config.plugins?.flat(1);

    // A plugin factory can return a single plugin instance or an array of
    // plugins. Since we accept a plugin factory's return value, coerce the
    // incoming value to an array so we can deal with it uniformly.
    const newPluginsAsFlatArray = Array.isArray(newPluginReturnValue)
      ? newPluginReturnValue.flat(1)
      : [newPluginReturnValue];

    // Iterate over each _new_ plugin object and attempt to find its
    // corresponding value in the current plugin configuration.
    for (const curPlugin of newPluginsAsFlatArray) {
      let pluginFound = false;

      const resolvedPlugin = isPromise(curPlugin) ? await curPlugin : curPlugin;

      if (!resolvedPlugin) continue;

      // Only necessary for TypeScript; the PluginOption type contains a
      // recursive reference to an array of itself, so no amount of flattening
      // will ever allow us to narrow this to a non-array type.
      if (Array.isArray(resolvedPlugin)) {
        throw new TypeError('[reconfigurePlugin] Unexpected: Found an array in a flattened list of plugins');
      }

      for (let i = 0; i < existingPluginsAsFlatArray.length; i++) {
        const existingPlugin = existingPluginsAsFlatArray[i];

        const resolvedExistingPlugin = isPromise(existingPlugin)
          ? await existingPlugin
          : existingPlugin;

        if (!resolvedExistingPlugin) continue;
        if (Array.isArray(resolvedExistingPlugin)) continue;

        if (resolvedPlugin.name === resolvedExistingPlugin.name) {
          pluginFound = true;
          existingPluginsAsFlatArray[i] = curPlugin;
          log.verbose(log.prefix('reconfigurePlugin'), `Reconfigured plugin: ${resolvedExistingPlugin.name}`);
          break;
        }
      }

      if (!pluginFound) {
        throw new Error(`[reconfigurePlugin] Unable to find an existing plugin instance for ${resolvedPlugin.name}`);
      }
    }

    // Because we modified this value in-place, we can return it as-is.
    config.plugins = existingPluginsAsFlatArray;
  };
}


/**
 * Used to create Vite configuration presets for different project types.
 * Accepts a function that will be provided a ConfigurationContext object and
 * returns a function that will be invoked by the user in their Vite
 * configuration file (similar to Vite's defineConfig helper). This function may
 * be invoked with zero arguments, a value, or a function. Like defineConfig,
 * the provided value or function's return value will be resolved. Finally, the
 * user-provided configuration will be merged with the base configuration for
 * the preset and returned to Vite.
 */
export function createViteConfigurationPreset<
  C extends ConfigurationContext = ConfigurationContext
>(baseConfigurationFactory: CustomConfigurationFactory<C>) {
  // N.B. This is the function that the user will invoke in their Vite
  // configuration file and pass an optional value/function to set configuration
  // overrides.
  return (userConfigExport?: CustomUserConfigExport<C>) => {
    // N.B. This is the function that will ultimately be provided to Vite, which
    // it will invoke with the default ConfigEnv type.
    return async (configEnv: ConfigEnv) => {
      const packageContext = await getPackageContext();
      const config = getViteConfigurationScaffold();

      const context = {
        ...configEnv,
        ...packageContext,
        config
      } as C;

      // This should modify context.config in-place.
      await baseConfigurationFactory(context);

      // User did not provide any configuration overrides.
      if (!userConfigExport) {
        return context.config;
      }

      // User provided a function that will modify config.context in-place.
      if (typeof userConfigExport === 'function') {
        await userConfigExport(context);
        return context.config;
      }

      // User provided a configuration value or a Promise that will resolve with
      // a configuration value.
      return merge(context.config, await userConfigExport);
    };
  };
}


/**
 * Needed to correctly resolve default imports for certain packages that Rollup
 * does not correct-for by default. Usually, these seem to be packages built
 * with tsup.
 */
export function interopRequireDefault<T>(packageExport: T, label?: string): T {
  if (Reflect.has(packageExport as any, 'default')) {
    if (label) {
      log.silly(log.prefix('interopRequireDefault'), `Fixed default import for ${label}`);
    }

    return Reflect.get(packageExport as any, 'default');
  }

  return packageExport;
}
