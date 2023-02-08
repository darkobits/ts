import path from 'path';

import * as tsconfck from 'tsconfck';

import log from './log';


export interface DirectoriesResult {
  /**
   * Sub-directory that contains the project's source files. Read from
   * "compilerOptions.baseUrl" in tsconfig.json.
   */
  srcDir: string | undefined;

  /**
   * Sub-directory to which output files should be written. Read from
   * "compilerOptions.outDir" in tsconfig.json.
   */
  outDir: string | undefined;

  /**
   * Path to the project's tsconfig.json file.
   */
  tsConfigPath: string | undefined;
}


/**
 * @private
 *
 * Attempts to infer the user's source and output directories
 */
export async function getSourceAndOutputDirectories(): Promise<DirectoriesResult> {
  try {
    const tsConfigPath = await tsconfck.find(path.resolve(process.cwd(), 'tsconfig.json'));
    const tsConfig = await tsconfck.parse(tsConfigPath);

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
    const outDir = tsConfig.tsconfigFile ?
      tsConfig.tsconfig?.compilerOptions?.outDir
      : undefined;

    return {
      srcDir,
      outDir,
      tsConfigPath
    };
  } catch (err) {
    throw new Error(`${log.prefix('getSourceAndOutputDirectories')} ${err}`);
  }
}
