import { EXTENSIONS } from '../etc/constants';
import log from '../lib/log';
import { getSourceAndOutputDirectories } from '../lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr';


export default (userConfig?: ConfigurationFactory): ConfigurationFactory => async context => {
  const { command, task, script, isCI } = context;
  const { srcDir, outDir, tsConfigPath } = await getSourceAndOutputDirectories();

  // ----- Build: Misc. Commands -----------------------------------------------

  /**
   * If an output directory has been defined in the host project's
   * tsconfig.json, create a command that will delete it. Otherwise, create a
   * task that will log a warning letting the user know that no output directory
   * has been defined.
   */
  const prepareOutDir = outDir
    ? command('prepare-out-dir', [
      'del', [outDir]
    ])
    : task('prepare-out-dir-warning', () => {
      log.warn(log.prefix('build'), 'Unable to remove output directory on build start; "compilerOptions.outDir" is not defined in tsconfig.json.');
    });


  /**
   * If an output directory has been defined in the host project's
   * tsconfig.json, create a command that will remove test files from the output
   * directory. Otherwise, create a task that will log a warning letting the
   * user know that no output directory has been defined.
   */
  const cleanOutDir = outDir
     ? command('clean-out-dir', [
       'del', [`${outDir}/**/*.spec.*`, `${outDir}/**/*.test.*`]
     ])
    : task('clean-out-dir-warning', () => {
      log.warn(log.prefix('build'), 'Unable to clean-up output directory after build; "compilerOptions.outDir" is not defined in tsconfig.json.');
    });


  /**
   * The TypeScript compiler will re-write paths in output source code, but not
   * declaration files. To re-write paths in declaration files, we run
   * `tsc-alias` after the build finishes.
   *
   * See: https://github.com/justkey007/tsc-alias
   */
  command('tsc-alias', ['tsc-alias', { project: tsConfigPath }]);


  /**
   * The TypeScript compiler does not add `module.exports = ` for default
   * exports when compiling to CommonJS. `ts-add-module-exports` adds this to
   * output files as-needed.
   *
   * See: https://github.com/brieb/ts-add-module-exports
   */
  command('ts-add-module-exports', ['ts-add-module-exports']);


  // ----- Build: TypeScript Commands ------------------------------------------

  // Common flags for the TypeScript compiler.
  const tsFlags = {
    build: true,
    pretty: true,
    preserveWatchOutput: true
  };

  command('tsc', ['tsc', { ...tsFlags, verbose: true }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    // The TypeScript compiler expects arguments in camelCase.
    preserveArgumentCasing: true
  });

  /**
   * `ts-watch` is a wrapper around the TypeScript compiler that allows us to
   * execute a command each time the project is successfully re-built. This
   * allows us to run `tsc-alias` and `ts-add-module-exports` in watch mode.
   *
   * See: https://github.com/gilamran/tsc-watch
   */
  command('tsc-watch', ['tsc-watch', {
    // tsc-watch has an awkward API; it supports a superset of the TypeScript
    // compiler's arguments, but for some reason requires us to use this
    // argument instead of TypeScript's native `preserveWatchOutput` in order to
    // prevent clearing the console in watch mode.
    noClear: true,
    // On each successful re-build, run our post-build script.
    onSuccess: 'npx nr build-post-process'
  }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    // tsc-watch, like the TypeScript compiler, expects arguments in camelCase.
    preserveArgumentCasing: true
  });


  // ----- Lint Commands -------------------------------------------------------

  const eslintFlags = {
    ext: EXTENSIONS.join(','),
    format: 'codeframe'
  };

  /**
   * We need to use || here because srcDir may be an empty string, in which case
   * we want to fall back to process.cwd(), and this will not happen with ??
   * because empty strings are not considered nullish.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const lintRoot = srcDir || process.cwd();

  command('eslint', ['eslint', [lintRoot], eslintFlags]);

  command('eslint.fix', ['eslint', [lintRoot], { ...eslintFlags, fix: true }]);


  // ----- Lint Scripts --------------------------------------------------------

  /**
   * Hacky way to produce some sort of output from ESLint because, by default,
   * ESLint won't output anything if no errors are found.
   */
  const lintTimer = log.createTimer();

  task('eslint-log', () => {
    // eslint-disable-next-line no-console
    console.log(log.chalk.bgMagenta(' ESLint '), log.chalk.dim(`Done in ${lintTimer}.`));
  });

  script('lint', {
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')}.`,
    run: [
      'cmd:eslint',
      'task:eslint-log'
    ]
  });

  script('lint.fix', {
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')} and automatically fix any fixable errors.`,
    // timing: true,
    run: [
      'cmd:eslint.fix',
      'task:eslint-log'
    ]
  });


  // ----- Build Scripts -------------------------------------------------------

  script('build', {
    group: 'Build',
    description: `Build, type-check, and lint the project using ${log.chalk.white.bold('TypeScript')} and ${log.chalk.white.bold('ESLint')}.`,
    timing: true,
    run: [
      prepareOutDir,
      [
        'cmd:tsc',
        'script:lint'
      ],
      'script:build-post-process'
    ]
  });

  script('build.watch', {
    group: 'Build',
    description: `Continuously build and type-check the project using ${log.chalk.white.bold('TypeScript')}.`,
    run: [
      prepareOutDir,
      'cmd:tsc-watch'
    ]
  });

  /**
   * Note: This script is intentionally named so as to _not_ trigger `nr`'s
   * pre/post script behavior.
   */
  script('build-post-process', {
    group: 'Build',
    description: `Executes ${log.chalk.white.bold('ts-add-module-exports')} and ${log.chalk.white.bold('tsc-alias')} on output files.`,
    run: [
      [
        cleanOutDir,
        'cmd:ts-add-module-exports',
        'cmd:tsc-alias'
      ]
    ]
  });


  // ----- Testing Scripts -----------------------------------------------------

  script('test', {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')}.`,
    run: [
      command('vitest', ['vitest', ['run'], {
        passWithNoTests: true
      }], {
        preserveArgumentCasing: true
      })
    ]
  });

  script('test.watch', {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} in watch mode.`,
    run: [
      command('vitest-watch', ['vitest', {
        ui: true,
        passWithNoTests: true
      }], {
        preserveArgumentCasing: true,
        execaOptions: {
          // This command involves user interaction so we need to use 'inherit'.
          stdio: 'inherit'
        }
      })
    ]
  });

  script('test.coverage', {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} and generate a coverage report.`,
    run: [
      command('vitest-coverage', ['vitest', ['run'], {
        coverage: true,
        passWithNoTests: true
      }], {
        preserveArgumentCasing: true
      })
    ]
  });


  // ----- Release Scripts -----------------------------------------------------

  script('release', {
    description: `Create a release in a CI environment using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    run: [
      command('semantic-release', ['semantic-release'])
    ]
  });

  script('release.local', {
    description: `Create a release locally using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    run: [
      command('semantic-release', ['semantic-release', { ci: false }])
    ]
  });


  // ----- Bump Scripts --------------------------------------------------------

  const standardVersionCmd = 'standard-version';

  interface CreateReleaseScriptOptions {
    releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
    description: string;
    args?: any;
  }

  const createBumpScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
    script(releaseType ? `bump.${releaseType}` : 'bump', {
      group: 'Bump',
      description: `Generate a change log entry and tagged commit for ${description} using ${log.chalk.white.bold('standard-version')}.`,
      run: [
        command(`standard-version-${releaseType ?? 'default'}`, [
          standardVersionCmd, { preset: require.resolve('./changelog-preset'), ...args }
        ])
      ]
    });
  };

  createBumpScript({
    description: 'a release'
  });

  createBumpScript({
    releaseType: 'beta',
    description: 'a beta release',
    args: { prerelease: 'beta' }
  });

  createBumpScript({
    releaseType: 'first',
    description: 'the first release',
    args: { firstRelease: true }
  });

  createBumpScript({
    releaseType: 'major',
    description: 'a major release',
    args: { releaseAs: 'major' }
  });

  createBumpScript({
    releaseType: 'minor',
    description: 'a minor release',
    args: { releaseAs: 'minor' }
  });

  createBumpScript({
    releaseType: 'patch',
    description: 'a patch release',
    args: { releaseAs: 'patch' }
  });


  // ----- Dependency Management -----------------------------------------------

  script('deps.check', {
    group: 'Dependency Management',
    description: `Check for newer versions of installed dependencies using ${log.chalk.white.bold('npm-check-updates')}.`,
    run: [
      command.node('npm-check-updates', ['npm-check-updates', {
        dep: 'prod,peer,dev',
        format: 'group',
        interactive: true
      }], {
        execaOptions: { stdio: 'inherit' }
      })
    ]
  });


  // ----- Lifecycles ----------------------------------------------------------

  script('prepare', {
    group: 'Lifecycle',
    description: 'Run after "npm install" to ensure the project builds and tests are passing.',
    timing: true,
    run: isCI ? [
      // Don't run our prepare script in CI environments, giving consumers
      // the granularity to build and/or test their project in discreet steps.
      task('skip-prepare', () => {
        log.info(log.prefix('prepare'), [
          'CI environment detected.',
          `Skipping ${log.chalk.bold.green('prepare')} script.`
        ].join(' '));
      })
    ] : [
      'script:build',
      'script:test'
    ]
  });

  if (typeof userConfig === 'function') {
    await userConfig(context);
  }
};
