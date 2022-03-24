import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';

import type { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return async ({
    createCommand,
    createNodeCommand,
    createBabelNodeCommand,
    createScript,
    isCI
  }) => {
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

    commands.babel = createCommand('babel', ['babel', [SRC_DIR], babelFlags], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });

    commands.babel.watch = createCommand('babel.watch', ['babel', [SRC_DIR], {
      ...babelFlags,
      watch: true,
      verbose: true
    }], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });


    // ----- Build: TypeScript Commands ----------------------------------------

    const tsFlags = {
      pretty: true
    };

    commands.ts = createCommand('ts', ['ttsc', {
      ...tsFlags,
      emitDeclarationOnly: true
    }], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });

    commands.ts.watch = createCommand('ts.watch', ['ttsc', {
      ...tsFlags,
      emitDeclarationOnly: true,
      watch: true,
      preserveWatchOutput: true
    }], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });


    // ----- Build: Misc. Commands ---------------------------------------------

    commands.cleanup = createCommand('cleanup', [
      'del', [`${OUT_DIR}/**/*.spec.*`, `${OUT_DIR}/**/*.test.*`]
    ]);


    // ----- Lint Commands -----------------------------------------------------

    const eslintFlags = {
      ext: EXTENSIONS_WITH_DOT.join(','),
      format: require.resolve('eslint-codeframe-formatter')
    };

    commands.lint = createBabelNodeCommand('eslint', ['eslint', [SRC_DIR], eslintFlags]);

    commands.lint.fix = createBabelNodeCommand('eslint.fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


    // ----- Build Scripts -----------------------------------------------------

    createScript('build', {
      group: 'Build',
      description: 'Lint, type-check, and compile the project.',
      timing: true,
      run: [
        [commands.babel, commands.ts, commands.lint],
        commands.cleanup
      ]
    });

    createScript('build.watch', {
      group: 'Build',
      description: 'Continuously type-check, and compile the project.',
      run: [
        [commands.babel.watch, commands.ts.watch]
      ]
    });


    // ----- Testing Scripts ---------------------------------------------------

    createScript('test', {
      group: 'Test',
      description: 'Run unit tests.',
      timing: true,
      run: [
        createBabelNodeCommand('jest', ['jest'])
      ]
    });

    createScript('test.watch', {
      group: 'Test',
      description: 'Run unit tests in watch mode.',
      run: [
        createBabelNodeCommand('jest', ['jest', { watch: true }], {
          // This command involves user interaction so we need to use 'inherit'.
          execaOptions: { stdio: 'inherit' }
        })
      ]
    });

    createScript('test.coverage', {
      group: 'Test',
      description: 'Run unit tests and generate a coverage report.',
      timing: true,
      run: [
        createBabelNodeCommand('jest', ['jest', { coverage: true }])
      ]
    });

    createScript('test.passWithNoTests', {
      group: 'Test',
      description: 'Run unit tests, but do not fail if no tests exist.',
      run: [
        createBabelNodeCommand('jest', ['jest', { passWithNoTests: true }], {
          preserveArguments: true
        })
      ]
    });


    // ----- Lint Scripts ------------------------------------------------------

    createScript('lint', {
      group: 'Lint',
      description: 'Lint the project.',
      timing: true,
      run: [commands.lint]
    });

    createScript('lint.fix', {
      group: 'Lint',
      description: 'Lint the project and automatically fix any fixable errors.',
      timing: true,
      run: [commands.lint.fix]
    });


    // ----- Release Scripts ---------------------------------------------------

    createScript('release', {
      description: 'Use semantic-release to create a release from a CI environment.',
      group: 'Release',
      run: [
        createCommand('semantic-release', ['semantic-release'])
      ]
    });

    createScript('release.local', {
      description: 'Use semantic-release to create a release locally.',
      group: 'Release',
      run: [
        createCommand('semantic-release', ['semantic-release', { ci: false }])
      ]
    });


    // ----- Dependency Management ---------------------------------------------

    createScript('deps.check', {
      group: 'Dependency Management',
      description: 'Check for newer versions of installed dependencies.',
      run: [
        createNodeCommand('npm-check-updates', ['npm-check-updates', { peer: true }], {
          execaOptions: { stdio: 'inherit' }
        })
      ]
    });


    // ----- Lifecycles --------------------------------------------------------

    createScript('prepare', {
      group: 'Lifecycle',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      timing: true,
      run: isCI ? [] : [
        'script:build',
        'script:test.passWithNoTests',
        createBabelNodeCommand('update-notifier', [require.resolve('etc/scripts/update-notifier')])
      ]
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({
        createCommand,
        createNodeCommand,
        createBabelNodeCommand,
        createScript,
        isCI
      });
    }
  };
}
