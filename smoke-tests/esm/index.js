import { vite } from '../../dist/index.js';

const viteConfigFn = vite.library();
const viteConfig = await viteConfigFn();

if (typeof viteConfig !== 'object') {
  throw new Error('[fixtures:cjs] Assertion failed.');
}
