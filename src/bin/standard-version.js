#!/usr/bin/env node

import merge from 'deepmerge';
import * as R from 'ramda';
import standardVersion from 'standard-version';
import cmdParser from 'standard-version/command';

import customConfig from 'config/standard-version';


/**
 * Merge provided command line arguments (as parsed using standard-version's
 * parser) with our custom configuration. Note: As currently implemented, local
 * config will overwrite command line arguments. This is not ideal, but
 * currently we are only overwriting options that users are not likely going to
 * try to pass to standard-version. If that changes, this will need to be
 * refactored in the future.
 */
const config = merge(cmdParser.argv, customConfig, {
  // Strategy for merging arrays of objects, de-duping on each object's "type"
  // key.
  arrayMerge: (left, right) => R.uniqBy(R.prop('type'), R.concat(right, left))
});


standardVersion(config).catch(() => {
  process.exit(1);
});
