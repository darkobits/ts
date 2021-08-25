import os from 'os';

import chex from '@darkobits/chex';
import dotenv from 'dotenv';
import findUp from 'find-up';
import IS_CI from 'is-ci';

import log from 'lib/log';


/**
 * Returns an array of all local IP addresses for the host machine.
 */
export function getLocalIpAddresses() {
  return Object.values(os.networkInterfaces()).flatMap(interfaces => {
    return interfaces?.map(i => (i.family === 'IPv4' ? i.address : false)).filter(Boolean);
  }) as Array<string>;
}


/**
 * Returns a short description of the current Git commit using 'git describe'.
 *
 * Example: "v0.12.7-17-9d2f0dc"
 */
export function gitDescribe() {
  const git = chex.sync('git');
  // Remove the 'g' that immediately precedes the commit SHA.
  const result = git.sync(['describe', '--tags', '--always']).stdout.replace(/-g(\w{7,})$/g, '-$1');
  log.verbose(log.prefix('gitDescribe'), `Current Git description: ${log.chalk.green(result)}`);
  return result;
}


/**
 * Searches for and loads the nearest .env file by crawling up the directory
 * tree starting at `cwd`, process.cwd() if none was provided.
 *
 * Note: IS_CI is used here to bail rather than argv.mode so that users can
 * run production builds locally for testing/debugging.
 */
export function readDotenvUp(cwd?: string) {
  if (IS_CI) {
    log.warn(log.prefix('readDotenvUp'), 'Not loading .env because a CI environment has been detected.');
    return;
  }

  const envFilePath = findUp.sync('.env', { cwd });
  const result = dotenv.config({ path: envFilePath });

  if (result.error) {
    log.warn(log.prefix('readDotenvUp'), `Error loading .env file: ${result.error.message}`);
    return {};
  }

  log.verbose(log.prefix('readDotenvUp'), `Loaded ${log.chalk.yellow(Object.keys(result.parsed ?? {}).length)} variables from ${log.chalk.green(envFilePath)}.`);

  return result.parsed;
}
