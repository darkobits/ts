#!/usr/bin/env node

import { dirname } from '@darkobits/fd-name';

import { getPackageInfo, showUpdateNotification } from 'lib/utils';

async function main() {
  const curDir = dirname();

  if (!curDir) {
    throw new Error('[updateNotifier] Failed to get current directory name.');
  }

  // Start from the directory of this file rather than process.cwd(), or we will
  // wind up reading the host project's package.json, not our own.
  const pkg = await getPackageInfo(curDir);

  if (!pkg) {
    throw new Error('Unable to read package.json for @darkobits/ts.');
  }

  await showUpdateNotification(pkg.json);
}


void main();
