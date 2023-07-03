import path from 'path';

import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';


export default nr(({ command, task, script, isCI }) => {
  script('docs', command('docsify', { args: ['serve', 'docs'] }), {
    description: `Start a local ${log.chalk.white.bold('Docsify')} server that serves our documentation.`
  });

  script('test.smoke', [[
    command.node('index.js', { cwd: './tests/fixtures/cjs' }),
    command.node('index.js', { cwd: './tests/fixtures/esm' })
  ]], {
    group: 'Test',
    description: 'Run smoke tests against the compiled version of the project.',
    timing: true
  });

  script('postPrepare', [
    // Do not automatically run smoke tests in CI environments.
    !isCI && 'script:test.smoke',
    // Remove the 'documentation' folder created by Docsify. 🙄
    task(() => fs.rm('documentation', { recursive: true, force: true }))
  ], {
    group: 'Lifecycle',
    description: '[hook] After the prepare script runs, remove Docsify installation artifacts.'
  });

  // When publishing this package, we use re-pack's 'publish' command to publish
  // from the .re-pack folder rather than `npm publish`.
  script('publish', [
    // Re-pack the project.
    command('re-pack'),
    // Publish the project from the re-pack directory.
    command('re-pack', { args: ['publish'] }),
    // Push the release commit.
    command('git', { args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }] }),
    // Remove the re-pack directory.
    task(() => fs.rm(path.resolve('.re-pack'), { recursive: true, force: true }))
  ], {
    group: 'Release',
    description: `Publish the package using ${log.chalk.white.bold('re-pack')}.`,
    timing: true
  });

  script('postBump', [
    'script:publish',
    command('git', {
      args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }]
    })
  ], {
    group: 'Lifecycle',
    description: '[hook] After a bump script is run, publishes the project and pushes the release commit.'
  });
});
