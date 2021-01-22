// -----------------------------------------------------------------------------
// ----- NPS Configuration -----------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Tool Uses 'extends': No¹
 * Tool Supports Non-CJS Config: No²
 * Tool Supports Babel Config: No
 *
 * ¹We can, however, support non-CJS base configuration files in this repository
 *  provided our own root configuration files require @babel/register. Consumers
 *  will not have to do this because they will be loading transpiled CJS.
 *
 * ²This can be achieved using a custom entrypoint for NPS, but would require
 *  that the user not use a globally-installed version of NPS _and_ that we
 *  overwrite the "nps" bin symlink. Alternatively, the user could create an
 *  .npsrc configuration file. Both of these solutions seem overly burdensome.
 */
import 'etc/babel-register';

import merge from 'deepmerge';
// @ts-expect-error: Package does not have type defs.
import * as npsUtils from 'nps-utils';

import {
  EXTENSIONS_WITH_DOT,
  SRC_DIR,
  OUT_DIR
} from 'etc/constants';
import {
  NPSConfiguration,
  NPSConfigurationFactory
} from 'etc/types';
import {
  getUserScripts,
  prefixBin,
  skipIfCiNpmLifecycle
} from 'lib/utils';


/**
 * Our default export is a function that can accept nothing, an NPS
 * scripts/options object, or a function that returns an NPS scripts/options
 * object.
 */
export default (arg0?: NPSConfiguration | NPSConfigurationFactory) => {
  const scripts: NPSConfiguration['scripts'] = {};
  const userScripts = getUserScripts(arg0);


  // ----- Dependency Management -----------------------------------------------

  // @ts-expect-error - We don't have a root-level 'deps' script.
  scripts.deps = {
    check: {
      description: 'Check for newer versions of installed dependencies.',
      script: 'npm-check --skip-unused || true'
    }
  };


  // ----- Linting -------------------------------------------------------------

  const ESLINT_COMMAND = [
    prefixBin('eslint'),
    'src',
    '--ext',
    EXTENSIONS_WITH_DOT.join(','),
    `--format=${require.resolve('eslint-codeframe-formatter')}`
  ].join(' ');

  scripts.lint = {
    description: 'Lint the project.',
    script: ESLINT_COMMAND,
    fix: {
      description: 'Lint the project and automatically fix all fixable errors.',
      script: `${ESLINT_COMMAND} --fix`
    }
  };


  // ----- Testing -------------------------------------------------------------

  scripts.test = {
    default: {
      description: 'Run unit tests.',
      script: prefixBin('jest')
    },
    watch: {
      description: 'Run unit tests in watch mode.',
      script: `${prefixBin('jest')} --watch`
    },
    coverage: {
      description: 'Run unit tests and generate a coverage report.',
      script: `${prefixBin('jest')} --coverage`
    },
    passWithNoTests: {
      description: 'Run unit tests, but do not fail if no tests exist.',
      script: `${prefixBin('jest')} --passWithNoTests`
    }
  };


  // ----- Babel ---------------------------------------------------------------

  const BABEL_COMMAND = [
    prefixBin('babel'),
    SRC_DIR,
    `--extensions="${EXTENSIONS_WITH_DOT.join(',')}"`,
    '--ignore="**/*.d.ts"',
    `--out-dir="${OUT_DIR}"`,
    '--copy-files',
    '--source-maps=true',
    '--delete-dir-on-start'
  ].join(' ');

  // N.B. This is named 'compile' rather than 'babel' so that NPS' string
  // matching algorithm runs 'build.watch' when the user issues the command
  // 'nps b.w'. Otherwise, NPS would run 'babel.watch'.
  scripts.compile = {
    default: {
      description: 'Compile the project with Babel.',
      script: BABEL_COMMAND
    },
    watch: {
      description: 'Continuously compile the project with Babel.',
      script: `${BABEL_COMMAND} --watch --verbose`
    }
  };


  // ----- TypeScript ----------------------------------------------------------

  scripts.ts = {
    default: {
      description: 'Emit declarations for the project.',
      script: `${prefixBin('ttsc')} --pretty --emitDeclarationOnly`
    },
    watch: {
      description: 'Continuously type-check and emit declarations for the project.',
      script: `${prefixBin('ttsc')} --pretty --emitDeclarationOnly --watch --preserveWatchOutput`
    },
    check: {
      description: 'Type-check the project without emitting any files.',
      script: `${prefixBin('ttsc')} --pretty --noEmit`
    }
  };


  // ----- Build ---------------------------------------------------------------

  scripts.build = {
    default: {
      description: 'Lint, type-check, and build the project.',
      script: npsUtils.series(...[
        // If there is a user-defined script named 'prebuild', run it.
        // Otherwise, run the default prebuild routine.
        userScripts?.scripts?.prebuild ? `${prefixBin('nps')} prebuild` : undefined,
        // Then, build the project by concurrently running Babel and generating
        // type definitions. N.B. This will implicitly type-check the project.
        npsUtils.concurrent({
          'ESLint': {
            script: scripts.lint.script,
            color: 'bgMagenta.whiteBright'
          },
          'Babel': {
            script: scripts.compile.default.script,
            color: 'bgYellow.black'
          },
          'TSC': {
            script: scripts.ts.default.script,
            color: 'bgBlue.whiteBright'
          }
        }),
        // Remove test files produced by Babel and test declaration files
        // produced by TypeScript from the build directory.
        `${prefixBin('del')} "${OUT_DIR}/**/*.spec.*" "${OUT_DIR}/**/*.test.*"`,
        // Link any bins declared in the host project's package.json into its
        // local node_modules/.bin/ folder, allowing the developer to invoke the
        // host package's bins in the same manner as any dependency's bins.
        `babel-node --require ${require.resolve('etc/babel-register')} ${require.resolve('etc/scripts/link-bins')}`,
        // Finally, if there is a user-defined script named 'postbuild', run it.
        userScripts?.scripts?.postbuild ? `${prefixBin('nps')} postbuild` : undefined
      ].filter(Boolean))
    },
    watch: {
      description: 'Continuously build the project',
      script: npsUtils.series(...[
        // If there is a user-defined script named 'prebuild', run it.
        userScripts?.scripts?.prebuild ? `${prefixBin('nps')} prebuild` : undefined,
        npsUtils.concurrent({
          'Babel': {
            // @ts-expect-error - Even though the value at 'watch' is typed as a
            // union type and we have _clearly_ defined this value above using
            // the 'verbose' form, TypeScript insists that 'watch.script' here
            // is of type 'string', ignoring the other types in the union. 🎉
            script: scripts.compile.watch.script,
            color: 'bgYellow.black'
          },
          'TSC': {
            // @ts-expect-error - Even though the value at 'watch' is typed as a
            // union type and we have _clearly_ defined this value above using
            // the 'verbose' form, TypeScript insists that 'watch.script' here
            // is of type 'string', ignoring the other types in the union. 🎉
            script: scripts.ts.watch.script,
            color: 'bgBlue.white'
          }
        })
      ].filter(Boolean))
    }
  };


  // ----- Releasing -----------------------------------------------------------

  const STANDARD_VERSION_COMMAND = [
    prefixBin('standard-version'),
    `--preset=${require.resolve('config/changelog-preset')}`
  ].join(' ');

  const createReleaseScript = (name?: string, standardVersionArgs?: string) => ({
    description: [
      'Generates a change log and tagged commit for a',
      name,
      'release.'
    ].filter(Boolean).join(' '),
    script: npsUtils.series(...[
      userScripts?.scripts?.prebump ? `${prefixBin('nps')} prebump` : undefined,
      `${prefixBin('nps')} prepare`,
      `${STANDARD_VERSION_COMMAND} ${standardVersionArgs}`,
      userScripts?.scripts?.postbump ? `${prefixBin('nps')} postbump` : undefined
    ].filter(Boolean))
  });

  scripts.bump = {
    default: createReleaseScript(),
    beta: createReleaseScript('beta', '--prerelease=beta'),
    first: createReleaseScript('project\'s first', '--first-release'),
    major: createReleaseScript('major', '--release-as=major'),
    minor: createReleaseScript('minor', '--release-as=minor'),
    patch: createReleaseScript('patch', '--release-as=patch')
  };


  // ----- Lifecycles ----------------------------------------------------------

  scripts.prepare = {
    description: 'Runs after "npm install" to ensure the package builds correctly and tests are passing.',
    // This wrapper function will cause a no-op if (1) we are in a CI
    // environment and (2) we are being run as part of an NPM lifecycle.
    script: skipIfCiNpmLifecycle(
      'prepare',
      npsUtils.series(
        // This ensures that "nps prepare" will run a user-defined build script if
        // they have set one.
        'nps build',
        // Again, this invocation allows the user to overwrite our default
        // test script, but still have this default prepare script invoke it.
        // We still pass the passWithNoTests argument to Jest to ensure that
        // if the user has not written any tests yet, the prepare script will
        // not fail.
        'nps test -- -- --passWithNoTests',
        // Finally, notify the user about any updates available at the end of
        // the prepare script.
        `babel-node --require ${require.resolve('etc/babel-register')} ${require.resolve('etc/scripts/update-notifier')}`
      )
    )
  };


  return merge({
    scripts,
    options: {
      logLevel: 'warn'
    }
  }, userScripts);
};
