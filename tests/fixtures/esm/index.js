import { vite } from '../../../dist/index.js'

const viteConfigFn = vite.node()
const viteConfig = await viteConfigFn()

if (typeof viteConfig !== 'object') {
  throw new TypeError('[fixtures:esm] Assertion failed.')
}