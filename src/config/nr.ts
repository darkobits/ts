import { EOL } from 'node:os'

import chalk from 'chalk'
import IS_CI from 'is-ci'
import waitOn from 'wait-on'

import { EXTENSIONS } from '../etc/constants'
import log from '../lib/log'
import { getPackageContext, inferESLintConfigurationStrategy } from '../lib/utils'

import type { Thunk, UserConfigurationExport } from '@darkobits/nr'

export default (async ({ command, fn, script }) => {
  const { root, srcDir, packageJson } = await getPackageContext()

  /**
   * Gather any arguments provided after a "--"; these will be forwarded to
   * child processes started by a command.
   */
  const forwardArgs = process.argv.includes('--')
    ? process.argv.slice(process.argv.indexOf('--') + 1)
    : []

  // ----- Lint Scripts --------------------------------------------------------

  /**
   * We need to use || here because srcDir may be an empty string, in which case
   * we want to fall back to process.cwd(), and this will not happen with ??
   * because empty strings are not considered nullish.
   */
  const lintRoot = srcDir || process.cwd()

  /**
   * If the host project doesn't have an ESLint configuration file, we'll log
   * a warning and bail.
   */
  const noOpLintFn = fn(() => log.warn(chalk.dim('No-op; missing ESLint configuration file.')))

  /**
   * By default, use our no-op function as the default instruction for the
   * "lint" and "lint.fix" scripts.
   */
  let lintInstruction: Thunk = noOpLintFn
  let lintFixInstruction: Thunk = noOpLintFn

  const eslintFlags: Record<string, any> = { format: 'codeframe' }
  const eslintEnvVars: Record<string, string> = {}

  const eslintConfig = await inferESLintConfigurationStrategy(root)

  if (eslintConfig) {
    eslintFlags.config = eslintConfig.configFile

    if (eslintConfig.type === 'flat') {
      // Project is using the newer flat configuration format; we will need to
      // set the ESLINT_USE_FLAT_CONFIG environment variable in order for ESLint
      // to use it.
      log.info(
        chalk.green('script:lint'),
        `Using flat ESLint configuration via ${chalk.green(eslintConfig.configFile)}.`
      )
      eslintEnvVars.ESLINT_USE_FLAT_CONFIG = 'true'
    } else {
      // Project is using the legacy configuration format; we will need to
      // explicitly pass a list of extensions to lint.
      log.info(
        chalk.green('script:lint'),
        `Using legacy ESLint configuration via ${chalk.green(eslintConfig.configFile)}.`
      )
      eslintFlags.ext = EXTENSIONS.join(',')
    }

    // Overwrite the no-op instruction with our lint command.
    lintInstruction = command('eslint', {
      args: [lintRoot, eslintFlags],
      env: eslintEnvVars
    })

    // Overwrite the no-op instruction with our lint --fix command.
    lintFixInstruction = command('eslint', {
      args: [lintRoot, { ...eslintFlags, fix: true }],
      env: eslintEnvVars
    })
  } else {
    log.info(
      chalk.green('script:lint'),
      'Unable to determine ESLint configuration strategy; project may lack an ESLint configuration file.'
    )
  }

  script('lint', lintInstruction, {
    group: 'Lint',
    description: `Lint the project using ${chalk.white.bold('ESLint')}.`,
    timing: true
  })

  script('lint.fix', lintFixInstruction, {
    group: 'Lint',
    description: `Lint the project using ${chalk.white.bold('ESLint')} and automatically fix any fixable errors.`,
    timing: true
  })

  // ----- Build Scripts -------------------------------------------------------

  script('build', [[
    command('vite', {
      args: ['build'],
      env: eslintEnvVars
    }),
    'script:lint'
  ]], {
    group: 'Build',
    description: `Build, type-check, and lint the project using ${chalk.white.bold('Vite')}.`,
    timing: true
  })

  script('build.watch', command('vite', {
    args: ['build', { watch: true }],
    env: eslintEnvVars
  }), {
    group: 'Build',
    description: `Continuously build and type-check the project using ${chalk.white.bold('Vite')}.`
  })

  // ----- Testing Scripts -----------------------------------------------------

  script('test', command('vitest', {
    args: ['run', { passWithNoTests: true }],
    preserveArgumentCasing: true,
    env: eslintEnvVars
  }), {
    group: 'Test',
    description: `Run unit tests using ${chalk.white.bold('Vitest')}.`,
    timing: true
  })

  script('test.watch', command('vitest', {
    args: { ui: true, passWithNoTests: true },
    // This command involves user interaction so we need to use 'inherit'.
    stdio: 'inherit',
    env: eslintEnvVars,
    preserveArgumentCasing: true
  }), {
    group: 'Test',
    description: `Run unit tests using ${chalk.white.bold('Vitest')} in watch mode.`
  })

  script('test.coverage', command('vitest', {
    args: ['run', { coverage: true, passWithNoTests: true }],
    preserveArgumentCasing: true,
    env: eslintEnvVars
  }), {
    group: 'Test',
    description: `Run unit tests using ${chalk.white.bold('Vitest')} and generate a coverage report.`,
    timing: true
  })

  // ----- Release Scripts -----------------------------------------------------

  script('release', command('semantic-release', {
    args: {
      extends: '@darkobits/semantic-release-config'
    }
  }), {
    description: `Create a release in a CI environment using ${chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    timing: true
  })

  script('release.local', command('semantic-release', {
    args: {
      ci: false,
      extends: '@darkobits/semantic-release-config'
    }
  }), {
    description: `Create a release locally using ${chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    timing: true
  })

  // ----- Bump Scripts --------------------------------------------------------

  const standardVersionCmd = 'standard-version'

  interface CreateReleaseScriptOptions {
    releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta'
    description?: string
    args?: any
  }

  const createBumpScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
    script(releaseType ? `bump.${releaseType}` : 'bump', command(standardVersionCmd, {
      args: {
        // This will map to @darkobits/conventional-changelog-preset.
        // See: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-preset-loader
        // preset: '@darkobits/preset',
        releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
        ...args
      }
    }), {
      group: 'Bump',
      description: [[
        'Generate a change log entry and tagged commit for a',
        releaseType,
        `release using ${chalk.white.bold('standard-version')}.`
      ].filter(Boolean).join(' '), description].filter(Boolean).join(EOL),
      timing: true
    })
  }

  createBumpScript({
    description: 'The release type will be automatically computed by reviewing commits since the last release.'
  })

  createBumpScript({
    releaseType: 'first',
    args: { firstRelease: true }
  })

  createBumpScript({
    releaseType: 'major',
    args: { releaseAs: 'major' }
  })

  createBumpScript({
    releaseType: 'minor',
    args: { releaseAs: 'minor' }
  })

  createBumpScript({
    releaseType: 'patch',
    args: { releaseAs: 'patch' }
  })

  createBumpScript({
    releaseType: 'beta',
    args: { prerelease: 'beta' }
  })

  // ----- Dependency Management -----------------------------------------------

  script('deps.check', command('npm-check-updates', {
    args: {
      dep: 'prod,peer,dev',
      format: 'group,repo',
      interactive: true,
      // Run on the root package and any workspaces.
      root: true,
      // Only set this flag to true if package.json declares a "workspaces"
      // field. Otherwise, npm-check-updates will fail.
      workspaces: Reflect.has(packageJson, 'workspaces')
    },
    stdio: 'inherit',
    // This CLI exits with a non-zero code if the user issues a SIGTERM to quit
    // interactive mode without performing updates. This instructs Execa to
    // ignore that.
    reject: false
  }), {
    group: 'Dependency Management',
    description: `Check for newer versions of installed dependencies using ${chalk.white.bold('npm-check-updates')}.`
  })

  // ----- Lifecycles ----------------------------------------------------------

  // In CI environments, skip our usual prepare steps; users can will likely
  // need to build and test projects explicitly in such cases.
  script('prepare', IS_CI ? fn(() => log.info(
    chalk.green('script:prepare'),
    chalk.yellow(`CI environment detected. Skipping ${chalk.bold('prepare')} script.`)
  )) : [
    // N.B. By using strings to reference these scripts, we will always use the
    // most recent value from the registry, allowing downstream users to
    // overwrite them.
    'script:build',
    'script:test'
  ], {
    group: 'Lifecycle',
    description: '[hook] Run after "npm install" to ensure the project builds and tests are passing.',
    timing: !IS_CI
  })

  script('start', [[
    command('vite', {
      args: ['build', { watch: true, logLevel: 'error' }],
      preserveArgumentCasing: true,
      stdout: 'pipe',
      stderr: 'ignore'
    }),
    fn(async () => {
      const unscopedName = packageJson.name?.split('/').pop() ?? ''
      const entrypoint = packageJson.bin
        ? packageJson.bin[unscopedName]
        : packageJson.main

      if (!entrypoint) throw new Error('[script:start] No "bin" (string) or "main" declarations in package.json.')

      log.info(
        chalk.green('script:start'),
        chalk.gray('Using entrypoint:'),
        chalk.green(entrypoint)
      )

      /**
       * This will wait for our build artifacts to be completely written to disk
       * before proceeding.
       * See: https://github.com/jeffbski/wait-on
       */
      await waitOn({
        resources: [entrypoint],
        // How often to poll the filesystem for updates.
        interval: 10,
        // Stabilization time; how long we will wait after the resource becomes
        // available to report that it's ready. This lets us add a buffer to
        // allow the bundler to completely finish writing.
        window: 1000
      })

      // See: https://github.com/remy/nodemon#nodemon
      const nodemonCommandThunk = command('nodemon', {
        args:  [{ quiet: true, delay: 2 }, entrypoint, ...forwardArgs],
        stdio: 'inherit'
      })

      return nodemonCommandThunk()
    }, {
      name: 'nodemon'
    })
  ]], {
    group: 'Lifecycle',
    description: [
      `Starts ${chalk.bold.white('Vite')} and ${chalk.bold.white('nodemon')}, watching for`,
      'changes to build artifacts.'
    ].join(' ')
  })
}) satisfies UserConfigurationExport