import {
  ConfigurationFactory,
  CreateCommandArguments,
  CreateCommandOptions
} from '@darkobits/nr/dist/etc/types';
import merge from 'deepmerge';
import IS_CI from 'is-ci';

import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import {
  prefixBin,
  getNpmInfo,
  resolveBin
} from 'lib/utils';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return async ({ createCommand, createScript }) => {

    /**
     * Using the same signature of `createCommand`, creates a command that
     * invokes Node with @babel/register, ensuring any Babel features enabled in
     * the local project are available.
     */
    const createNodeCommand = (name: string, args: CreateCommandArguments, opts?: CreateCommandOptions) => {
      const [cmd, positionalsOrFlags, flagsOrUndefined] = args;

      // Resolve the absolute path to the indicated executable.
      const resolvedCmd = resolveBin(prefixBin(cmd)).binPath;
      let positionals: Array<string> = [];
      let flags: Record<string, any> = {};

      if (Array.isArray(positionalsOrFlags)) {
        positionals = positionalsOrFlags;
      } else if (typeof positionalsOrFlags === 'object' && !flagsOrUndefined) {
        flags = positionalsOrFlags;
      }

      if (typeof flagsOrUndefined === 'object') {
        flags = flagsOrUndefined;
      }

      const nodeArgs = [
        '--require',
        require.resolve('etc/babel-register'),
        resolvedCmd,
        ...positionals
      ];

      return createCommand(name, ['node', nodeArgs, flags ?? undefined], merge({
        execaOptions: {
          env: {
            FORCE_COLOR: 'true',
            ESM_OPTIONS: '{"cjs":true, "mode": "all"}'
          }
        }
      }, opts ?? {}));
    };


    // ----- Build: Babel Commands ---------------------------------------------

    const babelCmd = prefixBin('babel');

    const babelFlags = {
      extensions: EXTENSIONS_WITH_DOT.join(','),
      ignore: '**/*.d.ts',
      outDir: OUT_DIR,
      copyFiles: true,
      sourceMaps: true,
      deleteDirOnStart: true
    };

    createCommand('babel', [
      babelCmd, [SRC_DIR], babelFlags
    ], {
      prefix: chalk => chalk.bgYellow.black(' Babel ')
    });

    createCommand('babel-watch', [
      babelCmd, [SRC_DIR], {...babelFlags, watch: true, verbose: true }
    ], {
      prefix: chalk => chalk.bgYellow.black(' Babel ')
    });


    // ----- Build: TypeScript Commands ----------------------------------------

    const ttscCmd = prefixBin('ttsc');

    const tsFlags = {
      pretty: true
    };

    createCommand('ts', [
      ttscCmd, { ...tsFlags, emitDeclarationOnly: true }
    ], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });

    createCommand('ts-watch', [
      ttscCmd, {
        ...tsFlags,
        emitDeclarationOnly: true,
        watch: true,
        preserveWatchOutput: true
      }
    ], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });

    // createCommand('ts-check', [
    //   prefixBin('ttsc'), { ...tsFlags, noEmit: true }
    // ], {
    //   preserveArguments: true,
    //   prefix: chalk => chalk.bgBlue.white('TS')
    // });


    // ----- Build: Misc. Commands ---------------------------------------------

    createCommand('cleanup', [
      prefixBin('del'), [`"${OUT_DIR}/**/*.spec.*"`, `"${OUT_DIR}/**/*.test.*"`]
    ]);

    createNodeCommand('link-bins', [require.resolve('etc/scripts/link-bins')]);


    // ----- Lint Commands -----------------------------------------------------

    const eslintFlags = {
      ext: EXTENSIONS_WITH_DOT.join(','),
      format: require.resolve('eslint-codeframe-formatter')
    };

    createNodeCommand('eslint', ['eslint', [SRC_DIR], eslintFlags]);

    createNodeCommand('eslint-fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


    // ----- Build Scripts -----------------------------------------------------

    createScript('build', {
      group: 'Build',
      description: 'Lint, type-check, and compile the project.',
      timing: true,
      run: [
        ['babel', 'ts', 'eslint'],
        ['cleanup', 'link-bins']
      ]
    });

    createScript('build.watch', {
      group: 'Build',
      description: 'Continuously type-check, and compile the project.',
      run: [
        ['babel-watch', 'ts-watch']
      ]
    });


    // ----- Testing Scripts ---------------------------------------------------

    const jestCmd = prefixBin('jest');

    createScript('test', {
      group: 'Test',
      description: 'Run unit tests.',
      timing: true,
      run: [
        createNodeCommand('jest', [jestCmd])
      ]
    });

    createScript('test.watch', {
      group: 'Test',
      description: 'Run unit tests in watch mode.',
      run: [
        createNodeCommand('jest-watch', [jestCmd, { watch: true }])
      ]
    });

    createScript('test.coverage', {
      group: 'Test',
      description: 'Run unit tests and generate a coverage report.',
      timing: true,
      run: [
        createNodeCommand('jest-coverage', [jestCmd, { coverage: true }])
      ]
    });

    createScript('test.passWithNoTests', {
      group: 'Test',
      description: 'Run unit tests, but do not fail if no tests exist.',
      run: [
        createNodeCommand('jest-pass', [jestCmd, { passWithNoTests: true }])
      ]
    });


    // ----- Lint Scripts ------------------------------------------------------

    createScript('lint', {
      group: 'Lint',
      description: 'Lint the project.',
      timing: true,
      run: ['eslint']
    });

    createScript('lint.fix', {
      group: 'Lint',
      description: 'Lint the project and automatically fix any fixable errors.',
      timing: true,
      run: ['eslint-fix']
    });


    // ----- Release Scripts ---------------------------------------------------

    const standardVersionCmd = prefixBin('standard-version');

    interface CreateReleaseScriptOptions {
      releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
      description: string;
      args?: any;
    }

    const createReleaseScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {

      createScript(releaseType ? `bump.${releaseType}` : 'bump', {
        group: 'Release',
        description: `Generate a change log entry and tagged commit for ${description}.`,
        run: [
          createNodeCommand(`standard-version-${releaseType ?? 'default'}`, [
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

    createScript('deps.check', {
      group: 'Dependency Management',
      description: 'Check for newer versions of installed dependencies.',
      run: [
        createCommand('npm-check', [prefixBin('npm-check'), { skipUnused: true }], {
          // Do not throw an error if this command exits with a non-zero code.
          execaOptions: { reject: false }
        })
      ]
    });


    // ----- Lifecycles ----------------------------------------------------------

    createNodeCommand('update-notifier', [require.resolve('etc/scripts/update-notifier')]);

    const { event } = getNpmInfo();
    const shouldSkipPrepare = IS_CI && ['install', 'ci'].includes(event);

    createScript('prepare', {
      group: 'Lifecycle',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      timing: true,
      run: shouldSkipPrepare ? [] : [
        'build',
        'test.passWithNoTests',
        'update-notifier'
      ]
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({ createCommand, createScript });
    }
  };
}
