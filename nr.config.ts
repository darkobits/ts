import path from 'path';

import fs from 'fs-extra';

import { nr } from './src';
import log from './src/lib/log';
import { getPackageContext } from './src/lib/utils';


export default nr(async ({ command, task, script }) => {
  const { srcDir, outDir } = await getPackageContext();

  script('docs', {
    description: `Start a local ${log.chalk.white.bold('Docsify')} server that serves our documentation.`,
    run: [
      command('docsify', ['docsify', ['serve', 'docs']])
    ]
  });

  script('publish', {
    group: 'Release',
    description: `Publish the package using ${log.chalk.white.bold('re-pack')}.`,
    run: [
      command('re-pack', ['re-pack', ['publish']])
    ]
  });

  // N.B. nr will automatically run this for us after the 'build' script is run.
  script('postBuild', {
    group: 'Build',
    description: 'Run various post-build tasks.',
    run: [
      // Remove the 'documentation' folder created by Docsify's postinstall
      // script on fresh installs.
      command('rm.docsify', ['del', ['documentation']]),
      // Copies config/tsconfig-base.json from the source directory to the
      // output directory. This was previously handled by Babel's copyFiles
      // flag, but is unsupported by the TypeScript compiler.
      task('copy-tsconfig-base', () => {
        if (!srcDir) throw new Error('[ts:re-pack] Unable to infer source root.');
        if (!outDir) throw new Error('[ts:re-pack] Unable to infer output directory.');

        fs.copyFile(
          path.resolve(srcDir, 'config', 'tsconfig-base.json'),
          path.resolve(outDir, 'config', 'tsconfig-base.json')
        )
      }),
      // Finally, re-pack the output directory.
      command('re-pack', ['re-pack'])
    ]
  });
});
