import merge from 'deepmerge';

import jest from './jest';

import type { Config } from '@jest/types';


// Note: Having this function return `any` prevents a TS9006 declaration emit
// error for consumers because Config.InitialOptions uses a private type.
// However, we can still use it to type our config parameter to provide
// type safety to consumers.

// Note: This is not a "true" Jest + ESM configuration. Rather, it pairs with
// our Babel ESM configuration to ensure that source modules _and_ third-party
// packages written in ESM are all transformed to CommonJS during testing. As of
// Sep 2022, Jest's support for ESM is still experimental, and this setup is
// currently the easiest way to ensure packages written and published as ESM can
// use Jest for testing.

export default (userConfig: Config.InitialOptions = {}) => merge<any>({
  // This tells Jest to transform third-party packages as well. While this may
  // cause a performance hit, but is required to make testing work for packages
  // that depend on third-party ESM dependencies.
  transformIgnorePatterns: []
}, jest(userConfig));
