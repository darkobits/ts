import type { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';
import merge from 'deepmerge';

import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import { getNpmInfo } from 'lib/utils';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return async ({ createCommand, createNodeCommand, createScript, isCI }) => {

    /**
     * Using the same signature of `createNodeCommand`, creates a command that
     * invokes Node with @babel/register, ensuring any Babel features enabled in
     * the local project are available.
     */
    const createBabelNodeCommand: typeof createNodeCommand = (name, args, opts) => {
      return createNodeCommand(name, args, merge({
        execaOptions: {
          nodeOptions: ['--require', require.resolve('etc/babel-register')]
        }
      }, opts ?? {}));
    };


    // ----- Build: Babel Commands ---------------------------------------------

    const babelFlags = {
      extensions: EXTENSIONS_WITH_DOT.join(','),
      ignore: '**/*.d.ts',
      outDir: OUT_DIR,
      copyFiles: true,
      sourceMaps: true,
      deleteDirOnStart: true
    };

    createCommand('babel', [
      'babel', [SRC_DIR], babelFlags
    ], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });

    createCommand('babel-watch', [
      'babel', [SRC_DIR], {...babelFlags, watch: true, verbose: true }
    ], {
      prefix: chalk => chalk.bgYellow.black(' Babel '),
      execaOptions: {env: { TS_ENV: 'esm' } }
    });


    // ----- Build: TypeScript Commands ----------------------------------------

    const tsFlags = {
      pretty: true
    };

    createCommand('ts', [
      'ttsc', { ...tsFlags, emitDeclarationOnly: true }
    ], {
      prefix: chalk => chalk.bgBlue.white(' TS '),
      preserveArguments: true
    });

    createCommand('ts-watch', [
      'ttsc', {
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
    //   'ttsc', { ...tsFlags, noEmit: true }
    // ], {
    //   preserveArguments: true,
    //   prefix: chalk => chalk.bgBlue.white('TS')
    // });


    // ----- Build: Misc. Commands ---------------------------------------------

    createCommand('cleanup', [
      'del', [`${OUT_DIR}/**/*.spec.*`, `${OUT_DIR}/**/*.test.*`]
    ]);

    createBabelNodeCommand('link-bins', [require.resolve('etc/scripts/link-bins')]);


    // ----- Lint Commands -----------------------------------------------------

    const eslintFlags = {
      ext: EXTENSIONS_WITH_DOT.join(','),
      format: require.resolve('eslint-codeframe-formatter')
    };

    createBabelNodeCommand('eslint', ['eslint', [SRC_DIR], eslintFlags]);

    createBabelNodeCommand('eslint-fix', ['eslint', [SRC_DIR], { ...eslintFlags, fix: true }]);


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
        createBabelNodeCommand('jest-watch', ['jest', { watch: true }])
      ]
    });

    createScript('test.coverage', {
      group: 'Test',
      description: 'Run unit tests and generate a coverage report.',
      timing: true,
      run: [
        createBabelNodeCommand('jest-coverage', ['jest', { coverage: true }])
      ]
    });

    createScript('test.passWithNoTests', {
      group: 'Test',
      description: 'Run unit tests, but do not fail if no tests exist.',
      run: [
        createBabelNodeCommand('jest-pass', ['jest', { passWithNoTests: true }], {
          preserveArguments: true
        })
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

    const standardVersionCmd = 'standard-version';

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
          createBabelNodeCommand(`standard-version-${releaseType ?? 'default'}`, [
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
        createCommand('update-check', ['npm-check-updates'], {
          execaOptions: { stdio: 'inherit' }
        })
      ]
    });


    // ----- Lifecycles --------------------------------------------------------

    createBabelNodeCommand('update-notifier', [require.resolve('etc/scripts/update-notifier')]);

    const { event } = getNpmInfo();
    const shouldSkipPrepare = isCI && ['install', 'ci'].includes(event);

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
      await userConfigFactory({ createCommand, createNodeCommand, createScript, isCI });
    }
  };
}
