import path from 'path';

import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';


export default nr(({ command, task, script, isCI }) => {
  script([
    command('docsify', { args: ['serve', 'docs'] })
  ], {
    name: 'docs',
    description: `Start a local ${log.chalk.white.bold('Docsify')} server that serves our documentation.`
  });

  script([
    command.node('index.js', {
      name: 'smoke-tests:cjs',
      cwd: './smoke-tests/cjs'
    }),
    command.node('index.js', {
      name: 'smoke-tests:esm',
      cwd: './smoke-tests/esm'
    })
  ], {
    name: 'test.smoke',
    group: 'Test',
    description: 'Run smoke tests against the compiled version of the project.',
    timing: true
  });

  // N.B. nr will run this after the 'prepare' script.
  script([
    // On fresh installs, remove the 'documentation' folder created by
    // Docsify's postinstall script.
    task(() => fs.rm('documentation', {
      recursive: true,
      force: true
    }))
  ], {
    name: 'postPrepare',
    group: 'Lifecycle',
    description: '[hook] After the prepare script runs, remove Docsify installation artifacts.'
  });

  // When publishing this package, we use re-pack's 'publish' command to publish
  // from the .re-pack folder rather than `npm publish`.
  script([
    // Re-pack the project.
    command('re-pack'),
    // Publish the project from the re-pack directory.
    command('re-pack', { args: ['publish'] }),
    // Push the release commit.
    command('git', {
      name: 'push-release-commit',
      args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }]
    }),
    // Remove the re-pack directory.
    task(() => fs.rm(path.resolve('.re-pack'), {
      recursive: true,
      force: true
    }))
  ], {
    name: 'publish',
    group: 'Release',
    description: `Publish the package using ${log.chalk.white.bold('re-pack')}.`,
    timing: true
  });

  script([
    'script:publish',
    command('git', {
      name: 'git-push',
      args: ['push', 'origin', 'HEAD', { followTags: true, setUpstream: true}]
    })
  ], {
    name: 'postBump',
    group: 'Lifecycle',
    description: '[hook] After a bump script is run, publishes the project and pushes the release commit.'
  });

  if (!isCI) {
    script(['script:test.smoke'], {
      name: 'postBuild',
      group: 'Lifecycle',
      description: '[hook] If not in a CI environment, run smoke tests after building the project.'
    });
  }
});
