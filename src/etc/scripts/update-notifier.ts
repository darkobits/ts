#!/usr/bin/env node

import { dirname } from '@darkobits/fd-name';

import { doUpdateNotification } from 'lib/utils';


/**
 * Script that logs update information. The function that handles most of the
 * actual notification logic is located in utils.ts so that related packages
 * such as @darkobits/tsx can easily re-use it.
 *
 * See: utils.ts / doUpdateNotification
 */
async function updateNotifier() {
  const { readPackageUp } = await import('read-pkg-up');

  const curDir = dirname();

  if (!curDir) {
    throw new Error('[updateNotifier] Failed to get current directory name.');
  }

  // Start from the directory of this file rather than process.cwd(), or we will
  // wind up reading the host project's package.json, not our own.
  const pkg = await readPackageUp({ cwd: curDir });

  if (!pkg) {
    throw new Error('Unable to read package.json for @darkobits/ts.');
  }

  doUpdateNotification(pkg.packageJson);
}


void updateNotifier();
