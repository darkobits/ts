import { replaceTscAliasPaths } from 'tsc-alias';

import log from './log';

import type { Plugin } from 'vite';


/**
 * Responsible for running tsc-alias on emitted declaration files.
 *
 * TODO: Move to own package.
 */
export default function tscAliasPlugin(options = {}): Plugin {
  return {
    name: 'vite-plugin-tsc-alias',
    enforce: 'post',
    async closeBundle() {
      const timer = log.createTimer();

      log.verbose('Starting...');

      try {
        await replaceTscAliasPaths(options);
        log.verbose(`Done in ${timer}.`);
      } catch (err: any) {
        this.error(err);
      }
    }
  };
}
