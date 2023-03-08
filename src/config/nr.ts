import { EOL } from 'os';
import path from 'path';

import { EXTENSIONS } from '../etc/constants';
import log from '../lib/log';
import { getPackageContext, inferESLintConfigurationStrategy } from '../lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr';


export default (userConfig?: ConfigurationFactory): ConfigurationFactory => async context => {
  const { command, task, script, isCI } = context;
  const { srcDir, root } = await getPackageContext();


  // ----- Lint Scripts --------------------------------------------------------

  const eslintConfig = await inferESLintConfigurationStrategy(root);

  const eslintFlags: Record<string, any> = {
    format: 'codeframe'
  };

  const eslintEnvVars: Record<string, string> = {};

  if (eslintConfig) {
    eslintFlags.config = eslintConfig.configFile;

    if (eslintConfig.type === 'flat') {
      eslintEnvVars.ESLINT_USE_FLAT_CONFIG = 'true';
      log.silly(log.prefix('script:lint'), `Using flat ESLint configuration via ${log.chalk.green(eslintConfig.configFile)}.`);
    } else {
      eslintFlags.ext = EXTENSIONS.join(',');
      log.silly(log.prefix('script:lint'), `Using legacy ESLint configuration via ${log.chalk.green(eslintConfig.configFile)}.`);
    }
  } else {
    log.silly(log.prefix('script:lint'), 'Unable to determine ESLint configuration strategy.');
  }

  /**
   * We need to use || here because srcDir may be an empty string, in which case
   * we want to fall back to process.cwd(), and this will not happen with ??
   * because empty strings are not considered nullish.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const lintRoot = srcDir || process.cwd();

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
      command('eslint', ['eslint', [lintRoot], eslintFlags], {
        execaOptions: {
          env: eslintEnvVars
        }
      }),
      'task:eslint-log'
    ]
  });

  script('lint.fix', {
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')} and automatically fix any fixable errors.`,
    // timing: true,
    run: [
      command('eslint.fix', ['eslint', [lintRoot], { ...eslintFlags, fix: true }]),
      'task:eslint-log'
    ]
  });


  // ----- Build Scripts -------------------------------------------------------

  script('build', {
    group: 'Build',
    description: `Build, type-check, and lint the project using ${log.chalk.white.bold('Vite')}.`,
    timing: true,
    run: [
      command('vite-build', ['vite', ['build']], {
        execaOptions: {
          env: {
            ...eslintEnvVars
          }
        }
      })
    ]
  });

  script('build.watch', {
    group: 'Build',
    description: `Continuously build and type-check the project using ${log.chalk.white.bold('Vite')}.`,
    run: [
      command('vite-build-watch', ['vite', ['build'], { watch: true }], {
        execaOptions: {
          env: {
            ...eslintEnvVars
          }
        }
      })
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
        preserveArgumentCasing: true,
        execaOptions: {
          env: {
            ...eslintEnvVars
          }
        }
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
          stdio: 'inherit',
          env: {
            ...eslintEnvVars
          }
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
        preserveArgumentCasing: true,
        execaOptions: {
          env: {
            ...eslintEnvVars
          }
        }
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
    description?: string;
    args?: any;
  }

  const createBumpScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
    script(releaseType ? `bump.${releaseType}` : 'bump', {
      group: 'Bump',
      description: [
        `Generate a change log entry and tagged commit for a ${releaseType} release using ${log.chalk.white.bold('standard-version')}.`,
        description
      ].filter(Boolean).join(EOL),
      run: [
        command(`standard-version-${releaseType ?? 'default'}`, [
          standardVersionCmd, {
            preset: path.resolve(__dirname, 'changelog-preset.js'),
            releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
            ...args
          }
        ])
      ]
    });
  };

  createBumpScript({
    description: 'The release type will be automatically computed by reviewing commits since the last release.'
  });

  createBumpScript({
    releaseType: 'first',
    args: { firstRelease: true }
  });

  createBumpScript({
    releaseType: 'major',
    args: { releaseAs: 'major' }
  });

  createBumpScript({
    releaseType: 'minor',
    args: { releaseAs: 'minor' }
  });

  createBumpScript({
    releaseType: 'patch',
    args: { releaseAs: 'patch' }
  });

  createBumpScript({
    releaseType: 'beta',
    args: { prerelease: 'beta' }
  });


  // ----- Dependency Management -----------------------------------------------

  script('deps.check', {
    group: 'Dependency Management',
    description: `Check for newer versions of installed dependencies using ${log.chalk.white.bold('npm-check-updates')}.`,
    run: [
      command('npm-check-updates', ['npm-check-updates', {
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
