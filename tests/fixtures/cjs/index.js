// const { vite } = require('../../../dist');


async function main() {
  const { vite } = await import('../../../dist/index.js');
  const viteConfigFn = vite.library();
  const viteConfig = await viteConfigFn();

  if (typeof viteConfig !== 'object') {
    throw new TypeError('[fixtures:cjs] Assertion failed.');
  }
}


void main();
