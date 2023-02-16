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

import type { ViteConfigurationScaffold } from 'etc/types';


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

  // Global source map setting used by various plug-ins below.
  const sourceMap = true;

  const config: ViteConfigurationScaffold = {
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
    plugins: []
  };


  // ----- Vitest Configuration ------------------------------------------------

  config.test = {
    deps: {
      interopDefault: true
    },
    coverage: {
      all: true,
      include: entry
    },
    include: [TEST_FILES]
  };


  // ----- Plugin: TypeScript --------------------------------------------------

  // This plugin is responsible for type-checking the project and outputting
  // declaration files. It reads the project's tsconfig.json automatically,
  // so the below configuration is only overrides.
  config.plugins.push(typescriptPlugin({
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
  }));


  // ----- Plugin: tsconfig-paths ----------------------------------------------

  // This plugin allows Rollup to resolve import/require statements in
  // source files by using path mappings configured in the project's
  // tsconfig.json file.
  config.plugins.push(tsconfigPathsPlugin({ root: context.root }));


  // ----- Plugin: tsc-alias ---------------------------------------------------

  // This plugin is responsible for resolving import/export statements to
  // relative paths in declaration files after the TypeScript compiler has
  // finished writing them. This is a requirement for the declaration files
  // to work for consumers, and TypeScript will not resolve these paths on
  // its own.
  config.plugins.push(tscAliasPlugin({ configFile: context.tsConfigPath }));


  // ----- Plugin: No Bundle ---------------------------------------------------

  // This plugin ensures source files are not bundled together and that all
  // node modules are externalized.
  config.plugins.push(noBundlePlugin({ root: context.srcDir }));


  // ----- Plugin: Preserve Shebangs -------------------------------------------

  // This plugin ensures shebangs are preserved in files that have them.
  // This is needed when building CLIs.
  config.plugins.push(preserveShebangPlugin());


  // ----- Plugin: Copy Files --------------------------------------------------

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

  // This plugin copies all non-source and non-test files to the output folder.
  // Per our configuration, directory structure will be preserved. We only add
  // this plugin to the build if there are actually files to be copied because
  // it will issue a warning otherwise.
  if (filesToCopy) {
    config.plugins.push(viteStaticCopy({ targets: filesToCopy }));
  }


  // ----- Plugin: ESLint ------------------------------------------------------

  const hasEslintConfig = (await glob(['.eslintrc.*'], { cwd: context.root })).length > 0;

  // Conditionally add the ESLint plugin to the compilation if the user has an
  // ESLint configuration file present.
  if (hasEslintConfig) {
    config.plugins.push(eslintPlugin({
      // cache: true,
      failOnError: true,
      include: [SOURCE_FILES]
    }));
  }


  return config;
});
