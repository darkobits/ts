#!/usr/bin/env node

import path from 'path';

import chex from '@darkobits/chex';
import fs from 'fs-extra';

import log from 'lib/log';
import { getPackageInfo } from 'lib/utils';


/**
 * Creates symlinks for this package's declared binaries in its local
 * node_modules/.bin directory so that this package can invoke them in the same
 * way a dependent package would.
 */
async function linkBins() {
  try {
    const runTime = log.createTimer();
    const pkg = getPackageInfo(__dirname);

    if (!pkg.json.bin) {
      throw new Error(`${log.prefix('link-bins')} Local package.json does not have a "bin" field.`);
    }

    const npm = await chex('npm ^6.0.0');
    const { stdout: npmBinDir } = await npm(['bin']);

    log.silly(log.prefix('link-bins'), `NPM bin path: ${log.chalk.green(npmBinDir)}`);

    await Promise.all(Object.entries(pkg.json?.bin).map(async ([binName, binPath]) => {
      const symlinkPath = path.join(npmBinDir, binName);
      const relativeSymlinkPath = path.relative(pkg.rootDir, symlinkPath);
      const symlinkTarget = path.resolve(path.join(pkg.rootDir, binPath));
      const relativeSymlinkTarget = path.relative(pkg.rootDir, symlinkTarget);

      try {
        await fs.ensureSymlink(symlinkTarget, symlinkPath);
        log.verbose(log.prefix('link-bins'), `${log.chalk.bold(binName)}: ${log.chalk.green(relativeSymlinkPath)} ${log.chalk.gray('=>')} ${log.chalk.green(relativeSymlinkTarget)}`);
      } catch (err) {
        err.message = `${log.prefix('link-bins')} Error linking ${binName}: ${err.message}`;
        throw err;
      }
    }));

    log.verbose(log.prefix('link-bins'), `Done. ${log.chalk.gray(`(${runTime})`)}`);
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
}


export default linkBins();
