import merge from 'deepmerge';
// @ts-expect-erro - No type defs exist for this package.
// import * as npsUtils from 'nps-utils';

import { getUserScripts } from '@darkobits/ts/lib/utils';


/**
 * Our default export is a function that can accept nothing, an NPS
 * scripts/options object, or a function that returns an NPS scripts/options
 * object.
 */
export default (userArgument: any) => {
  const scripts: any = {};
  const userScripts: any = getUserScripts(userArgument);

  scripts.build = {
    description: 'Build the project with Webpack.',
    script: 'unified.webpack --mode=production',
    watch: undefined
  };

  scripts.start = {
    description: 'Start Webpack dev server.',
    script: 'unified.webpack-dev-server --mode=development'
  };

  return merge.all([
    // Base scripts from ts.
    require('@darkobits/ts').nps(),
    // Local overrides.
    { scripts },
    // User overrides.
    userScripts
  ]);
};
