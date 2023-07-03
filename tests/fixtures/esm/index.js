import { vite } from '../../../dist/index.js';

const viteConfigFn = vite.library();
const viteConfig = await viteConfigFn();

if (typeof viteConfig !== 'object') {
  throw new TypeError('[fixtures:esm] Assertion failed.');
}
