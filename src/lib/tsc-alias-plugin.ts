import chalk from 'chalk'
import merge from 'deepmerge'
import ms from 'ms'
import {
  replaceTscAliasPaths,
  type ReplaceTscAliasPathsOptions
} from 'tsc-alias'

import log from './log'

import type { Plugin } from 'vite'

const prefix = chalk.dim.cyan('tsc-alias')

/**
 * @private
 *
 * Default options for the plugin. Output options `assert` and `clear` are
 * exact copies of the default implementations, but tsc-alias does not merge
 * options, so we must define every required property for `output`
 */
const defaultOptions: ReplaceTscAliasPathsOptions = {
  debug: log.level >= 4,
  output: {
    verbose: true,
    clear: () => {
      // Empty function.
    },
    debug: message => {
      void message
      log.debug(prefix, message)
    },
    info: message => {
      log.debug(prefix, message)
    },
    error(message) {
      log.error(prefix, message)
      this.error(message, true)
    },
    assert(claim, message) {
      void (claim || this.error(message, true))
    }
  }
}

/**
 * Responsible for running tsc-alias on emitted declaration files.
 */
export default function tscAliasPlugin(userOptions: ReplaceTscAliasPathsOptions = {}): Plugin {
  const options = merge(defaultOptions, userOptions)

  return {
    name: 'ts:tsc-alias-plugin',
    enforce: 'post',
    async closeBundle() {
      const startTime = Date.now()

      try {
        await replaceTscAliasPaths(options)
        const time = Date.now() - startTime
        log.debug(prefix, chalk.gray(`Done in ${ms(time)}.`))
      } catch (error: any) {
        this.error(error)
      }
    }
  }
}