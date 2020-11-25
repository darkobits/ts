import { jest } from '@darkobits/ts';
// @ts-expect-error
import nps from 'config/package-scripts';
import webpack from 'config/webpack';


const babel = require.resolve('config/babel');
const eslint = require.resolve('config/eslint');


export {
  babel,
  eslint,
  jest,
  nps,
  webpack
};
