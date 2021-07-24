// -----------------------------------------------------------------------------
// ----- NR Configuration ------------------------------------------------------
// -----------------------------------------------------------------------------

import type { ConfigurationFactory } from '@darkobits/nr/dist/etc/types';
import { nr } from '@darkobits/ts';

import { prefixBin } from 'lib/utils';


export default function(userConfigFactory?: ConfigurationFactory): ConfigurationFactory {
  return nr(async ({ createCommand, createNodeCommand, createScript, isCI }) => {

    /**
     * Using the same signature of `createNodeCommand`, creates a command that
     * invokes Node with @babel/register, ensuring any Babel features enabled in
     * the local project are available.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createBabelNodeCommand: typeof createNodeCommand = (name, args, opts) => {
      return createNodeCommand(name, args, {
        execaOptions: {
          // @ts-ignore
          nodeOptions: ['--require', require.resolve('@darkobits/ts/etc/babel-register')]
        }
      });
    };

    createScript('build', {
      group: 'Webpack',
      description: 'Compile the project with Webpack.',
      run: [
        createBabelNodeCommand('webpack',
          [prefixBin('webpack'), { mode: 'production' }]
        )
      ]
    });

    createScript('start', {
      group: 'Webpack',
      description: 'Start the Webpack dev server.',
      run: [
        createBabelNodeCommand('webpack-dev-server',
          [prefixBin('webpack'), ['serve'], { mode: 'development' }]
        )
      ]
    });

    if (typeof userConfigFactory === 'function') {
      await userConfigFactory({ createCommand, createNodeCommand, createScript, isCI });
    }
  });
}
