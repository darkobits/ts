#!/usr/bin/env node

import readPkgUp from 'read-pkg-up';
import { doUpdateNotification } from 'lib/utils';


async function main() {
  // Start from the directory of this file rather than process.cwd(), or we will
  // wind up reading the host project's package.json, not our own.
  const pkg = await readPkgUp({ cwd: __dirname });

  if (!pkg) {
    throw new Error('Unable to read package.json for @darkobits/ts.');
  }

  doUpdateNotification(pkg.packageJson);
}


void main();
