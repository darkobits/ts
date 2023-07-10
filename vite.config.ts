import { vite } from './src';

export default vite.library({
  test: {
    coverage: {
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100
    }
  }
});
