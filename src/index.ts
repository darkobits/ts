import { jest } from '@darkobits/ts';

import nr from 'config/nr';
import vite from 'config/vite';

const babel = require.resolve('config/babel');
const eslint = require.resolve('config/eslint');

export {
  babel,
  eslint,
  jest,
  nr,
  vite
};
