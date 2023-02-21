import path from 'path';

import typescriptPlugin from '@rollup/plugin-typescript';
import glob from 'fast-glob';
// @ts-expect-error - Package has no type definitions.
import preserveShebangPlugin from 'rollup-plugin-preserve-shebang';
import checkerPluginExport from 'vite-plugin-checker';
// @ts-expect-error - Package has no type definitions.
import noBundlePluginExport from 'vite-plugin-no-bundle';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPathsPluginExport from 'vite-tsconfig-paths';

import log from '../lib/log';
import tscAliasPlugin from '../lib/tsc-alias-plugin';
import {
  createViteConfigurationPreset,
  interopRequireDefault
} from '../lib/utils';


// Fix default imports for problematic packages.
const checkerPlugin = interopRequireDefault(checkerPluginExport, 'vite-plugin-checker');
const noBundlePlugin = interopRequireDefault(noBundlePluginExport, 'vite-plugin-no-bundle');
const tsconfigPathsPlugin = interopRequireDefault(tsconfigPathsPluginExport, 'vite-tsconfig-paths');


/**
 * TODO: Consider making this preset work with developing a backend server, or
 * create a separate preset for that purpose.
 */


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
  const {
    root,
    command,
    mode,
    packageJson,
    tsConfigPath,
    config,
    srcDir,
    outDir,
    patterns: {
      SOURCE_FILES,
      TEST_FILES
    }
  } = context;


  // ----- Preflight Checks ----------------------------------------------------

  // This preset does not (yet) work with 'vite serve', so we want to issue a
  // warning and terminate the build process when the user invokes 'vite serve'.
  // However, Vitest _also_ invokes Vite with the 'serve' command, but we can
  // handle that case by checking `mode` as well.
  if (command === 'serve' && mode !== 'test')
    throw new Error('[preset:library] The "library" configuration preset does not support the "serve" command.');

  // Compute entries, files to copy, and search for an ESLint configuration
  // file.
  const [entry, filesToCopy, eslintConfigResult] = await Promise.all([
    glob(SOURCE_FILES, { cwd: root, ignore: [TEST_FILES] }),
    glob([`${srcDir}/**/*`, `!${SOURCE_FILES}`, `!${TEST_FILES}`], { cwd: root }),
    glob(['.eslintrc.*'], { cwd: root })
  ]);

  if (entry.length === 0)
    throw new Error(`[preset:library] No entry files found in ${srcDir}`);


  // ----- Build Configuration -------------------------------------------------

  config.build.lib = {
    entry,
    // Infer output format based on the "type" setting in package.json.
    formats: packageJson.type === 'module' ? ['es'] : ['cjs']
  };

  // Use the inferred output directory defined in tsconfig.json.
  config.build.outDir = outDir;

  // Empty the output directory before writing the new compilation to it.
  config.build.emptyOutDir = true;

  // We don't need to minify this kind of project.
  config.build.minify = false;

  // Enable source maps.
  config.build.sourcemap = true;


  // ----- Vitest Configuration ------------------------------------------------

  config.test = {
    root: root,
    name: packageJson.name,
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

  /**
   * This plugin is used to emit declaration files _only_. Its error reporting
   * UX is less than ideal, so we rely on vite-plugin-checker for type-checking.
   */
  config.plugins.push(typescriptPlugin({
    exclude: [TEST_FILES],
    compilerOptions: {
      // The user should have set either rootDir or baseUrl in their
      // tsconfig.json, but we actually need _both_ to be set to the same
      // value to ensure TypeScript compiles declarations properly.
      rootDir: srcDir,
      baseUrl: srcDir,
      // This plugin will issue a warning if this is set to any other value.
      // Because we are only using this plugin to output declaration files, this
      // setting has no effect on source output.
      module: 'esnext',
      // Ensure we only emit declaration files; all other source should be
      // processed by Vite/Rollup.
      emitDeclarationOnly: true,
      // Do not fail if an error is encountered; vite-plugin-checker will handle
      // error reporting.
      noEmitOnError: false,
      // If we have `config.build.sourcemap` set to `true`, this must also be
      // `true` or the plugin will issue a warning.
      sourceMap: config.build.sourcemap
    }
  }));


  // ----- Plugin: tsconfig-paths ----------------------------------------------

  /**
   * This plugin allows Rollup to resolve import/require specifiers in source
   * files using path mappings configured in tsconfig.json.
   *
   * Note: Because Vite does not process declaration files emitted by
   * TypeScript, we will need to resolve those import/export specifiers
   * separately.
   *
   * See: https://github.com/aleclarson/vite-tsconfig-paths
   */
  config.plugins.push(tsconfigPathsPlugin({ root }));


  // ----- Plugin: tsc-alias ---------------------------------------------------

  /**
   * This plugin is responsible for resolving and re-writing import/export
   * specifiers in emitted declaration files. Note that it _does_ scan the
   * entire output directory and will also re-write specifiers in emitted source
   * files, but this operation is redundant; source specifiers will have already
   * been re-written by tsconfig-paths (see above).
   *
   * See: https://github.com/justkey007/tsc-alias
   */
  config.plugins.push(tscAliasPlugin({
    configFile: tsConfigPath,
    debug: log.isLevelAtLeast('silly')
  }));


  // ----- Plugin: No Bundle ---------------------------------------------------

  /**
   * This plugin helps us preserve the directory structure of source files in
   * the output directory by skipping the "bundling" phase. This type of output
   * is ideal for a Node project; if the project winds up being used in an
   * application that runs in the browser, that project's compiler/build tool
   * can and should minify library code as part of its build process.
   *
   * See: https://github.com/ManBearTM/vite-plugin-no-bundle
   */
  config.plugins.push(noBundlePlugin({ root: srcDir }));


  // ----- Plugin: Preserve Shebangs -------------------------------------------

  /**
   * Rollup was not made to build CLIs that often have shebangs on line 1. As
   * such, it simply treats them as "dead code" and removes them. This results
   * in an application's "bin" script(s) failing to work property. This plugin
   * preserves shebangs in files that have them.
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


  // ----- Plugin: Checker -----------------------------------------------------

  const hasEslintConfig = eslintConfigResult.length > 0;

  /**
   * This plugin is responsible for type-checking and linting the project. It
   * runs each checker in a worker thread to speed up build times, and uses
   * nice overlays with the Vite dev server. However, it is not as configurable
   * as @rollup/plugin-typescript, so we still need the latter to properly
   * generate declaration files.
   *
   * See: https://github.com/fi3ework/vite-plugin-checker
   */
  config.plugins.push(checkerPlugin({
    typescript: true,
    eslint: hasEslintConfig && mode !== 'test'
      ? { lintCommand: `eslint "${SOURCE_FILES}"` }
      : false
  }));
});
