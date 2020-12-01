// -----------------------------------------------------------------------------
// ----- NPS Configuration -----------------------------------------------------
// -----------------------------------------------------------------------------

import { nps } from '@darkobits/ts';
import {
  NPSConfiguration,
  NPSConfigurationFactory
} from '@darkobits/ts/etc/types';
import { getUserScripts } from '@darkobits/ts/lib/utils';
import merge from 'deepmerge';


/**
 * Our default export is a function that can accept an optional NPS
 * configuration object or an NPS configuration factory.
 */
export default (arg0?: NPSConfiguration | NPSConfigurationFactory): NPSConfiguration => {
  const userScripts = getUserScripts(arg0);

  // Use the `ts` NPS configuration function to merge the 'ts' package scripts
  // and the 'tsx' package scripts.
  const tsxScripts = nps(({ npsUtils }: any) => {
    const scripts: any = {};

    // Remove the 'compile' scripts from 'ts'; Webpack projects will not need to
    // invoke the Babel CLI directly.
    scripts.compile = undefined;

    // Overwrite the base 'build' script with one that invokes Webpack.
    scripts.build = {
      description: 'Build the project with Webpack.',
      script: 'tsx.webpack --mode=production',
      // Remove the base 'build.watch' script; users should use the 'start'
      // script instead.
      watch: undefined
    };

    scripts.start = {
      description: 'Start Webpack dev server.',
      script: 'tsx.webpack-dev-server --mode=development'
    };

    // Overwrite the base 'prepare' script with one that omits the 'lint'
    // script, which is not necessary as the project will be linted as part of
    // the Webpack build.
    scripts.prepare = npsUtils.series.nps('build', 'test.passWithNoTests');

    return { scripts };
  });

  // Then, use deepmerge to apply any user-provided scripts and return the final
  // configuration object to NPS.
  return merge(tsxScripts, userScripts);
};
