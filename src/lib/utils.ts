import { execSync } from 'node:child_process';
import path from 'node:path';

import chalk from 'chalk';
import merge from 'deepmerge';
import { findUp } from 'find-up';
import { getTsconfig } from 'get-tsconfig';
import { readPackageUp } from 'read-package-up';

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
  return Reflect.has(value, 'then')
    && Reflect.has(value, 'catch')
    && Reflect.has(value, 'finally');
}

/**
 * Infers information about the host package.
 */
export async function getPackageContext(): Promise<PackageContext> {
  try {
    const prefix = chalk.green.bold('getPackageContext');
    const startTime = Date.now();

    // Find and parse package.json.
    const pkgResult = await readPackageUp({ cwd: process.cwd() });
    if (!pkgResult) throw new Error('[getPackageContext] Unable to find package.json.');
    const packageJson = pkgResult.packageJson;
    log.info(prefix, chalk.bold('packageJson'), chalk.green(pkgResult.path));

    // Find tsconfig.json.
    const tsConfigPath = await findUp('tsconfig.json', { cwd: process.cwd() });
    if (!tsConfigPath) throw new Error('[ts:getPackageContext] Unable to find tsconfig.json');
    log.info(prefix, chalk.bold('tsConfig'),  chalk.green(tsConfigPath));

    // If we found a package.json and tsconfig.json in the same folder, use that
    // folder as our root. Otherwise, use the directory where we found
    // tsconfig.json. This logic may not be ideal, but a valid edge case would
    // be needed to support a more involved implementation.
    const root = pkgResult.path === path.dirname(tsConfigPath)
      ? pkgResult.path
      : path.dirname(tsConfigPath);
    log.info(prefix, chalk.bold('root'), chalk.green(root));

    // Parse tsconfig.json.
    const tsConfigResult = getTsconfig(tsConfigPath);
    if (!tsConfigResult) throw new Error(`[getPackageContext] Unable to locate a tsconfig.json file at or above ${chalk.green(tsConfigPath)}`);
    const { config: tsConfig } = tsConfigResult;

    // Infer source root. This will already be an absolute directory.
    const srcDir = tsConfig.compilerOptions?.baseUrl;
    if (!srcDir) throw new Error('[getPackageContext] "compilerOptions.baseUrl" must be set in tsconfig.json');
    log.info(prefix, chalk.bold('srcDir'), chalk.green(path.resolve(srcDir)));

    // Infer output directory. If it is not absolute, resolve it relative to the
    // root directory.
    const outDir = tsConfig.compilerOptions?.outDir
      ? path.isAbsolute(tsConfig.compilerOptions.outDir)
        ? tsConfig.compilerOptions.outDir
        : path.resolve(root, tsConfig.compilerOptions.outDir)
      : undefined;
    if (!outDir) throw new Error('[getPackageContext] "compilerOptions.outDir" must be set in tsconfig.json');
    log.info(prefix, chalk.bold('outDir'), chalk.green(path.resolve(root, outDir)));

    // Build glob patterns to match source files and test files.
    const SOURCE_FILES = [srcDir, '**', `*.{${BARE_EXTENSIONS.join(',')}}`].join(path.sep);
    const TEST_FILES = [srcDir, '**', `*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`].join(path.sep);

    const time = Date.now() - startTime;
    log.info(prefix, `Done in ${time}ms.`);

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
    throw new Error(`[getPackageContext] ${err}`);
  }
}

export interface ESLintConfigurationStrategy {
  type: 'flat' | 'legacy';
  configFile: string;
}

/**
 * Determines how the user has configured ESLint in their project. If a file
 * named `eslint.config.{js,mjs,cjs}` exists, the project is using ESLint's new
 * "flat configuration" format. If a file matching `.eslintrc` is found, the
 * project is using ESLint's legacy configuration format.
 *
 * We want to prefer and prioritize flat configuration files over legacy ones,
 * and knowing what strategy the project uses is necessary as it will affect how
 * ESLint is invoked by our boilerplate package scripts.
 */
export async function inferESLintConfigurationStrategy(cwd: string = process.cwd()): Promise<ESLintConfigurationStrategy | false> {
  try {
    const [
      flatConfigFilePath,
      legacyConfigFilePath
    ] = await Promise.all([
      findUp([
        'eslint.config.js',
        'eslint.config.mjs',
        'eslint.config.cjs',
        // ESLint cannot parse TypeScript configuration files... yet.
        'eslint.config.ts',
        'eslint.config.cts'
      ], { cwd }),
      findUp([
        '.eslintrc',
        '.eslintrc.json',
        '.eslintrc.yml',
        '.eslintrc.yaml',
        '.eslintrc.js',
        '.eslintrc.cjs',
        '.eslintrc.mjs'
      ], { cwd })
    ]);

    if (flatConfigFilePath) {
      return {
        type: 'flat',
        configFile: flatConfigFilePath
      };
    }

    if (legacyConfigFilePath) {
      return {
        type: 'legacy',
        configFile: legacyConfigFilePath
      };
    }

    return false;
  } catch (err: any) {
    log.error('[inferESLintConfigurationStrategy]', err);
    return false;
  }
}

/**
 * Returns a new ViteConfigurationScaffold.
 */
export function createViteConfigurationScaffold(): ViteConfigurationScaffold {
  return { build: {}, plugins: [], resolve: {}, server: {}, test: {} };
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

      const resolvedPlugin = isPromise(curPlugin)
        ? await curPlugin
        : curPlugin;

      if (!resolvedPlugin) continue;

      // Only necessary for TypeScript; the PluginOption type contains a
      // recursive reference to an array of itself, so no amount of flattening
      // will ever allow us to narrow this to a non-array type.
      if (Array.isArray(resolvedPlugin))
        throw new TypeError('[reconfigurePlugin] Unexpected: Found an array in a flattened list of plugins');

      for (let i = 0; i < existingPluginsAsFlatArray.length; i += 1) {
        const existingPlugin = existingPluginsAsFlatArray[i];

        const resolvedExistingPlugin = isPromise(existingPlugin)
          ? await existingPlugin
          : existingPlugin;

        if (!resolvedExistingPlugin) continue;
        if (Array.isArray(resolvedExistingPlugin)) continue;

        if (resolvedPlugin.name === resolvedExistingPlugin.name) {
          pluginFound = true;
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          existingPluginsAsFlatArray[i] = curPlugin;
          log.info('[reconfigurePlugin]', `Reconfigured plugin: ${resolvedExistingPlugin.name}`);
          break;
        }
      }

      if (!pluginFound)
        throw new Error(`[reconfigurePlugin] Unable to find an existing plugin instance for ${resolvedPlugin.name}`);
    }

    // Because we modified this value in-place, we can return it as-is.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
  // configuration file and pass an optional value/function to define config
  // overrides.
  return (userConfig?: CustomUserConfigExport<C>) => {
    // N.B. This is the function that will ultimately be provided to Vite, which
    // it will invoke with the default ConfigEnv param.
    return async (configEnv: ConfigEnv) => {
      const packageContext = await getPackageContext();
      const config = createViteConfigurationScaffold();

      const context = {
        ...configEnv,
        ...packageContext,
        config
      } as C;

      // This should modify context.config in-place.
      await baseConfigurationFactory(context);

      // User did not provide any configuration overrides.
      if (!userConfig) return context.config;

      // User provided a function that will modify config.context in-place, or
      // return a Vite configuration object, or both.
      if (typeof userConfig === 'function')
        return merge(context.config, await userConfig(context) ?? {});

      // User provided a configuration value or a Promise that will resolve with
      // a configuration value.
      return merge(context.config, await userConfig);
    };
  };
}

/**
 * Returns a short description of the current Git commit using 'git describe'.
 * If the current commit has a tag pointing to it, the description will be the
 * tag name. Otherwise, the description will include the most recent tag name
 * and a short commit SHA for the current commit.
 *
 * @example
 *
 * 'v1.12.7'
 * 'v1.12.7-9d2f0dc'
 */
export function gitDescribe() {
  try {
    return execSync('git describe --tags --always', { encoding: 'utf8' })
      // Remove trailing newline.
      .trim()
      // Remove the 'g' that immediately precedes the commit SHA.
      .replaceAll(/-g(\w{7,})$/g, '-$1')
      // Replace the 'commits since last tag' segment with a dash.
      .replaceAll(/-\d+-/g, '-');
  } catch (err: any) {
    log.error('[gitDescribe]', err);
    return '';
  }
}
