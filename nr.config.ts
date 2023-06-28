import path from 'path';

import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';


export default nr(({ command, task, script, isCI }) => {
  script('docs', {
    description: `Start a local ${log.chalk.white.bold('Docsify')} server that serves our documentation.`,
    run: [
      command('docsify', ['docsify', ['serve', 'docs']])
    ]
  });

  script('test.smoke', {
    group: 'Test',
    description: 'Run somke tests aginst the compiled version of the project.',
    run: [
      command.node('smoke-tests:cjs', ['./smoke-tests/cjs/index.js']),
      command.node('smoke-tests:esm', ['./smoke-tests/esm/index.js'])
    ],
    timing: true
  });

  // N.B. nr will run this after the 'build' script.
  if (!isCI) {
    script('postBuild', {
      group: 'Lifecycle',
      description: '[local only] Run smoke tests after building the project.',
      run: ['script:test.smoke']
    });
  }

  // N.B. nr will run this after the 'prepare' script.
  script('postPrepare', {
    group: 'Lifecycle',
    description: 'Removes Docsify installation artifacts.',
    run: [
      // On fresh installs, remove the 'documentation' folder created by
      // Docsify's postinstall script.
      task('rm-docsify', () => fs.rm('documentation', {
        recursive: true,
        force: true
      }))
    ]
  });

  // When publishing this package, we use re-pack's 'publish' command to publish
  // from the .re-pack folder rather than `npm publish`.
  script('publish', {
    group: 'Release',
    description: `Publish the package using ${log.chalk.white.bold('re-pack')}.`,
    run: [
      // Re-pack the project.
      command('re-pack', ['re-pack']),
      // Publish the project from the re-pack directory.
      command('re-pack-publish', ['re-pack', ['publish']]),
      // Push the release commit.
      command('push-release-commit', ['git', ['push', 'origin', 'HEAD'], {
        setUpstream: true,
        followTags: true
      }]),
      // Remove the re-pack directory.
      task('re-pack-cleanup', () => fs.rm(path.resolve('.re-pack'), {
        recursive: true,
        force: true
      }))
    ]
  });

  script('postBump', {
    group: 'Lifecycle',
    description: 'Publishes the project and pushes the release commit.',
    run: [
      'script:publish',
      command('git-push', ['git', ['push', 'origin', 'HEAD'], {
        followTags: true,
        setUpstream: true
      }])
    ]
  });
});
