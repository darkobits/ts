#!/usr/bin/env node
import log from 'lib/log';
import type { SkipWarningPayload } from 'etc/types';


function main() {
  const {
    npmCommand,
    npmScriptName,
    npmScriptValue,
    rootNpsScriptName,
    localNpsScriptName
  }: SkipWarningPayload = JSON.parse(Buffer.from(process.argv[2], 'base64').toString('ascii'));

  // Issue warning.
  process.stderr.write('\n');

  log.warn(log.chalk.dim.bold([
    `Skipping the execution of the ${log.chalk.green(localNpsScriptName)} script as part of the`,
    `${log.chalk.green(npmCommand)} command because a CI environment has been detected.`
  ].join(' ')));

  log.warn(log.chalk.dim.bold([
    `To execute this script, explicitly call ${log.chalk.green(`nps ${localNpsScriptName}`)} in your`,
    'CI configuration file.'
  ].join(' ')));

  process.stderr.write('\n');

  log.verbose('NPM Lifecycle Event/Script Name:', log.chalk.green(npmScriptName));
  log.verbose('NPM Lifecycle Event/Script Value:', log.chalk.green(npmScriptValue));
  log.verbose('NPS Root Script Name:', log.chalk.green(rootNpsScriptName));
  log.verbose('NPS Local Script Name/Label:', log.chalk.green(localNpsScriptName));
}


void main();
