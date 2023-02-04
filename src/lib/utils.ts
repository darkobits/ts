import path from 'path';

// @ts-expect-error - This package has no type definitions.
import readPackageJson from 'read-package-json';
import * as tsconfck from 'tsconfck';

import log from './log';

import type { PackageInfoResult } from 'etc/types';
import type { Package } from 'normalize-package-data';
import type { UserConfigExport } from 'vite';


/**
 * Attempts to locate and parse the host package's package.json and
 * tsconfig.json files and infer the the package's source and output directories
 * based on "compilerOptions.baseUrl" and "compilerOptions.outDir".
 *
 * Note: This function naively assumes that a package.json file will be located
 * in the same directory as the resolved tsconfig.json file.
 */
export async function getHostPackageInfo(): Promise<PackageInfoResult> {
  try {
    const tsConfigPath = await tsconfck.find(path.resolve(process.cwd(), 'tsconfig.json'));
    const tsConfig = await tsconfck.parse(tsConfigPath);
    const rootDir = path.dirname(tsConfigPath);

    const packageJson = await new Promise<Package>((resolve, reject) => {
      readPackageJson(path.join(rootDir, 'package.json'), log.error, false, (err: Error, data: any) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    const isEsModule = packageJson?.type === 'module';

    // No tsconfig.json file could be found. Return `undefined` for both
    // directories.
    if (!tsConfig.tsconfigFile) {
      return {
        rootDir,
        packageJson,
        tsConfig: undefined,
        tsConfigPath: undefined,
        srcDir: undefined,
        outDir: undefined,
        isEsModule
      };
    }

    // `tsconfck` will resolve `baseUrl` in parsed configurations to an absolute
    // path, but we want the literal value, which is usually something like
    // "src", a path relative to the tsconfig.json file itself. This operation
    // returns the absolute path back to its original relative path. If the
    // tsconfig.json file did not define a "baseUrl", use `undefined`.
    const srcDir = tsConfig.tsconfig?.compilerOptions?.baseUrl
      ? path.relative(
        path.dirname(tsConfig.tsconfigFile),
        tsConfig.tsconfig?.compilerOptions?.baseUrl
      )
      : undefined;

    // `tsconfck` does not resolve "outDir" to an absolute directory, so we can
    // simply extract it from the configuration or used `undefined` if it isn't
    // set.
    const outDir = tsConfig.tsconfig?.compilerOptions?.outDir ?? undefined;

    return {
      rootDir,
      packageJson,
      tsConfig: tsConfig.tsconfig,
      tsConfigPath: tsConfig.tsconfigFile,
      srcDir,
      outDir,
      isEsModule
    };
  } catch (err) {
    throw new Error(`${log.prefix('getHostPackageInfo')} ${err}`);
  }
}


/**
 * @private
 *
 * Resolves provided user configuration value to a Vite configuration object.
 */
export async function resolveUserConfig(userConfig?: UserConfigExport) {
  return typeof userConfig === 'function'
    // @ts-expect-error
    ? userConfig({})
    : userConfig ?? {};
}
