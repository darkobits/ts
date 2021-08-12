#!/usr/bin/env node

import path from 'path';

import chex from '@darkobits/chex';
import env from '@darkobits/env';
import fs from 'fs-extra';

import log from 'lib/log';
import { getPackageInfo } from 'lib/utils';


async function createSymlink(binName: string, symlinkTarget: string, symlinkPath: string) {
  try {
    if (env.eq('LINK_BINS', false)) {
      log.verbose(log.prefix('link-bins'), 'No-op.');
      return;
    }

    // Determine if a file (of any type) already exists at the path where we
    // want to create the symlink.
    if (await fs.stat(symlinkPath)) {
      // If a file exists, let's assume its a symbolic link, and try to
      // determine its target. If the file is not a symlink, this will throw.
      const existingSymlinkTarget = await fs.readlink(symlinkPath);
      log.verbose(log.prefix('link-bins'), `Existing symlink target: ${log.chalk.green(existingSymlinkTarget)}`);

      if (existingSymlinkTarget !== symlinkTarget) {
        log.warn(log.prefix('link-bins'), `Symlink for ${log.chalk.green(binName)} already exists and points to ${log.chalk.green(existingSymlinkTarget)}.`);
        log.warn(log.prefix('link-bins'), 'This symlink will be overwritten.');
        await fs.remove(symlinkPath);
      } else {
        log.verbose(log.prefix('link-bins'), `Symlink for ${log.chalk.green(binName)} already exists and points to desired target.`);
        return;
      }
    }
  } catch (err) {
    if (err.code === 'EINVAL') {
      log.warn(log.prefix('link-bins'), `${log.chalk.green(binName)}: File exists at ${log.chalk.green(symlinkPath)} that is ${log.chalk.bold('not')} a symbolic link. ${log.chalk.red.bold('Refusing to overwrite this file.')}`);
      return;
    }

    if (err.code === 'ENOENT') {
      // No file exists at the target symlink path.
    } else {
      // Re-throw all other errors.
      throw err;
    }
  }

  // If we haven't thrown or returned yet, it is implied that we can proceed to
  // write a symlink at the target path.
  const relativeSymlinkPath = path.relative(process.cwd(), symlinkPath);
  const relativeSymlinkTarget = path.relative(process.cwd(), symlinkTarget);
  await fs.ensureSymlink(symlinkTarget, symlinkPath);
  log.verbose(log.prefix('link-bins'), `${log.chalk.bold(binName)}: ${log.chalk.green(relativeSymlinkPath)} ${log.chalk.gray('=>')} ${log.chalk.green(relativeSymlinkTarget)}`);
}


/**
 * Creates symlinks for the host package's declared binaries in its local
 * ./node_modules/.bin/ directory so that they can be invoked via the command
 * line as long as ./node_modules/.bin/ is in PATH.
 *
 * TODO: This script will fail if the target symlink already exists. Implement a
 * --force option that will overwrite existing files.
 */
async function linkBins() {
  try {
    const pkg = getPackageInfo();

    // If the host package does not declare any binaries, bail.
    if (!pkg.json.bin) {
      log.verbose(log.prefix('link-bins'), 'Local package.json does not have a "bin" field.');
      return;
    }

    const npm = await chex('npm >=6.0.0');
    const { stdout: npmBinDir } = await npm(['bin']);

    log.silly(log.prefix('link-bins'), `NPM bin path: ${log.chalk.green(npmBinDir)}`);

    await Promise.all(Object.entries(pkg.json?.bin).map(async ([binName, binPath]) => {
      const symlinkPath = path.join(npmBinDir, binName);
      const symlinkTarget = path.resolve(path.join(pkg.rootDir, binPath));

      try {
        await createSymlink(binName, symlinkTarget, symlinkPath);
      } catch (err) {
        err.message = `${log.prefix('link-bins')} Error linking ${binName}: ${err.message}`;
        throw err;
      }
    }));

    log.verbose(`Linked ${log.chalk.yellow(Object.entries(pkg.json?.bin).length)} package binaries.`);
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
}


void linkBins();
