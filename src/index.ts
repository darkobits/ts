import { jest } from '@darkobits/ts';

import nps from 'config/nps';
import webpack from 'config/webpack';
import webpackServerless from 'config/webpack-serverless';
const babel = require.resolve('config/babel');
const eslint = require.resolve('config/eslint');

export {
  babel,
  eslint,
  jest,
  nps,
  webpack,
  webpackServerless
};
