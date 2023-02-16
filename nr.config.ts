import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';


export default nr(({ command, task, script }) => {
  script('docs', {
    description: `Start a local ${log.chalk.white.bold('Docsify')} server that serves our documentation.`,
    run: [
      command('docsify', ['docsify', ['serve', 'docs']])
    ]
  });

  // When publishing this package, we use re-pack's 'publish' command to publish
  // from the
  script('publish', {
    group: 'Release',
    description: `Publish the package using ${log.chalk.white.bold('re-pack')}.`,
    run: [
      command('re-pack', ['re-pack', ['publish']])
    ]
  });

  script('postPrepare', {
    group: 'Lifecycles',
    description: 'Run various post-install tasks.',
    run: [
      // Remove the 'documentation' folder created by Docsify's postinstall
      // script on fresh installs.
      task('rm-docsify', () => fs.rm('documentation', {
        recursive: true,
        force: true
      }))
    ]
  });

  // N.B. nr will automatically run this for us after the 'build' script is run.
  script('postBuild', {
    group: 'Lifecycles',
    description: 'Run various post-build tasks.',
    run: [
      // Use re-pack to re-pack the output directory.
      command('re-pack', ['re-pack'])
    ]
  });
});
