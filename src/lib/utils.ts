import path from 'path';

import merge from 'deepmerge';
import * as tsConfCk from 'tsconfck';

import log from './log';

import type { PackageContext, CustomUserConfigExport, ConfigurationContext } from '../etc/types';
import type { UserConfig, ConfigEnv } from 'vite';


/**
 * Infers information about the host package.
 */
export async function getPackageContext(): Promise<PackageContext> {
  try {
    const timer = log.createTimer();

    const { readPackageUp } = await import('read-pkg-up');
    const { findUp } = await import('find-up');

    const root = process.env.VITE_ROOT ?? process.cwd();
    log.verbose(log.prefix('getPackageContext'), log.chalk.bold('root'), root);

    // Find and parse package.json.
    const pkgResult = await readPackageUp({ cwd: root });
    if (!pkgResult) throw new Error('[getPackageContext] Unable to find package.json.');
    const packageJson = pkgResult.packageJson;
    log.verbose(log.prefix('getPackageContext'), log.chalk.bold('packageJson'), log.chalk.green(pkgResult.path));

    // Find tsconfig.json.
    const tsConfigPath = await findUp('tsconfig.json', { cwd: root });
    if (!tsConfigPath) throw new Error('[getPackageContext] Unable to find tsconfig.json');
    log.verbose(log.prefix('getPackageContext'), log.chalk.bold('tsConfig'),  log.chalk.green(tsConfigPath));

    // Parse tsconfig.json.
    const { tsconfig: tsConfig } = await tsConfCk.parse(tsConfigPath);

    // Infer source root.
    const srcDir = tsConfig.compilerOptions.baseUrl;
    if (!srcDir) throw new Error('[getPackageContext] "compilerOptions.baseUrl" must be set in tsconfig.json');
    log.verbose(log.prefix('getPackageContext'), log.chalk.bold('srcDir'), log.chalk.green(srcDir));

    // Infer output directory.
    const outDir = tsConfig.compilerOptions.outDir;
    if (!outDir) throw new Error('[getPackageContext] "compilerOptions.outDir" must be set in tsconfig.json');
    log.verbose(log.prefix('getPackageContext'), log.chalk.bold('outDir'), log.chalk.green(path.resolve(root, outDir)));

    log.verbose(log.prefix('getPackageContext'), `Done in ${timer}.`);

    return {
      root,
      srcDir,
      outDir,
      tsConfigPath,
      tsConfig,
      packageJson
    };
  } catch (err) {
    throw new Error(`${log.prefix('getPackageContext')} ${err}`);
  }
}


/**
 * Used internally to create Vite configuration presets for different project
 * types. Accepts a function that will be provided a ConfigurationContext
 * object and returns a function that will be invoked by the user in their Vite
 * configuration file (similar to Vite's defineConfig helper). This function may
 * be invoked with zero arguments, a value, or a function. Like defineConfig,
 * the provided value or function's return value will be resolved. Finally, the
 * user-provided configuration will be merged with the base configuration for
 * the preset and returned to Vite.
 *
 * TODO: Implement Vite configuration scaffolds from tsx so users can access the
 * base configuration object and modify it in-place.
 */
export function createViteConfigurationPreset(baseConfigurationFactory: (context: ConfigurationContext) => UserConfig | Promise<UserConfig>) {
  // N.B. This is the function that the user will invoke in their Vite
  // configuration file and pass an optional value/function to set configuration
  // overrides.
  return (userConfigExport?: CustomUserConfigExport) => {
    // N.B. This is the function that will ultimately be provided to Vite, which
    // it will invoke with the default ConfigEnv type.
    return async (configEnv: ConfigEnv) => {
      const packageContext = await getPackageContext();

      const configurationContext: ConfigurationContext = {
        ...configEnv,
        ...packageContext
      };

      const baseConfig = await baseConfigurationFactory(configurationContext);

      // User did not provide any configuration overrides.
      if (!userConfigExport) {
        return baseConfig;
      }

      // User provided a function that will return configuration overrides.
      if (typeof userConfigExport === 'function') {
        return merge(baseConfig,  await userConfigExport(configurationContext));
      }

      // User provided a value or a Promise that will resolve with configuration
      // overrides.
      return merge(baseConfig, await userConfigExport);
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
