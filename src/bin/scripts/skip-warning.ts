#!/usr/bin/env node

import type { SkipWarningPayload } from 'etc/types';
import log from 'lib/log';
import { fromBase64 } from 'lib/utils';


/**
 * When in a CI environment, this package will skip running its 'prepare' NPS
 * script as part of any NPM lifecycle script (ex: "postinstall", "prepare").
 * This is done because our prepare script lints, builds, and tests the host
 * project. However, if dependency caches are used, the CI job may skip invoking
 * "npm install" / "npm ci" entirely, resulting in the project not being built.
 * Making the developer explicitly invoke package scripts also results in a more
 * readable and less "magical" CI configuration file.
 *
 * This function is responsible for issuing a warning when one of these scripts
 * will not execute. Because all NPS scripts must resolve to strings, it is
 * necessary to implement this logging logic as a standalone script. We pass
 * relevant contextual data to it via a single base-64 encoded string argument.
 *
 * See: utils.ts / skipIfCiNpmLifecycle
 */
function issueSkipWarning() {
  const {
    npmCommand,
    npmScriptName,
    npmScriptValue,
    rootNpsScriptName,
    localNpsScriptName
  } = fromBase64<SkipWarningPayload>(process.argv[2]);

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


void issueSkipWarning();
