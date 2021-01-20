#!/usr/bin/env node

import ms from 'ms';
import readPkgUp from 'read-pkg-up';
import updateNotifier from 'update-notifier';

import log from 'lib/log';


function getColorForUpdateType(updateType?: string) {
  switch (updateType) {
    case 'major':
      return 'red';
    case 'minor':
      return 'yellow';
    case 'patch':
      return 'green';
    default:
      return 'gray';
  }
}


async function main() {
  log.silly('Running update notifier.');

  // Start from the directory of this file rather than process.cwd(), or we will
  // wind up reading the host project's package.json, not our own.
  const pkg = await readPkgUp({ cwd: __dirname });

  if (!pkg) {
    throw new Error('Unable to read package.json for @darkobits/ts.');
  }

  const notifier = updateNotifier({
    pkg: pkg.packageJson,
    updateCheckInterval: ms('1 second'),
    shouldNotifyInNpmScript: true,
    distTag: 'beta'
  });

  const type = notifier.update?.type;
  const color = getColorForUpdateType(type);

  notifier.notify({
    defer: false,
    isGlobal: false,
    message: [
      `Ahoy hoy! 👋 A new ${log.chalk[color](type)} version of ${log.chalk.blueBright('@darkobits/ts')} is available!`,
      `Run ${log.chalk.bold('{updateCommand}')} to update from ${log.chalk.gray('{currentVersion}')} -> ${log.chalk.green('{latestVersion}')}. ✨`
    ].join('\n')
  });
}


void main();
