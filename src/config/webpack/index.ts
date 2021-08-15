import node from './node';
import webpack from './react';
import serverless from './serverless';
import vanilla from './vanilla';


export default Object.assign(webpack, {
  serverless,
  vanilla,
  node
});
