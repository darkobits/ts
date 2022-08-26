import merge from 'deepmerge';

import jest from './jest';

import type { Config } from '@jest/types';


// Note: Having this function return `any` prevents a TS9006 declaration emit
// error for consumers because Config.InitialOptions uses a private type.
// However, we can still use it to type our config parameter to provide
// type safety to consumers.
export default (userConfig: Config.InitialOptions = {}) => merge<any>({
  extensionsToTreatAsEsm: ['.ts', '.tsx']
}, jest(userConfig));
