import jest from 'config/jest';
import nr from 'config/nr';

const babel = require.resolve('config/babel');
const babelEsm = require.resolve('config/babel-esm');
const eslint = require.resolve('config/eslint');

export {
  babel,
  babelEsm,
  eslint,
  jest,
  nr
};
