import { vite } from './src'

export default vite.node({
  test: {
    coverage: {
      exclude: [
        'src/index.ts',
        'src/config',
        'src/etc'
      ],
      thresholds: {
        lines: 40,
        branches: 50,
        functions: 50,
        statements: 40
      }
    }
  }
})