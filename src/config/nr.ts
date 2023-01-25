import { EXTENSIONS } from '../etc/constants';
import log from '../lib/log';
import { getSourceAndOutputDirectories } from '../lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr';


export default (userConfig?: ConfigurationFactory): ConfigurationFactory => async context => {
  const { command, task, script, isCI } = context;
  const { srcDir, outDir } = await getSourceAndOutputDirectories();


  // ----- Build: TypeScript Commands ------------------------------------------

  const tsFlags = {
    build: true,
    pretty: true,
    preserveWatchOutput: true
  };

  command('ts', ['tsc', { ...tsFlags, verbose: true }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    preserveArgumentCasing: true
  });

  command('ts.watch', ['tsc', { ...tsFlags, watch: true }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    preserveArgumentCasing: true
  });

  command('tsc-alias', ['tsc-alias', { project: 'tsconfig.json' }]);

  command('tsc-alias.watch', ['tsc-alias', { project: 'tsconfig.json', watch: true }]);


  // ----- Build: Misc. Commands -----------------------------------------------

  const prepareOutDirCmd = outDir
    ? command('prepare-out-dir', [
      'del', [outDir]
    ])
    : undefined;

  const cleanOutDirCmd = outDir
     ? command('clean-out-dir', [
       'del', [`${outDir}/**/*.spec.*`, `${outDir}/**/*.test.*`]
     ])
    : undefined;


  if (!outDir) {
    log.verbose(log.prefix('ts'), 'Unable to create build commands; outDir was undefined.');
  }


  // ----- Lint Commands -------------------------------------------------------

  const eslintFlags = {
    ext: EXTENSIONS.join(','),
    format: 'codeframe'
  };

  if (srcDir) {
    command('eslint', ['eslint', [srcDir], eslintFlags]);

    command('eslint.fix', ['eslint', [srcDir], { ...eslintFlags, fix: true }]);
  } else {
    log.verbose(log.prefix('ts'), 'Unable to create ESLint commands; srcDir was undefined.');
  }


  // ----- Lint Scripts --------------------------------------------------------

  /**
   * Hacky way to produce some sort of output from ESLint because, by default,
   * it won't output anything if no errors are found.
   */
  const lintTimer = log.createTimer();

  task('eslint-log', () => {
    // eslint-disable-next-line no-console
    console.log(log.chalk.bgMagenta(' ESLint '), log.chalk.dim(`Done in ${lintTimer}.`));
  });

  script('lint', {
    group: 'Lint',
    description: 'Lint the project using ESLint.',
    // timing: true,
    run: [
      'cmd:eslint',
      'task:eslint-log'
    ]
  });

  script('lint.fix', {
    group: 'Lint',
    description: 'Lint the project using ESLint and automatically fix any fixable errors.',
    // timing: true,
    run: [
      'cmd:eslint.fix',
      'task:eslint-log'
    ]
  });


  // ----- Build Scripts -------------------------------------------------------

  script('build', {
    group: 'Build',
    description: 'Build, type-check, and lint the project using TypeScript and ESLint.',
    timing: true,
    // @ts-expect-error
    run: [
      prepareOutDirCmd,
      [
        'cmd:ts',
        'script:lint'
      ],
      [
        'cmd:tsc-alias',
        cleanOutDirCmd
      ].filter(Boolean)
    ].filter(Boolean)
  });

  script('build.watch', {
    group: 'Build',
    description: 'Continuously build and type-check the project.',
    // @ts-expect-error
    run: [
      prepareOutDirCmd,
      [
        'cmd:ts.watch',
        'cmd:tsc-alias.watch'
      ]
    ].filter(Boolean)
  });


  // ----- Testing Scripts -----------------------------------------------------

  script('test', {
    group: 'Test',
    description: 'Run unit tests using Vitest.',
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
    description: 'Run unit tests using Vitest in watch mode.',
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
    description: 'Run unit tests using Vitest and generate a coverage report.',
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
    description: 'Create a release in a CI environment using semantic-release.',
    group: 'Release',
    run: [
      command('semantic-release', ['semantic-release'])
    ]
  });

  script('release.local', {
    description: 'Create a release locally using semantic-release.',
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
      description: `Generate a change log entry and tagged commit for ${description}.`,
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
    description: 'Check for newer versions of installed dependencies.',
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
