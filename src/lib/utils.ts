import path from 'path';

import { find, parse } from 'tsconfck';

import log from './log';


export interface DirectoriesResult {
  srcDir: string | undefined;
  outDir: string | undefined;
}


export async function getSourceAndOutputDirectories(): Promise<DirectoriesResult> {
  try {
    const tsConfigPath = await find(path.resolve(process.cwd(), 'tsconfig.json'));
    const tsConfig = await parse(tsConfigPath);

    if (!tsConfig.tsconfigFile) {
      return {
        srcDir: undefined,
        outDir: undefined
      };
    }

    const srcDir = tsConfig.tsconfig?.compilerOptions?.baseUrl
      ? path.relative(
        path.dirname(tsConfig.tsconfigFile),
        tsConfig.tsconfig?.compilerOptions?.baseUrl
      )
      : undefined;

    const outDir = tsConfig.tsconfig?.compilerOptions?.outDir ?? undefined;

    log.verbose('srcDir', srcDir);
    log.verbose('outDir', outDir);

    return {
      srcDir,
      outDir
    };
  } catch (err) {
    log.error(log.prefix('getSourceAndOutputDirectories'), err);
    throw err;
  }
}
