import { nps as npsConfig } from '@darkobits/ts';
import { getUserScripts } from '@darkobits/ts/lib/utils';
import merge from 'deepmerge';


/**
 * Our default export is a function that can accept an optional NPS
 * configuration or an NPS configuration factory.
 */
export default userArgument => {
  const userScripts = getUserScripts(userArgument);

  const tsxScripts = npsConfig(({ npsUtils }) => {
    const scripts = {};

    // Remove the 'compile' scripts from 'ts' which builds projects using the
    // Babel CLI.
    scripts.compile = undefined;

    // Overwrite the base 'build' script with one that uses Webpack.
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

    // Overwrite the base 'prepare' script. This version does not run the 'lint'
    // script, which is not necessary as the project will be linted as part of
    // the Webpack build.
    scripts.prepare = npsUtils.series.nps('build', 'test.passWithNoTests');

    return { scripts };
  });

  return merge(tsxScripts, userScripts);
};
