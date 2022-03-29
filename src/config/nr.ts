import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';

import type { ConfigurationFactory } from '@darkobits/nr';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return async ({ command, script, task, isCI }) => {
    const commands: Record<string, any> = {};

    // ----- Build: Babel Commands ---------------------------------------------

    const babelFlags = {
      extensions: EXTENSIONS_WITH_DOT.join(','),
      ignore: '**/*.d.ts',
      outDir: OUT_DIR,
      copyFiles: true,
      sourceMaps: true,
      deleteDirOnStart: true
    };

    commands.babel = command('babel', ['babel', [SRC_DIR], babelFlags], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });

    commands.babel.watch = command('babel.watch', ['babel', [SRC_DIR], {
      ...babelFlags,
      watch: true,
      verbose: true
    }], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });


    // ----- Build: TypeScript Commands ----------------------------------------

    commands.ts = command('ts', ['ttsc', {
      // emitDeclarationOnly: true,
      pretty: true
    }], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });

    commands.ts.watch = command('ts.watch', ['ttsc', {
      // emitDeclarationOnly: true,
      pretty: true,
      watch: true,
      preserveWatchOutput: true
    }], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });


    // ----- Build: Misc. Commands ---------------------------------------------

    commands.cleanup = command('cleanup', [
      'del', [`${OUT_DIR}/**/*.spec.*`, `${OUT_DIR}/**/*.test.*`]
    ]);


    // ----- Lint Commands -----------------------------------------------------

    const eslintFlags = {
      ext: EXTENSIONS_WITH_DOT.join(','),
      format: require.resolve('eslint-codeframe-formatter')
    };

    commands.lint = command.babel('eslint', ['eslint', [SRC_DIR], eslintFlags]);

    commands.lint.fix = command.babel('eslint.fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


    // ----- Build Scripts -----------------------------------------------------

    script('build', {
      group: 'Build',
      description: 'Lint, type-check, and compile the project.',
      timing: true,
      run: [
        [commands.babel, commands.ts, commands.lint],
        commands.cleanup
      ]
    });

    script('build.watch', {
      group: 'Build',
      description: 'Continuously type-check, and compile the project.',
      run: [
        [commands.babel.watch, commands.ts.watch]
      ]
    });


    // ----- Testing Scripts ---------------------------------------------------

    script('test', {
      group: 'Test',
      description: 'Run unit tests.',
      timing: true,
      run: [
        command.babel('jest', ['jest'])
      ]
    });

    script('test.watch', {
      group: 'Test',
      description: 'Run unit tests in watch mode.',
      run: [
        command.node('jest', ['jest', { watch: true }], {
          // This command involves user interaction so we need to use 'inherit'.
          execaOptions: { stdio: 'inherit' }
        })
      ]
    });

    script('test.coverage', {
      group: 'Test',
      description: 'Run unit tests and generate a coverage report.',
      timing: true,
      run: [
        command.babel('jest', ['jest', { coverage: true }])
      ]
    });

    script('test.passWithNoTests', {
      group: 'Test',
      description: 'Run unit tests, but do not fail if no tests exist.',
      run: [
        command.babel('jest', ['jest', { passWithNoTests: true }], {
          preserveArguments: true
        })
      ]
    });


    // ----- Lint Scripts ------------------------------------------------------

    script('lint', {
      group: 'Lint',
      description: 'Lint the project.',
      timing: true,
      run: [commands.lint]
    });

    script('lint.fix', {
      group: 'Lint',
      description: 'Lint the project and automatically fix any fixable errors.',
      timing: true,
      run: [commands.lint.fix]
    });


    // ----- Release Scripts ---------------------------------------------------

    script('release', {
      description: 'Use semantic-release to create a release from a CI environment.',
      group: 'Release',
      run: [
        command('semantic-release', ['semantic-release'])
      ]
    });

    script('release.local', {
      description: 'Use semantic-release to create a release locally.',
      group: 'Release',
      run: [
        command('semantic-release', ['semantic-release', { ci: false }])
      ]
    });


    // ----- Bump Scripts ------------------------------------------------------

    const standardVersionCmd = 'standard-version';

    interface CreateReleaseScriptOptions {
      releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
      description: string;
      args?: any;
    }

    const createReleaseScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
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

    createReleaseScript({
      description: 'a release'
    });

    createReleaseScript({
      releaseType: 'beta',
      description: 'a beta release',
      args: { prerelease: 'beta' }
    });

    createReleaseScript({
      releaseType: 'first',
      description: 'the first release',
      args: { firstRelease: true }
    });

    createReleaseScript({
      releaseType: 'major',
      description: 'a major release',
      args: { releaseAs: 'major' }
    });

    createReleaseScript({
      releaseType: 'minor',
      description: 'a minor release',
      args: { releaseAs: 'minor' }
    });

    createReleaseScript({
      releaseType: 'patch',
      description: 'a patch release',
      args: { releaseAs: 'patch' }
    });


    // ----- Dependency Management ---------------------------------------------

    script('deps.check', {
      group: 'Dependency Management',
      description: 'Check for newer versions of installed dependencies.',
      run: [
        command.node('npm-check-updates', ['npm-check-updates', { peer: true }], {
          execaOptions: { stdio: 'inherit' }
        })
      ]
    });


    // ----- Lifecycles --------------------------------------------------------

    script('prepare', {
      group: 'Lifecycle',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      timing: true,
      run: isCI ? [] : [
        'script:build',
        'script:test.passWithNoTests',
        command.babel('update-notifier', [require.resolve('etc/scripts/update-notifier')])
      ]
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({
        command,
        script,
        task,
        isCI
      });
    }
  };
}
