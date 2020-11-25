import { jest, nps } from '@darkobits/ts';
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
