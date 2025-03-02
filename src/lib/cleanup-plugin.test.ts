import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import cleanupPlugin from './cleanup-plugin'

import type { NormalizedOutputOptions, OutputBundle, OutputChunk } from 'rollup'

// Test utilities for creating minimal but type-safe mocks
const createMinimalOutputOptions = (overrides: Partial<NormalizedOutputOptions> = {}): NormalizedOutputOptions => {
  return {
    format: 'es',
    ...overrides
  } as NormalizedOutputOptions
}

const createMinimalChunk = (fileName: string, code = ''): OutputChunk => {
  return {
    type: 'chunk',
    fileName,
    code,
    // eslint-disable-next-line unicorn/no-null
    facadeModuleId: null,
    exports: [],
    imports: [],
    modules: {},
    dynamicImports: []
  } as unknown as OutputChunk
}

const createMinimalBundle = (chunks: Record<string, OutputChunk>): OutputBundle => {
  return chunks as OutputBundle
}

// vi.mock('./log', () => ({
//   default: {
//     verbose: vi.fn()
//   }
// }))

vi.mock('chalk', () => ({
  default: {
    dim: {
      cyan: (str: string) => str
    },
    green: (str: string) => str
  }
}))

describe('cleanupPlugin', () => {
  const mockOptions = {
    root: '/mock/root',
    removeEmptyChunks: true
  }

  const mockEmptyChunkContent = '\n//# sourceMappingURL=data:application/json;base64,abc123\n'
  const mockNormalChunkContent = 'export const something = true;'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('generateBundle hook', () => {
    it('skips empty chunk removal when option is disabled', () => {
      const plugin = cleanupPlugin({
        ...mockOptions,
        removeEmptyChunks: false
      })

      const outputOptions = createMinimalOutputOptions()
      const bundle = createMinimalBundle({
        'empty.js': createMinimalChunk('empty.js', mockEmptyChunkContent)
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // The bundle should still contain the empty chunk.
      expect(bundle['empty.js']).toBeDefined()
    })

    it('removes empty chunks from the bundle', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      const bundle = createMinimalBundle({
        'empty.js': createMinimalChunk('empty.js', mockEmptyChunkContent)
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // The empty chunk should be removed from the bundle.
      expect(bundle['empty.js']).toBeUndefined()
    })

    it('removes source maps for empty chunks', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      // Create a bundle with an empty chunk and its source map.
      const bundle = createMinimalBundle({
        'empty.js': createMinimalChunk('empty.js', mockEmptyChunkContent)
      })

      // Add a source map file.
      bundle['empty.js.map'] = {
        type: 'asset',
        fileName: 'empty.js.map',
        source: '{}'
      } as any

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // Both the empty chunk and its source map should be removed.
      expect(bundle['empty.js']).toBeUndefined()
      expect(bundle['empty.js.map']).toBeUndefined()
    })

    it('preserves non-empty chunks', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()
      const bundle = createMinimalBundle({
        'normal.js': createMinimalChunk('normal.js', mockNormalChunkContent)
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // The non-empty chunk should still be in the bundle.
      expect(bundle['normal.js']).toBeDefined()
    })

    it('handles non-JS files correctly', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      // Create a bundle with a non-JS file.
      const bundle = {
        'styles.css': { type: 'asset', fileName: 'styles.css', source: 'body { color: red; }' }
      } as unknown as OutputBundle

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // The CSS file should still be in the bundle.
      expect(bundle['styles.css']).toBeDefined()
    })
  })

  describe('empty chunk detection', () => {
    it('correctly identifies empty chunks with various source map formats', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      const emptyChunkVariations = [
        '\n//# sourceMappingURL=data:application/json;base64,xyz789\n',
        '\n//# sourceMappingURL=test.js.map\n'
      ]

      for (const content of emptyChunkVariations) {
        const bundle = createMinimalBundle({
          'test.js': createMinimalChunk('test.js', content)
        })

        const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
        generateBundle(outputOptions, bundle)

        // The empty chunk should be removed
        expect(bundle['test.js']).toBeUndefined()
        vi.clearAllMocks()
      }
    })

    it('handles malformed source map comments', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      const malformedContent = '\n//# sourceMappingURL\n'
      const bundle = createMinimalBundle({
        'test.js': createMinimalChunk('test.js', malformedContent)
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      // The chunk with malformed source map should not be identified as empty.
      expect(bundle['test.js']).toBeDefined()
    })

    it('handles chunks with no code property', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()

      // Create a chunk without a code property
      const chunk = createMinimalChunk('test.js')
      delete (chunk as any).code

      const bundle = createMinimalBundle({ 'test.js': chunk })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)
      expect(bundle['test.js']).toBeDefined()
    })
  })
})