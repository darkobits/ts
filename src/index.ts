import { jest } from '@darkobits/ts';

import nr from 'config/nr';
import webpack from 'config/webpack';
const babel = require.resolve('config/babel');
const eslint = require.resolve('config/eslint');

export {
  babel,
  eslint,
  jest,
  nr,
  webpack
};
