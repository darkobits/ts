import { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';
import IS_CI from 'is-ci';

import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import {
  prefixBin,
  // skipIfCiNpmLifecycle,
  // TODO: Move this to nr.
  getNpmInfo
} from 'lib/utils';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return async ({ createCommand, createScript }) => {
    // ----- Build: Babel Commands ---------------------------------------------

    const babelArgs = {
      _: [SRC_DIR],
      extensions: EXTENSIONS_WITH_DOT.join(','),
      ignore: '**/*.d.ts',
      outDir: OUT_DIR,
      copyFiles: true,
      sourceMaps: true,
      deleteDirOnStart: true
    };

    createCommand({
      name: 'babel',
      command: prefixBin('babel'),
      arguments: babelArgs,
      prefix: chalk => chalk.bgYellow.black('Babel')
    });

    createCommand({
      name: 'babel.watch',
      command: prefixBin('babel'),
      arguments: {
        ...babelArgs,
        watch: true,
        verbose: true
      },
      prefix: chalk => chalk.bgYellow.black('Babel')
    });


    // ----- Build: TypeScript Commands ----------------------------------------

    const tsArgs = {
      pretty: true
    };

    createCommand({
      name: 'ts',
      command: prefixBin('ttsc'),
      arguments: {
        ...tsArgs,
        emitDeclarationOnly: true
      },
      preserveArguments: true,
      prefix: chalk => chalk.bgBlue.white('TS')
    });

    createCommand({
      name: 'ts.watch',
      command: prefixBin('ttsc'),
      arguments: {
        pretty: true,
        emitDeclarationOnly: true,
        watch: true,
        preserveWatchOutput: true
      },
      preserveArguments: true,
      prefix: chalk => chalk.bgBlue.white('TS')
    });

    // const tsCheck = createCommand({
    //   command: prefixBin('ttsc'),
    //   arguments: {
    //     ...tsArgs,
    //     noEmit: true
    //   },
    //   preserveArguments: true,
    //   prefix: chalk => chalk.bgBlue.white('TS')
    // });


    // ----- Build: Misc. Commands ---------------------------------------------

    createCommand({
      name: 'cleanup',
      command: prefixBin('del'),
      arguments: {
        _: [`"${OUT_DIR}/**/*.spec.*"`, `"${OUT_DIR}/**/*.test.*"`]
      }
    });

    createCommand({
      name: 'linkBins',
      command: 'babel-node',
      arguments: {
        _: [require.resolve('etc/scripts/link-bins')],
        require: require.resolve('etc/babel-register')
      }
    });


    // ----- Lint Commands -----------------------------------------------------

    const eslintArgs = {
      _: ['src'],
      ext: EXTENSIONS_WITH_DOT.join(','),
      format: require.resolve('eslint-codeframe-formatter')
    };

    createCommand({
      name: 'eslint',
      command: prefixBin('eslint'),
      arguments: eslintArgs
      // prefix: chalk => chalk.bgBlue.white('ESLint')
    });

    createCommand({
      name: 'eslint.fix',
      command: prefixBin('eslint'),
      arguments: {
        ...eslintArgs,
        fix: true
      }
      // prefix: chalk => chalk.bgBlue.white('ESLint')
    });


    // ----- Build Scripts -----------------------------------------------------

    createScript({
      group: 'Build',
      name: 'build',
      description: 'Lint, type-check, and compile the project.',
      commands: [
        ['babel', 'ts', 'eslint'],
        ['cleanup', 'linkBins']
      ],
      timing: true
    });

    createScript({
      group: 'Build',
      name: 'build.watch',
      description: 'Continuously type-check, and compile the project.',
      commands: [
        ['babel.watch', 'ts.watch']
      ]
    });


    // ----- Testing Scripts ---------------------------------------------------

    createScript({
      group: 'Test',
      name: 'test',
      description: 'Run unit tests.',
      commands: [
        createCommand({
          command: prefixBin('jest')
        })
      ],
      timing: true
    });

    createScript({
      group: 'Test',
      name: 'test.watch',
      description: 'Run unit tests in watch mode.',
      commands: [
        createCommand({
          command: prefixBin('jest'),
          arguments: { watch: true }
        })
      ]
    });

    createScript({
      group: 'Test',
      name: 'test.coverage',
      description: 'Run unit tests and generate a coverage report.',
      commands: [
        createCommand({
          command: prefixBin('jest'),
          arguments: { coverage: true }
        })
      ],
      timing: true
    });

    createScript({
      group: 'Test',
      name: 'test.passWithNoTests',
      description: 'Run unit tests, but do not fail if no tests exist.',
      commands: [
        createCommand({
          command: prefixBin('jest'),
          arguments: { passWithNoTests: true }
        })
      ]
    });


    // ----- Lint Scripts ------------------------------------------------------

    createScript({
      group: 'Lint',
      name: 'lint',
      description: 'Lint the project.',
      commands: ['eslint'],
      timing: true
    });

    createScript({
      group: 'Lint',
      name: 'lint.fix',
      description: 'Lint the project and automatically fix any fixable errors.',
      commands: [
        'eslint.fix'
      ],
      timing: true
    });


    // ----- Release Scripts ---------------------------------------------------

    interface CreateReleaseScriptOptions {
      releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
      description: string;
      args?: any;
    }

    const createReleaseScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
      createScript({
        group: 'Release',
        name: releaseType ? `bump.${releaseType}` : 'bump',
        description: `Generate a change log entry and tagged commit for ${description}.`,
        commands: [
          createCommand({
            command: prefixBin('standard-version'),
            arguments: { preset: require.resolve('config/changelog-preset'), ...args }
          })
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

    createScript({
      group: 'Dependency Management',
      name: 'deps.check',
      description: 'Check for newer versions of installed dependencies.',
      commands: [
        createCommand({
          command: prefixBin('npm-check'),
          arguments: { skipUnused: true },
          // Do not throw an error if this command exits with a non-zero code.
          execaOptions: { reject: false }
        })
      ]
    });


    // ----- Lifecycles ----------------------------------------------------------

    createCommand({
      name: 'updateNotifier',
      command: 'babel-node',
      arguments: {
        _: [require.resolve('etc/scripts/update-notifier')],
        require: require.resolve('etc/babel-register')
      }
    });

    const { event } = getNpmInfo();
    const shouldSkipPrepare = IS_CI && ['install', 'ci'].includes(event);

    createScript({
      group: 'Lifecycle',
      name: 'prepare',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      commands: shouldSkipPrepare ? [] : [
        'build',
        'test.passWithNoTests',
        'updateNotifier'
      ],
      timing: true
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({ createCommand, createScript });
    }
  };
}
