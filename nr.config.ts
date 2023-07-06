import path from 'path';

import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';


export default nr(({ command, task, script, isCI }) => {
  script('test.smoke', [[
    command.node('index.js', { cwd: './tests/fixtures/cjs' }),
    command.node('index.js', { cwd: './tests/fixtures/esm' })
  ]], {
    group: 'Test',
    description: 'Run smoke tests against the compiled version of the project.',
    timing: true
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

  script('postBuild', command.node('./scripts/update-readme.mts', {
    nodeOptions: ['--loader=ts-node/esm', '--no-warnings']
  }), {
    group: 'Lifecycle',
    description: '[hook] Update dependency versions in README.',
    timing: true
  });

  script('postBump', [
    'script:publish',
    command('git', { args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }] })
  ], {
    group: 'Lifecycle',
    description: '[hook] After the bump script, publish the project and push the release commit.'
  });

  if (!isCI) {
    script('postPrepare', 'script:test.smoke', {
      group: 'Lifecycle',
      description: '[hook] After the prepare script, run smoke tests.'
    });
  }
});
