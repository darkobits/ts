import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import log from 'lib/log';

import type { ConfigurationFactory } from '@darkobits/nr';


export default (userConfig?: ConfigurationFactory): ConfigurationFactory => async context => {
  const { command, task, script, isCI } = context;


  // ----- Build: Babel Commands -----------------------------------------------

  const babelFlags = {
    extensions: EXTENSIONS_WITH_DOT.join(','),
    ignore: '**/*.d.ts',
    outDir: OUT_DIR,
    copyFiles: true,
    sourceMaps: true,
    deleteDirOnStart: true
  };

  command('babel', ['babel', [SRC_DIR], babelFlags], {
    prefix: chalk => chalk.bgYellow.black(' Babel ')
  });

  command('babel.watch', ['babel', [SRC_DIR], {
    ...babelFlags,
    watch: true,
    verbose: true
  }], {
    prefix: chalk => chalk.bgYellow.black(' Babel ')
  });


  // ----- Build: TypeScript Commands ------------------------------------------

  command('ts', ['ttsc', {
    emitDeclarationOnly: true,
    pretty: true
  }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    preserveArgumentCasing: true
  });

  command('ts.watch', ['ttsc', {
    emitDeclarationOnly: true,
    pretty: true,
    watch: true,
    preserveWatchOutput: true
  }], {
    prefix: chalk => chalk.bgBlue.white(' TS '),
    preserveArgumentCasing: true
  });


  // ----- Build: Misc. Commands -----------------------------------------------

  command('clean-out-dir', [
    'del', [`${OUT_DIR}/**/*.spec.*`, `${OUT_DIR}/**/*.test.*`]
  ]);


  // ----- Lint Commands -------------------------------------------------------

  const eslintFlags = {
    ext: EXTENSIONS_WITH_DOT.join(','),
    format: require.resolve('eslint-codeframe-formatter')
  };

  command.babel('eslint', ['eslint', [SRC_DIR], eslintFlags]);

  command.babel('eslint.fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


  // ----- Build Scripts -------------------------------------------------------

  script('build', {
    group: 'Build',
    description: 'Build, type-check, and lint the project using Babel, TypeScript, and ESLint.',
    timing: true,
    run: [
      ['cmd:babel', 'cmd:ts', 'cmd:eslint'],
      'cmd:clean-out-dir'
    ]
  });

  script('build.watch', {
    group: 'Build',
    description: 'Continuously build and type-check the project using Babel and TypeScript.',
    run: [
      ['cmd:babel.watch', 'cmd:ts.watch']
    ]
  });


  // ----- Testing Scripts -----------------------------------------------------

  script('test', {
    group: 'Test',
    description: 'Run unit tests using Jest.',
    timing: true,
    run: [
      command.babel('jest', ['jest'])
    ]
  });

  script('test.watch', {
    group: 'Test',
    description: 'Run unit tests using Jest in watch mode.',
    run: [
      command.babel('jest', ['jest', { watch: true }], {
        // This command involves user interaction so we need to use 'inherit'.
        execaOptions: { stdio: 'inherit' }
      })
    ]
  });

  script('test.coverage', {
    group: 'Test',
    description: 'Run unit tests using Jest and generate a coverage report.',
    timing: true,
    run: [
      command.babel('jest', ['jest', { coverage: true }])
    ]
  });


  // ----- Lint Scripts --------------------------------------------------------

  script('lint', {
    group: 'Lint',
    description: 'Lint the project using ESLint.',
    timing: true,
    run: ['cmd:eslint']
  });

  script('lint.fix', {
    group: 'Lint',
    description: 'Lint the project using ESLint and automatically fix any fixable errors.',
    timing: true,
    run: ['cmd:eslint.fix']
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
        command.babel(`standard-version-${releaseType ?? 'default'}`, [
          standardVersionCmd, { preset: require.resolve('config/changelog-preset'), ...args }
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
      command.node('npm-check-updates', ['npm-check-updates', { dep: 'prod,peer,dev' }], {
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
      'script:test',
      command.babel('update-notifier', [require.resolve('etc/scripts/update-notifier')])
    ]
  });


  if (typeof userConfig === 'function') {
    await userConfig(context);
  }
};
