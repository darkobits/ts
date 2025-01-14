import path from 'node:path'

import { interopImportDefault } from '@darkobits/interop-import-default'
import typescriptPlugin from '@rollup/plugin-typescript'
import chalk from 'chalk'
import glob from 'fast-glob'
// @ts-expect-error - Package has no type definitions.
import preserveShebangPlugin from 'rollup-plugin-preserve-shebang'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPathsPluginExport from 'vite-tsconfig-paths'

import { BARE_EXTENSIONS, TEST_FILE_PATTERNS } from '../etc/constants'
import cleanupPlugin from '../lib/cleanup-plugin'
import executablePlugin from '../lib/executable-plugin'
import log from '../lib/log'
import { nodeExternalPlugin } from '../lib/node-external-plugin'
import tscAliasPlugin from '../lib/tsc-alias-plugin'
import { createViteConfigurationPreset } from '../lib/utils'

const tsconfigPathsPlugin = interopImportDefault(tsconfigPathsPluginExport)

/**
 * Hacky way to determine if we are in watch mode, in which case we want to
 * change the behavior of certain plugins.
 */
const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w')

/**
 * Vite configuration preset suitable for libraries, CLIs, or simple Node
 * applications.
 *
 * - Source files will not be bundled.
 * - Dependencies will be externalized.
 * - Output format (CJS or ESM) will be inferred from the `type` field in
 *   `package.json`.
 * - Source and output directories will be inferred from `tsconfig.json`.
 * - Shebangs will be preserved in files that have them.
 * - Any other files in the source directory will be copied to the output
 *   directory as-is, similar to Babel's `copyFiles` feature.
 */
export const node = createViteConfigurationPreset(async context => {
  const prefix = chalk.dim.cyan('preset:node')

  log.isReady()
  // console.log('logger is ready')

  // ----- Preflight Checks ----------------------------------------------------

  const { command, mode, root, srcDir, outDir, patterns: { SOURCE_FILES, TEST_FILES } } = context

  // It does not make sense to use 'vite serve' with this preset, so issue a
  // warning and terminate the build when this command is used. However, Vitest
  // invokes Vite with the 'serve' command, so handle that case by checking
  // `mode`.
  if (command === 'serve' && mode !== 'test') {
    log.error(prefix, `The ${chalk.white('serve')} command is not available when using the ${chalk.cyan('node')} preset.`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }

  const [
    // Array of all source files. To prevent bundling, we tell Rollup that each
    // file in the project should be treated as its own entrypoint.
    entry,
    // Array of all files in the source directory other than source code.
    filesToCopy
    // Whether the user has an ESLint configuration file. If not, we skip adding
    // the ESLint plugin to the build.
    // eslintConfigResult
  ] = await Promise.all([
    glob(SOURCE_FILES, { cwd: root, ignore: [TEST_FILES] }),
    glob([`${srcDir}/**/*`, `!${SOURCE_FILES}`, `!${TEST_FILES}`], { cwd: root })
  ])

  // User forgot to write any code or did not set up paths correctly in
  // tsconfig.json.
  if (entry.length === 0) {
    log.error(prefix, `No entry files found in ${chalk.green(srcDir)}.`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }

  // ----- Build Configuration -------------------------------------------------

  const { config, packageJson } = context

  const packageType = packageJson.type === 'module'
    ? 'EXPLICIT_ESM'
    : packageJson.type === 'commonjs'
      ? 'EXPLICIT_CJS'
      : !packageJson.type
        ? 'IMPLICIT_CJS'
        : 'INVALID'

  config.build = {
    // Use the inferred output directory defined in tsconfig.json.
    outDir,
    emptyOutDir: true,
    // We don't need to minify this kind of project.
    minify: false,
    sourcemap: true,
    lib: {
      entry,
      fileName: '[name]',
      // Infer output format based on the "type" setting in package.json.
      formats: packageType === 'EXPLICIT_ESM' ? ['es'] : ['cjs']
    },
    rollupOptions: {
      logLevel: 'silent',
      output: {
        preserveModules: true,
        preserveModulesRoot: srcDir
      }
    }
  }

  const packageTypeLabel: Record<typeof packageType, string> = {
    IMPLICIT_CJS: 'cjs',
    EXPLICIT_CJS: 'cjs',
    EXPLICIT_ESM: 'esm',
    INVALID: ''
  }

  if (command === 'build') {
    process.stdout.write('\n')
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await log.info(prefix, [
      chalk.green(path.parse(srcDir).name),
      chalk.whiteBright('→'),
      chalk.green(path.parse(outDir).name),
      `${chalk.gray('as')} ${chalk.green(packageTypeLabel[packageType])}`,
      isWatchMode && `${chalk.gray('watch:')}${chalk.green('true')}`
    ].filter(Boolean).join(' '))
    process.stdout.write('\n')
  }

  // ----- Vitest Configuration ------------------------------------------------

  config.test = {
    name: packageJson.name,
    root,
    include: [TEST_FILES],
    deps: {
      // Automatically fixes default imports of modules where the intended value
      // is on an object on the `default` property.
      interopDefault: true
    },
    coverage: {
      all: true,
      // Files to be considered as source when computing coverage. Vitest
      // requires paths relative to the configured root, and entry files are
      // already resolved to absolute paths. This un-resolves them to relative
      // paths.
      include: entry.map(entry => path.relative(root, entry))
    }
  }

  // ----- Plugin: TypeScript --------------------------------------------------

  /**
   * This plugin is used to emit declaration files and type-check the project.
   * In watch mode, it will issue a warning when it encounters an error so as to
   * not terminate the process. Otherwise, it will fail the build.
   */
  config.plugins.push(typescriptPlugin({
    // Ensures we don't emit declarations for test files.
    exclude: [`**/*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`],
    // If TypeScript sees .ts files in the project root (configuration files,
    // for example) it will assume that they need to be compiled and use the
    // project root as a reference for the directory structure it needs to
    // create in the output folder. To prevent this, specify the configured
    // source folder as the root of the compilation.
    filterRoot: srcDir,
    compilerOptions: {
      baseUrl: srcDir,
      // Ensure we only emit declaration files; all other source should be
      // processed by Vite/Rollup.
      emitDeclarationOnly: true,
      // Only fail the compilation on type-errors when building for production.
      // This prevents things like Vitest from failing when in watch mode due to
      // trivial errors like a variable not being used, etc.
      noEmitOnError: !isWatchMode && mode === 'production',
      // This MUST be set to the same value as config.build.sourcemap or the
      // plugin will throw an error.
      sourceMap: config.build.sourcemap,
      // The plugin will issue a warning if this is set a value other than
      // 'ESNext'. Because we are only using it to emit declaration files, this
      // setting has no effect on Rollup's output.
      module: 'ESNext'
    }
  }))

  // ----- Plugin: tsconfig-paths ----------------------------------------------

  /**
   * This plugin allows Rollup to resolve import/require specifiers in source
   * files using the path mappings configured in tsconfig.json.
   *
   * See: https://github.com/aleclarson/vite-tsconfig-paths
   */
  config.plugins.push(tsconfigPathsPlugin({ root }))

  // ----- Plugin: tsc-alias ---------------------------------------------------

  const { tsConfigPath } = context

  /**
   * Rollup does not resolve (and by extension, re-write) import/export
   * specifiers in declaration files, so those custom path mappings have to be
   * re-written separately. This plugin addresses that issue by running
   * tsc-alias after Rollup has written the bundle.
   *
   * See:
   * - https://github.com/justkey007/tsc-alias
   */
  config.plugins.push(tscAliasPlugin({ configFile: tsConfigPath }))

  // ----- Plugin: Node Externals ----------------------------------------------

  /**
   * Ensures modules from node_modules are not bundled with output.
   */
  config.plugins.push(nodeExternalPlugin({ root }))

  // ----- Plugin: Preserve Shebangs -------------------------------------------

  /**
   * CLIs often make use of a shebang on the first line to indicate the location
   * of the binary needed to execute it. Rollup strips shebangs by default.This
   * plugin ensures they are preserved.
   *
   * See: https://github.com/developit/rollup-plugin-preserve-shebang
   */
  config.plugins.push(preserveShebangPlugin())

  // ----- Plugin: Executable --------------------------------------------------

  /**
   * This plugin determines if the project has defined any executable scripts
   * by introspecting its package.json. If the project has any "bin" scripts,
   * they will be given an executable flag.
   */
  config.plugins.push(executablePlugin())

  // ----- Plugin: Copy Files --------------------------------------------------

  /**
   * This plugin will copy all non-source files (excluding test files, and
   * preserving directory structure) from `srcDir` to `outDir`. This is designed
   * to mimic Babel's `copyFiles` option.
   */
  if (filesToCopy.length > 0) {
    config.plugins.push(viteStaticCopy({
      targets: filesToCopy.map(filePath => {
        // Produces something like 'src/foo/bar/baz.ts'.
        const src = path.relative(root, filePath)
        // Produces something like 'foo/bar'.
        const dest = path.dirname(src).split(path.sep).slice(1).join(path.sep)
        return { src, dest }
      })
    }))
  }

  // ----- [Plugin] Cleanup ----------------------------------------------------

  config.plugins.push(cleanupPlugin({
    // Only scan the output directory for offending files.
    root: outDir,
    // Removes empty .js files created when .ts files only export types.
    removeEmptyChunks: true
  }))
})