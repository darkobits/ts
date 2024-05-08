import { vite } from './src';

export default vite.library({
  test: {

    coverage: {
      exclude: [
        'src/index.ts',
        'src/config',
        'src/etc'
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100
      }
    }
  }
});
