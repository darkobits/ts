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
  const result = git.sync(['describe', '--tags', '--always']).stdout
    // Remove the 'g' that immediately precedes the commit SHA.
    .replace(/-g(\w{7,})$/g, '-$1')
    // Replace the 'commits since last tag' segment with a dash.
    .replace(/-\d+-/g, '-');

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

  const envFilePath = cwd ? findUp.sync('.env', { cwd }) : findUp.sync('.env');

  if (!envFilePath) {
    return {};
  }

  const result = dotenv.config({ path: envFilePath });

  if (result.error) {
    // @ts-expect-error
    if (result.error.code !== 'ENOENT') {
      log.warn(log.prefix('readDotenvUp'), `Error loading .env file: ${result.error.message}`);
    }

    return {};
  }

  log.verbose(log.prefix('readDotenvUp'), `Loaded ${log.chalk.yellow(Object.keys(result.parsed ?? {}).length)} variables from ${log.chalk.green(envFilePath)}.`);

  return result.parsed;
}


/**
 * Options object accepted by `loadFont`.
 */
export interface LoadFontOptions extends Omit<FontFaceDescriptors, 'weight'> {
  url: string;
  family: string;
  weight?: number;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}


/**
 * Asynchronously loads a remote font and adds it to the document's font list.
 */
export async function loadFont(opts: LoadFontOptions) {
  const { url, family, weight, ...rest } = opts;

  const formatMap: Record<string, string> = {
    woff: 'woff',
    woff2: 'woff2',
    ttf: 'truetype',
    otf: 'opentype'
  };

  const extension = url.split('.').pop();

  const format = extension ? formatMap[extension] : undefined;

  const urlValue = format
    ? `url(${url}) format('${format}')`
    : `url(${url})`;

  const font = new FontFace(family, urlValue, {
    ...rest,
    weight: String(weight)
  } as Required<FontFaceDescriptors>);

  document.fonts.add(await font.load());
}


/**
 * Injects a <script> tag with the provided URL into the document and returns a
 * Promise that resolves when the script has finished loading.
 */
export async function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', err => reject(err));
    document.head.append(script);
  });
}
