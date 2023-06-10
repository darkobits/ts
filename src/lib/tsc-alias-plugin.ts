import merge from 'deepmerge';
import {
  replaceTscAliasPaths,
  type ReplaceTscAliasPathsOptions
} from 'tsc-alias';

import log from './log';

import type { Plugin } from 'vite';


/**
 * @private
 *
 * Default options for the plugin. Output options `assert` and `clear` are
 * exact copies of the default implementations, but tsc-alias does not merge
 * options, so we must define every required property for `output`
 */
const defaultOptions: ReplaceTscAliasPathsOptions = {
  debug: log.isLevelAtLeast('verbose'),
  output: {
    verbose: true,
    clear: () => {
      // eslint-disable-next-line no-console
      console.clear();
    },
    debug: message => {
      log.silly(log.prefix('tscAliasPlugin'), message);
    },
    info: message => {
      log.verbose(log.prefix('tscAliasPlugin'), message);
    },
    error(message) {
      log.error(log.prefix('tscAliasPlugin'), message);
      this.error(message, true);
    },
    assert(claim, message) {
      void (claim || this.error(message, true));
    }
  }
};


/**
 * Responsible for running tsc-alias on emitted declaration files.
 */
export default function tscAliasPlugin(userOptions: ReplaceTscAliasPathsOptions = {}): Plugin {
  const options = merge(defaultOptions, userOptions);

  return {
    name: 'vite-plugin-tsc-alias',
    enforce: 'post',
    async closeBundle() {
      const timer = log.createTimer();

      try {
        await replaceTscAliasPaths(options);
        log.verbose(log.prefix('tscAliasPlugin'), `Done in ${timer}.`);
      } catch (err: any) {
        this.error(err);
      }
    }
  };
}
