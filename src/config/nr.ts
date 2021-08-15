import { nr } from '@darkobits/ts';
import { OUT_DIR } from '@darkobits/ts/etc/constants';

import type { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return nr(async ({ createCommand, createNodeCommand, createScript, isCI }) => {
    /**
     * Using the same signature of `createNodeCommand`, creates a command that
     * invokes Node with @babel/register, ensuring any Babel features enabled in
     * the local project are available.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createBabelNodeCommand: typeof createNodeCommand = (name, args) => {
      return createNodeCommand(name, args, {
        execaOptions: {
          // @ts-ignore
          nodeOptions: ['--require', require.resolve('@darkobits/ts/etc/babel-register')]
        }
      });
    };

    createCommand('rm-out-dir', ['del', [OUT_DIR]]);
    createBabelNodeCommand('webpack', ['webpack', { mode: 'production' }]);
    createBabelNodeCommand('webpack-watch', ['webpack', { watch: true, progress: true, mode: 'development' }]);
    createBabelNodeCommand('webpack-dev-server', ['webpack', ['serve'], { mode: 'development' }]);

    createScript('build', {
      group: 'Webpack',
      description: 'Compile the project with Webpack.',
      run: [
        'rm-out-dir',
        'webpack',
        'link-bins'
      ]
    });

    createScript('build.watch', {
      group: 'Webpack',
      description: 'Continuously compile the project with Webpack.',
      run: [
        'rm-out-dir',
        'webpack-watch'
      ]
    });

    createScript('start', {
      group: 'Webpack',
      description: 'Start the Webpack dev server.',
      run: [
        'webpack-dev-server'
      ]
    });

    // Note: We need to re-define the 'prepare' script from `ts` here because
    // instructions are resolved at script creation rather than at execution, so
    // the "build" script that `ts` resolves to will be its own, not ours.
    createScript('prepare', {
      group: 'Lifecycle',
      description: 'Run after "npm install" to ensure the project builds correctly and tests are passing.',
      run: [
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
