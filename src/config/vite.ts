import path from 'path';

import { interopImportDefault } from '@darkobits/interop-import-default';
import autoInstallPlugin from '@rollup/plugin-auto-install';
// import rollupEslintPlugin from '@rollup/plugin-eslint';
import typescriptPlugin from '@rollup/plugin-typescript';
import glob from 'fast-glob';
// @ts-expect-error - Package has no type definitions.
import preserveShebangPlugin from 'rollup-plugin-preserve-shebang';
import viteEslintPluginExport from 'vite-plugin-eslint';
// @ts-expect-error - Package has no type definitions.
import noBundlePluginExport from 'vite-plugin-no-bundle';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPathsPluginExport from 'vite-tsconfig-paths';

import tscAliasPlugin from '../lib/tsc-alias-plugin';
import { createViteConfigurationPreset } from '../lib/utils';


// Fix default imports for problematic packages.
const noBundlePlugin = interopImportDefault(noBundlePluginExport);
const tsconfigPathsPlugin = interopImportDefault(tsconfigPathsPluginExport);
const viteEslintPlugin = interopImportDefault(viteEslintPluginExport);


/**
 * Vite configuration preset suitable for publishing libraries or CLIs to NPM.
 *
 * - Source files will not be bundled.
 * - `node_modules` will be externalized.
 * - Output format (CJS or ESM) will be inferred from the `type` field in
 *   `package.json`.
 * - Source and output directories will be inferred from `tsconfig.json`.
 * - Shebangs will be preserved in files that have them.
 * - All non-source files will be copied to the output directory as-is, similar
 *   to Babel's `copyFiles` option.
 */
export const library = createViteConfigurationPreset(async context => {
  /**
   * @private
   *
   * Very hacky way to determine if we are in watch mode or not.
   */
  const isWatchMode = process.argv.includes('--watch');


  // ----- Preflight Checks ----------------------------------------------------

  const { command, mode, root, srcDir, patterns: { SOURCE_FILES, TEST_FILES } } = context;

  // This preset does not (yet) work with 'vite serve', so we want to issue a
  // warning and terminate the build process when the user invokes 'vite serve'.
  // However, Vitest _also_ invokes Vite with the 'serve' command, but we can
  // handle that case by checking `mode` as well.
  if (command === 'serve' && mode !== 'test')
    throw new Error('[preset:library] The "library" configuration preset does not support the "serve" command.');

  // Compute anything we need to use async for concurrently.
  const [entry, filesToCopy, eslintConfigResult] = await Promise.all([
    glob(SOURCE_FILES, { cwd: root, ignore: [TEST_FILES] }),
    glob([`${srcDir}/**/*`, `!${SOURCE_FILES}`, `!${TEST_FILES}`], { cwd: root }),
    glob(['.eslintrc.*'], { cwd: root })
  ]);

  if (entry.length === 0)
    throw new Error(`[preset:library] No entry files found in ${srcDir}`);


  // ----- Build Configuration -------------------------------------------------

  const { config, outDir, packageJson } = context;

  config.build = {
    // Use the inferred output directory defined in tsconfig.json.
    outDir,
    // Empty the output directory before writing a new compilation to it.
    emptyOutDir: true,
    // We don't need to minify this kind of project.
    minify: false,
    sourcemap: true,
    lib: {
      entry,
      // Infer output format based on the "type" setting in package.json.
      formats: packageJson.type === 'module' ? ['es'] : ['cjs']
    }
  };


  // ----- Vitest Configuration ------------------------------------------------

  config.test = {
    name: packageJson.name,
    root,
    // Files that will be treated as test files.
    include: [TEST_FILES],
    deps: {
      // Automatically fixes default imports of modules where the intended value
      // is on an object on the `default` property.
      interopDefault: true
    },
    coverage: {
      all: true,
      // Files to be considered (as source) when collecting coverage.
      // N.B. Vitest requires paths relative to the configured `root`, and entry
      // files are already resolved to absolute paths. This un-resolves them to
      // relative paths.
      include: entry.map(entry => path.relative(root, entry))
    }
  };


  // ----- Plugin: Auto-Install ------------------------------------------------

  /**
   * TL;DR: Simply import/require a new dependency to install it.
   *
   * This plugin automatically installs dependencies that are imported by a
   * bundle, even if they are not declared in package.json. It will also update
   * package.json and a Yarn/NPM lockfile, if present.
   *
   * N.B. This plugin should be added before plugins that will throw errors on
   * unresolved imports, such as TypeScript or ESLint.
   *
   * See: https://github.com/rollup/plugins/tree/master/packages/auto-install
   */
  config.plugins.push(autoInstallPlugin({
    pkgFile: path.resolve(root, 'package.json')
  }));


  // ----- Plugin: TypeScript --------------------------------------------------

  /**
   * This plugin is used to emit declaration files and type-check the
   * compilation. _only_. In watch mode, it will issue a warning when it
   * encounters an error. Otherwise, it will throw an error.
   */
  config.plugins.push(typescriptPlugin({
    exclude: [TEST_FILES],
    filterRoot: srcDir,
    compilerOptions: {
      // The user should have set either rootDir or baseUrl in their
      // tsconfig.json, but we actually need _both_ to be set to the same
      // value to ensure TypeScript compiles declarations properly.
      // rootDir: srcDir,
      baseUrl: srcDir,
      // This plugin will issue a warning if this is set to any other value.
      // Because we are only using this plugin to output declaration files, this
      // setting has no effect on source output.
      module: 'esnext',
      // Ensure we only emit declaration files; all other source should be
      // processed by Vite/Rollup.
      emitDeclarationOnly: true,
      // Only fail the compilation on type-errors when not in watch mode.
      // Otherwise, issue a warning and do not kill the process.
      noEmitOnError: !isWatchMode,
      // If we have `config.build.sourcemap` set to `true`, this must also be
      // `true` or the plugin will issue a warning.
      sourceMap: config.build.sourcemap
    }
  }));


  // ----- Plugin: tsconfig-paths ----------------------------------------------

  /**
   * This plugin allows Vite to resolve import/require specifiers in source
   * files using the path mappings configured in tsconfig.json.
   *
   * In other words, if you can import a local project file using a custom path
   * alias and TypeScript can find it without issue, then you can be reasonably
   * assured that Vite will be able to resolve it during builds as well.
   *
   * See: https://github.com/aleclarson/vite-tsconfig-paths
   */
  config.plugins.push(tsconfigPathsPlugin({ root }));


  // ----- Plugin: tsc-alias ---------------------------------------------------

  const { tsConfigPath } = context;

  /**
   * Vite does not process declaration files emitted by TypeScript, any custom
   * path mappings in declaration files will need to be resolved to relative
   * paths as well. This plugin is to declaration files what tsconfig-paths is
   * to source files.
   *
   * See:
   * - https://github.com/justkey007/tsc-alias
   * - src/lib/tsc-alias-plugin.ts
   */
  config.plugins.push(tscAliasPlugin({ configFile: tsConfigPath }));


  // ----- Plugin: No Bundle ---------------------------------------------------

  /**
   * This plugin helps us preserve the directory structure of source files in
   * the output directory by skipping the "bundling" phase. This type of output
   * is ideal for a Node library; if the project winds up being used in an
   * application that runs in the browser, that project's build system can (and
   * typically will) minify library code as part of its build process.
   *
   * See: https://github.com/ManBearTM/vite-plugin-no-bundle
   */
  config.plugins.push(noBundlePlugin({ root: srcDir }));


  // ----- Plugin: Preserve Shebangs -------------------------------------------

  /**
   * CLIs often make use of a shebang on the first line to indicate the location
   * of the binary needed to execute the application. However Vite (and to a
   * lesser degree, Rollup) were not designed for this purpose and strip
   * shebangs in emitted code, causing an error when the user tries to run the
   * application. This plugin addresses that issue by preserving shebangs.
   *
   * See: https://github.com/developit/rollup-plugin-preserve-shebang
   */
  config.plugins.push(preserveShebangPlugin());


  // ----- Plugin: Copy Files --------------------------------------------------

  /**
   * This plugin will copy all non-source files (excluding test files, and
   * preserving directory structure) from `srcDir` to `outDir`. Ths behavior was
   * available in Babe' using its `copyFiles` option, but Vite/Rollup do not
   * seem to have an analogous argument and have no plans to implement one.
   */
  if (filesToCopy.length > 0) {
    config.plugins.push(viteStaticCopy({
      targets: filesToCopy.map(filePath => {
        // Produces something like 'src/foo/bar/baz.ts'.
        const src = path.relative(root, filePath);
        // Produces something like 'foo/bar'.
        const dest = path.dirname(src).split(path.sep).slice(1).join(path.sep);
        return { src, dest };
      })
    }));
  }


  // ----- Plugin: ESLint ------------------------------------------------------

  // Only add this plugin to the compilation if the user has an ESLint
  // configuration file in their project root.
  if (eslintConfigResult.length > 0) {
    config.plugins.push(viteEslintPlugin({
      formatter: 'codeframe',
      failOnError: true,
      failOnWarning: false
    }));
  }
});
