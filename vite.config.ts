import { vite } from './src'

export default vite.node({
  test: {
    coverage: {
      exclude: [
        'src/index.ts',
        'src/config',
        'src/etc',
        'src/lib/log'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
})