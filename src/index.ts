// @ts-expect-error
import nps from 'config/package-scripts';
// @ts-expect-error
import jest from 'config/jest';


const babel = require.resolve('config/babel');
const eslint = require.resolve('config/eslint');


export {
  babel,
  eslint,
  jest,
  nps
};
