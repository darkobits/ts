import path from 'path';

import { find, parse } from 'tsconfck';

import log from './log';


export async function getSourceAndOutputDirectories() {
  try {
    const tsConfigPath = await find(path.resolve(process.cwd(), 'tsconfig.json'));
    const tsConfig = await parse(tsConfigPath);

    if (!tsConfig.tsconfigFile) {
      throw new Error('Could not find tsconfig.json.');
    }

    if (!tsConfig.tsconfig?.compilerOptions?.baseUrl) {
      throw new Error('tsconfig.json must define compilerOptions.baseUrl');
    }

    const srcDir = path.relative(
      path.dirname(tsConfig.tsconfigFile),
      tsConfig.tsconfig?.compilerOptions?.baseUrl
    );

    const outDir = tsConfig.tsconfig?.compilerOptions?.outDir;

    if (!outDir) {
      throw new Error('tsconfig.json must define compilerOptions.outDir');
    }

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
