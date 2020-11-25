import { getUserScripts } from '@darkobits/ts/lib/utils';
import merge from 'deepmerge';


/**
 * Our default export is a function that can accept an optional NPS
 * configuration or an NPS configuration factory.
 */
export default (userArgument: any) => {
  const scripts: any = {};
  const userScripts: any = getUserScripts(userArgument);

  // Remove the 'compile' scripts from 'ts' which build projects using the Babel
  // CLI.
  scripts.compile = undefined;

  scripts.build = {
    description: 'Build the project with Webpack.',
    script: 'tsx.webpack --mode=production',
    // Remove the build.watch script that we inherit from 'ts'; use 'start'
    // below instead.
    watch: undefined
  };

  scripts.start = {
    description: 'Start Webpack dev server.',
    script: 'tsx.webpack-dev-server --mode=development'
  };

  return merge.all([
    // Base scripts from 'ts'.
    require('@darkobits/ts').nps(),
    // Local overrides.
    { scripts },
    // User overrides.
    userScripts
  ]);
};
