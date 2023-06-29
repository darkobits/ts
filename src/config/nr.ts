import { EOL } from 'os';
import path from 'path';

import { EXTENSIONS } from '../etc/constants';
import log from '../lib/log';
import { getPackageContext, inferESLintConfigurationStrategy } from '../lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr';


/**
 * TODO: Make this function accept _either_ a user configuration factory _or_
 * an NR context object.
 */
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
  const lintRoot = srcDir || process.cwd();

  script([
    command('eslint', { args: [lintRoot, eslintFlags], env: eslintEnvVars })
  ], {
    name: 'lint',
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')}.`,
    timing: true
  });

  script([
    command('eslint', { args: [lintRoot, { ...eslintFlags, fix: true }], env: eslintEnvVars })
  ], {
    name: 'lint.fix',
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')} and automatically fix any fixable errors.`
  });


  // ----- Build Scripts -------------------------------------------------------

  script([
    command('vite', { args: ['build'], env: eslintEnvVars }),
    'script:lint'
  ], {
    name: 'build',
    group: 'Build',
    description: `Build, type-check, and lint the project using ${log.chalk.white.bold('Vite')}.`,
    timing: true
  });

  script([
    command('vite', { args: ['build', { watch: true }], env: eslintEnvVars })
  ], {
    name: 'build.watch',
    group: 'Build',
    description: `Continuously build and type-check the project using ${log.chalk.white.bold('Vite')}.`
  });


  // ----- Testing Scripts -----------------------------------------------------

  script([
    command('vitest', {
      args: ['run', { passWithNoTests: true }],
      preserveArgumentCasing: true,
      env: eslintEnvVars
    })
  ], {
    name: 'test',
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')}.`,
    timing: true
  });

  script([
    command('vitest', {
      args: { ui: true, passWithNoTests: true },
      preserveArgumentCasing: true,
      // This command involves user interaction so we need to use 'inherit'.
      stdio: 'inherit',
      env: eslintEnvVars
    })
  ], {
    name: 'test.watch',
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} in watch mode.`
  });

  script([
    command('vitest', {
      args: ['run', { coverage: true, passWithNoTests: true }],
      preserveArgumentCasing: true,
      env: eslintEnvVars
    })
  ], {
    name: 'test.coverage',
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} and generate a coverage report.`,
    timing: true
  });


  // ----- Release Scripts -----------------------------------------------------

  script([
    command('semantic-release')
  ], {
    name: 'release',
    description: `Create a release in a CI environment using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release'
  });

  script([
    command('semantic-release', {
      args: { ci: false }
    })
  ], {
    name: 'release.local',
    description: `Create a release locally using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release'
  });


  // ----- Bump Scripts --------------------------------------------------------

  const standardVersionCmd = 'standard-version';

  interface CreateReleaseScriptOptions {
    releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
    description?: string;
    args?: any;
  }

  const createBumpScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
    script([
      command(standardVersionCmd, {
        args: {
          preset: path.resolve(__dirname, 'changelog-preset.js'),
          releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
          ...args
        }
      })
    ], {
      name: releaseType ? `bump.${releaseType}` : 'bump',
      group: 'Bump',
      description: [
        `Generate a change log entry and tagged commit for a ${releaseType} release using ${log.chalk.white.bold('standard-version')}.`,
        description
      ].filter(Boolean).join(EOL),
      timing: true
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

  script([
    command('npm-check-updates', {
      args: { dep: 'prod,peer,dev', format: 'group', interactive: true },
      stdio: 'inherit'
    })
  ], {
    name: 'deps.check',
    group: 'Dependency Management',
    description: `Check for newer versions of installed dependencies using ${log.chalk.white.bold('npm-check-updates')}.`
  });


  // ----- Lifecycles ----------------------------------------------------------

  script(isCI ? [
    // In CI environments, skip our usual prepare steps; users can will likely
    // need to build and test projects explicitly in such cases.
    task(() => log.info(
      log.prefix('prepare'),
      log.chalk.yellow(`CI environment detected. Skipping ${log.chalk.bold('prepare')} script.`)
    ))
  ] : [
    'script:build',
    'script:test'
  ], {
    name: 'prepare',
    group: 'Lifecycle',
    description: 'Run after "npm install" to ensure the project builds and tests are passing.',
    timing: true
  });

  if (typeof userConfig === 'function') {
    await userConfig(context);
  }
};
