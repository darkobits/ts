import { nr } from '@darkobits/ts';
import { OUT_DIR } from '@darkobits/ts/etc/constants';
import { getNpmInfo, createBabelNodeCommand } from '@darkobits/ts/lib/utils';

import type { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';

export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return nr(async ({ createCommand, createNodeCommand, createScript, isCI }) => {
    createCommand('rm-out-dir', ['del', [OUT_DIR]]);
    createBabelNodeCommand('vite-build', ['vite', ['build']]);
    createBabelNodeCommand('vite-watch', ['vite', ['build'], { watch: true }]);
    createBabelNodeCommand('vite-serve', ['vite', ['serve']]);

    createScript('build', {
      group: 'Vite',
      description: 'Compile the project with Vite.',
      run: [
        'rm-out-dir',
        'vite-build',
        'link-bins'
      ]
    });

    createScript('build.watch', {
      group: 'Vite',
      description: 'Continuously compile the project with Vite.',
      run: [
        'rm-out-dir',
        'vite-watch'
      ]
    });

    createScript('start', {
      group: 'Vite',
      description: 'Start the Vite dev server.',
      run: [
        'vite-serve'
      ]
    });

    const { event } = getNpmInfo();
    const shouldSkipPrepare = isCI && ['install', 'ci'].includes(event);

    // Note: We need to re-define the 'prepare' script from `ts` here because
    // instructions are resolved at script creation rather than at execution, so
    // the "build" script that `ts` resolves to will be its own, not ours.
    createScript('prepare', {
      group: 'Lifecycle',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      run: shouldSkipPrepare ? [] : [
        'build',
        'test.passWithNoTests',
        'update-notifier'
      ]
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({ createCommand, createNodeCommand, createScript, isCI });
    }
  });
}
