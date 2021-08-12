#!/usr/bin/env node

import readPkgUp from 'read-pkg-up';

import { doUpdateNotification } from 'lib/utils';


/**
 * Script that logs update information. The function that handles most of the
 * actual notification logic is located in utils.ts so that related packages
 * such as @darkobits/tsx can easily re-use it.
 *
 * See: utils.ts / doUpdateNotification
 */
async function updateNotifier() {
  // Start from the directory of this file rather than process.cwd(), or we will
  // wind up reading the host project's package.json, not our own.
  const pkg = await readPkgUp({ cwd: __dirname });

  if (!pkg) {
    throw new Error('Unable to read package.json for @darkobits/ts.');
  }

  doUpdateNotification(pkg.packageJson);
}


void updateNotifier();
