import path from 'path';

import merge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import checkerPlugin from 'vite-plugin-checker';
import tsconfigPathsPlugin from 'vite-tsconfig-paths';

import {
  EXTENSIONS,
  EXTENSIONS_PLAIN
} from '../etc/constants';
import log from '../lib/log';
import {
  noBundlePlugin,
  generateNoBundleEntries
} from '../lib/no-bundle-plugin';
import {
  getHostPackageInfo,
  resolveUserConfig
} from '../lib/utils';

import type { UserConfig, UserConfigExport } from 'vite';


/**
 * Generates "un-bundled" output suitable for publishing packages to NPM.
 *
 * Notes:
 * - vite-plugin-dts was considered for generating declarations, but running
 *   tsc in parallel with Vite was able to reduce build times.
 */
export default async (userConfig?: UserConfigExport) => {
  const {
    rootDir,
    srcDir,
    outDir,
    isEsModule
  } = await getHostPackageInfo();

  const resolvedUserConfig = await resolveUserConfig(userConfig);

  log.verbose(log.prefix('isEsModule'), isEsModule);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const finalSrcDir = srcDir || resolvedUserConfig.root || 'src';
  log.verbose(log.prefix('srcDir'), finalSrcDir);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const finalOutDir = outDir || resolvedUserConfig.build?.outDir || 'dist';
  log.verbose(log.prefix('outDir'), finalOutDir);

  const baseConfig: UserConfig = {
    build: {
      emptyOutDir: false,
      outDir: path.join(rootDir, finalOutDir),
      sourcemap: true,
      minify: false,
      lib: {
        formats: isEsModule ? ['es'] : ['cjs'],
        entry: generateNoBundleEntries(finalSrcDir)
      }
    },
    plugins: [
      noBundlePlugin({
        root: finalSrcDir,
        fileNames: '[name].js'
      }),
      tsconfigPathsPlugin({
        projects: [rootDir]
      }),
      checkerPlugin({
        typescript: true,
        eslint: {
          lintCommand: `eslint ${path.join(rootDir, finalSrcDir)} --ext=${EXTENSIONS.join(',')}`
        }
      })
    ],
    // Options for Vitest.
    test: {
      deps: {
        interopDefault: true
      },
      include: [`${finalSrcDir}/**/*.{test,spec}.{${EXTENSIONS_PLAIN.join(',')}}`]
    }
  };

  const finalConfig = merge(baseConfig, resolvedUserConfig, {
    customMerge: (key: string) => (a: any, b: any) => {
      // Concatenate plugin arrays.
      if (key === 'plugins') {
        return [...a, ...b];
      }

      // Concatenate plain objects, overwriting root-level keys.
      if (isPlainObject(a) && isPlainObject(b)) {
        return {...a, ...b};
      }

      // For all other arrays, return the value from the second array.
      if (Array.isArray(a) || Array.isArray(b)) {
        log.warn(log.prefix('mergeConfig'), `[${key}] Encountered arrays:`, a, b);
        return b;
      }

      // For all other values, issue a warning and return the first value.
      log.warn(log.prefix('mergeConfig'), `[${key}] Encountered unknown value:`, a, b);
      return a;
    },
    isMergeableObject: isPlainObject
  });

  return finalConfig;
};
