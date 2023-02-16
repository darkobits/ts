import path from 'path';

import typescriptPlugin from '@rollup/plugin-typescript';
import glob from 'fast-glob';
// @ts-expect-error - Package has no type definitions.
import preserveShebangPlugin from 'rollup-plugin-preserve-shebang';
import eslintPluginExport from 'vite-plugin-eslint';
// @ts-expect-error - Package has no type definitions.
import noBundlePluginExport from 'vite-plugin-no-bundle';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPathsPluginExport from 'vite-tsconfig-paths';

import { BARE_EXTENSIONS, TEST_FILE_PATTERNS } from '../etc/constants';
import tscAliasPlugin from '../lib/tsc-alias-plugin';
import {
  createViteConfigurationPreset,
  interopRequireDefault
} from '../lib/utils';


// Fix default imports for problematic packages.
const tsconfigPathsPlugin = interopRequireDefault(tsconfigPathsPluginExport, 'vite-tsconfig-paths');
const eslintPlugin = interopRequireDefault(eslintPluginExport, 'vite-plugin-eslint');
const noBundlePlugin = interopRequireDefault(noBundlePluginExport, 'vite-plugin-no-bundle');


/**
 * Vite configuration preset suitable for publishing libraries or CLIs to NPM.
 *
 * - Source files will not be bundled.
 * - `node_modules` will be externalized
 * - Output format (CJS or ESM) will be inferred from the `type` field in
 *   `package.json`.
 * - Source and output directories will be inferred from `tsconfig.json`.
 * - Shebangs will be preserved in files that have them.
 * - All non-source files will be copied to the output directory as-is, similar
 *   to Babel's `copyFiles` option.
 */
export const library = createViteConfigurationPreset(async context => {
  // N.B. Vitest invokes Vite with the 'serve' command, but we can handle that
  // case by checking `mode` as well.
  if (context.command === 'serve' && context.mode !== 'test') {
    throw new Error('[ts] The "library" configuration preset does not support the "serve" command.');
  }

  const SOURCE_FILES = [
    context.srcDir,
    '**',
    `*.{${BARE_EXTENSIONS.join(',')}}`
  ].join(path.sep);

  const TEST_FILES = [
    context.srcDir,
    '**',
    `*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`
  ].join(path.sep);

  // Compute entries.
  const entry = await glob(SOURCE_FILES, {
    cwd: context.root,
    ignore: [TEST_FILES]
  });

  if (entry.length === 0) throw new Error(`[vite-config] No suitable entries found in ${context.srcDir}`);

  // Compute files to copy and return an array of targets suitable for using
  // with vite-plugin-static-copy.
  const filesToCopy = (await glob([
    `${context.srcDir}/**/*`,
    `!${SOURCE_FILES}`,
    `!${TEST_FILES}`
  ], {
    cwd: context.root
  })).map(filePath => {
    // Produces something like 'src/foo/bar/baz.ts'.
    const src = path.relative(context.root, filePath);

    // Produces something like 'foo/bar'.
    const dest = path.dirname(src).split(path.sep).slice(1).join(path.sep);
    return { src, dest };
  });

  // Global source map setting used by various plug-ins below.
  const sourceMap = true;

  return {
    build: {
      // Empty the output directory on build start.
      emptyOutDir: true,
      lib: {
        entry,
        formats: context.packageJson.type === 'module' ? ['es'] : ['cjs']
      },
      // Use the inferred output directory defined in tsconfig.json.
      outDir: context.outDir,
      sourcemap: sourceMap,
      // We don't need to minify code in library mode.
      minify: false
    },
    // Configuration for Vitest.
    test: {
      deps: {
        interopDefault: true
      },
      coverage: {
        all: true,
        include: entry
      },
      include: [TEST_FILES]
    },
    plugins: [
      // This plugin allows Rollup to resolve and re-write import/require
      // statements in our source code.
      tsconfigPathsPlugin({ root: context.root }),
      // This plugin ensures source files are not bundled together and that all
      // node modules are externalized.
      noBundlePlugin({ root: context.srcDir }),
      // This plugin is responsible for type-checking the project and outputting
      // declaration files. It reads the project's tsconfig.json automatically,
      // so the below configuration is only overrides.
      typescriptPlugin({
        exclude: [TEST_FILES],
        compilerOptions: {
          // The user should have set either rootDir or baseUrl in their
          // tsconfig.json, but we actually need both to be set to the same
          // value to ensure Typescript compiles declarations properly.
          rootDir: context.srcDir,
          baseUrl: context.srcDir,
          // Suppresses warnings from the plugin. Because we are only using this
          // plugin to output declaration files, this setting has no effect on
          // source output anyway.
          module: 'esnext',
          // Ensure we only emit declaration files; all other source should be
          // processed by Vite/Rollup.
          emitDeclarationOnly: true,
          // Causes the build to fail if type errors are present.
          noEmitOnError: true,
          // If we have build.sourcemap set to `true`, this must also be `true`
          // or the plugin will issue a warning.
          sourceMap
        }
      }),
      // This plugin is responsible for re-writing import/export statements in
      // declaration files after the TypeScript compiler has finished writing
      // them.
      tscAliasPlugin({ configFile: context.tsConfigPath }),
      // This plugin is responsible for linting the project.
      eslintPlugin({
        // cache: true,
        failOnError: true,
        include: [SOURCE_FILES]
      }),
      // This plugin ensures shebangs are preserved in files that have them.
      // This is needed when building CLIs.
      preserveShebangPlugin(),
      // This plugin copies all non-source and non-test files to the output
      // directory. Per our configuration, directory structure will be
      // preserved.
      viteStaticCopy({ targets: filesToCopy })
    ]
  };
});
