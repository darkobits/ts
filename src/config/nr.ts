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

  script('lint', [
    command('eslint', { args: [lintRoot, eslintFlags], env: eslintEnvVars })
  ], {
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')}.`,
    timing: true
  });

  script('lint.fix', [
    command('eslint', { args: [lintRoot, { ...eslintFlags, fix: true }], env: eslintEnvVars })
  ], {
    group: 'Lint',
    description: `Lint the project using ${log.chalk.white.bold('ESLint')} and automatically fix any fixable errors.`,
    timing: true
  });


  // ----- Build Scripts -------------------------------------------------------

  script('build', [
    command('vite', { args: ['build'], env: eslintEnvVars }),
    'script:lint'
  ], {
    group: 'Build',
    description: `Build, type-check, and lint the project using ${log.chalk.white.bold('Vite')}.`,
    timing: true
  });

  script('build.watch', [
    command('vite', { args: ['build', { watch: true }], env: eslintEnvVars })
  ], {
    group: 'Build',
    description: `Continuously build and type-check the project using ${log.chalk.white.bold('Vite')}.`
  });


  // ----- Testing Scripts -----------------------------------------------------

  script('test', [
    command('vitest', {
      args: ['run', { passWithNoTests: true }],
      preserveArgumentCasing: true,
      env: eslintEnvVars
    })
  ], {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')}.`,
    timing: true
  });

  script('test.watch', [
    command('vitest', {
      args: { ui: true, passWithNoTests: true },
      // This command involves user interaction so we need to use 'inherit'.
      stdio: 'inherit',
      env: eslintEnvVars,
      preserveArgumentCasing: true
    })
  ], {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} in watch mode.`
  });

  script('test.coverage', [
    command('vitest', {
      args: ['run', { coverage: true, passWithNoTests: true }],
      preserveArgumentCasing: true,
      env: eslintEnvVars
    })
  ], {
    group: 'Test',
    description: `Run unit tests using ${log.chalk.white.bold('Vitest')} and generate a coverage report.`,
    timing: true
  });


  // ----- Release Scripts -----------------------------------------------------

  script('release', command('semantic-release'), {
    description: `Create a release in a CI environment using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    timing: true
  });

  script('release.local', command('semantic-release', { args: { ci: false } }), {
    description: `Create a release locally using ${log.chalk.white.bold('semantic-release')}.`,
    group: 'Release',
    timing: true
  });


  // ----- Bump Scripts --------------------------------------------------------

  const standardVersionCmd = 'standard-version';

  interface CreateReleaseScriptOptions {
    releaseType?: 'first' | 'major' | 'minor' | 'patch' | 'beta';
    description?: string;
    args?: any;
  }

  const createBumpScript = ({ releaseType, args, description }: CreateReleaseScriptOptions) => {
    script(releaseType ? `bump.${releaseType}` : 'bump', [
      command(standardVersionCmd, {
        args: {
          preset: path.resolve(__dirname, 'changelog-preset.js'),
          releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
          ...args
        }
      })
    ], {
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

  script('deps.check', [
    command('npm-check-updates', {
      args: { dep: 'prod,peer,dev', format: 'group', interactive: true },
      stdio: 'inherit'
    })
  ], {
    group: 'Dependency Management',
    description: `Check for newer versions of installed dependencies using ${log.chalk.white.bold('npm-check-updates')}.`
  });


  // ----- Lifecycles ----------------------------------------------------------

  script('prepare', isCI ? [
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
    group: 'Lifecycle',
    description: 'Run after "npm install" to ensure the project builds and tests are passing.',
    timing: true
  });

  if (typeof userConfig === 'function') {
    await userConfig(context);
  }
};
