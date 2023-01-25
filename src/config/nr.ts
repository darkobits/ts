import path from 'path';

import {
  EXTENSIONS,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import log from 'lib/log';
import { getPackageInfo } from 'lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr';


export default (userConfig?: ConfigurationFactory): ConfigurationFactory => async context => {
  const { command, task, script, isCI } = context;


  // ----- Build: TypeScript Commands ------------------------------------------

  const tsFlags = {
    outDir: OUT_DIR,
    declaration: true,
    pretty: true,
    preserveWatchOutput: true
  };

  command('ts', ['tsc', tsFlags], {
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

  command('prepare-out-dir', [
    'del', [OUT_DIR]
  ]);

  command('clean-out-dir', [
    'del', [`${OUT_DIR}/**/*.spec.*`, `${OUT_DIR}/**/*.test.*`]
  ]);


  // ----- Lint Commands -------------------------------------------------------

  const eslintFlags = {
    ext: EXTENSIONS.join(','),
    format: 'codeframe'
  };

  command('eslint', ['eslint', [SRC_DIR], eslintFlags]);

  command('eslint.fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


  // ----- Build Scripts -------------------------------------------------------

  script('build', {
    group: 'Build',
    description: 'Build, type-check, and lint the project using TypeScript and ESLint.',
    timing: true,
    run: [
      [
        'cmd:prepare-out-dir',
        'cmd:eslint'
      ],
      'cmd:ts',
      'cmd:tsc-alias',
      'cmd:clean-out-dir'
    ]
  });

  script('build.watch', {
    group: 'Build',
    description: 'Continuously build and type-check the project.',
    run: [
      'cmd:prepare-out-dir',
      ['cmd:ts.watch', 'cmd:tsc-alias.watch']
    ]
  });


  // ----- Testing Scripts -----------------------------------------------------

  script('test', {
    group: 'Test',
    description: 'Run unit tests using Vitest.',
    timing: true,
    run: [
      command('vitest', ['vitest', ['run']])
    ]
  });

  script('test.watch', {
    group: 'Test',
    description: 'Run unit tests using Vitest in watch mode.',
    run: [
      command('vitest-watch', ['vitest', { ui: true }], {
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
    timing: true,
    run: [
      command('vitest-coverage', ['vitest', ['run'], { coverage: true }])
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
      'script:test',
      command('update-notifier', ['ts-node', [
        '--require', 'tsconfig-paths/register',
        require.resolve('etc/scripts/update-notifier')
      ]])
    ]
  });


  // ----- Miscellaneous Scripts -----------------------------------------------

  script('bin', {
    group: 'Other',
    description: 'Run the project\'s main executable script. Any arguments passed after "--" will be forwarded to the script.',
    run: [
      task('bin', async () => {
        const pkg = await getPackageInfo();
        if (!pkg) return log.error(log.prefix('bin'), 'Unable to find a package.json.');
        if (!pkg.json.bin) return log.error(log.prefix('bin'), 'Package does not define any binaries.');

        // N.B. Even if the package defines its binary in string form,
        // normalization means we will always get "bin" in object form.
        const [binName, binPath] = Object.entries(pkg.json.bin as Record<string, string>)[0];
        const args = process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [];
        const cmd = command.node('bin', [path.resolve(binPath), args]);

        log.info(log.prefix('bin'), `Executing ${log.chalk.bold(binName)} at ${log.chalk.green(binPath)}.`);
        await cmd();
      })
    ]
  });


  if (typeof userConfig === 'function') {
    await userConfig(context);
  }
};
