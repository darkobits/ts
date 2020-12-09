import webpack from './react';
import serverless from './serverless';
import vanilla from './vanilla';


export default Object.assign(webpack, {
  serverless,
  vanilla
}) as typeof webpack & {
  serverless: typeof serverless;
  vanilla: typeof vanilla;
};
