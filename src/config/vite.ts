// import commonJsPlugin from '@rollup/plugin-commonjs';
import typescriptPlugin from '@rollup/plugin-typescript';
import glob from 'fast-glob';
import eslintPluginExport from 'vite-plugin-eslint';
// @ts-expect-error - Package has no type definitions.
import noBundlePluginExport from 'vite-plugin-no-bundle';
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
 * Vite configuration preset suitable for publishing libraries to NPM.
 *
 * - Source files will not be bundled.
 * - `node_modules` will be externalized
 * - Output format (CJS or ESM) will be inferred from the `type` field in
 *   `package.json`.
 * - Source and output directories will be inferred from `tsconfig.json`.
 */
export const library = createViteConfigurationPreset(async context => {
  // Compute entries.
  const entry = await glob(`${context.srcDir}/**/*.{${BARE_EXTENSIONS.join(',')}}`, {
    cwd: context.root,
    ignore: [`**/*.{${TEST_FILE_PATTERNS.join(',')}}.*`]
  });

  if (entry.length === 0) throw new Error(`[vite-config] No suitable entries found in ${context.srcDir}`);

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
        include: [
          `${context.srcDir}/**/*.{${BARE_EXTENSIONS.join(',')}}`
        ]
      },
      include: [
        `${context.srcDir}/**/*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`
      ]
    },
    plugins: [
      // commonJsPlugin({
      //   sourceMap
      //   // esmExternals: true,
      //   // requireReturnsDefault: true,
      //   // defaultIsModuleExports: 'auto'
      // }),
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
        compilerOptions: {
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
        include: [`${context.srcDir}/**`]
      })
    ]
  };
});
