import path from 'node:path'

import fs from 'fs-extra'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import cleanupPlugin from './cleanup-plugin'
import log from './log'

import type { NormalizedOutputOptions, OutputBundle, OutputChunk, PluginContext } from 'rollup'

// Properly type the mocked fs module
vi.mock('fs-extra', () => ({
  default: {
    readFile: vi.fn(),
    remove: vi.fn()
  }
}))

// Test utilities for creating minimal but type-safe mocks
const createMinimalOutputOptions = (overrides: Partial<NormalizedOutputOptions> = {}): NormalizedOutputOptions => {
  return {
    format: 'es',
    ...overrides
  } as NormalizedOutputOptions
}

const createMinimalChunk = (fileName: string): OutputChunk => {
  return {
    type: 'chunk',
    fileName,
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

const createMinimalPluginContext = (overrides: Partial<PluginContext> = {}): PluginContext => {
  return {
    error: vi.fn(),
    ...overrides
  } as PluginContext
}

vi.mock('./log')

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
    // Type assertion for the mocked functions
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vi.mocked(fs.readFile).mockImplementation(() => Promise.resolve(''))
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vi.mocked(fs.remove).mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('plugin configuration', () => {
    it('returns a properly configured Vite plugin', () => {
      const plugin = cleanupPlugin(mockOptions)

      expect(plugin.name).toBe('ts:cleanup-plugin')
      expect(plugin.enforce).toBe('post')
      expect(typeof plugin.generateBundle).toBe('function')
      expect(typeof plugin.closeBundle).toBe('function')
    })
  })

  describe('generateBundle hook', () => {
    it('tracks emitted files with explicit output directory', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'file1.js': createMinimalChunk('file1.js'),
        'file2.js': createMinimalChunk('file2.js')
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      expect(fs.readFile).not.toHaveBeenCalled()
    })

    it('tracks emitted files with explicit output file', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ file: '/output/bundle.js' })
      const bundle = createMinimalBundle({
        'file1.js': createMinimalChunk('file1.js')
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      expect(fs.readFile).not.toHaveBeenCalled()
    })

    it('handles missing output options gracefully', () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions()
      const bundle = createMinimalBundle({
        'file1.js': createMinimalChunk('file1.js')
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      generateBundle(outputOptions, bundle)

      expect(fs.readFile).not.toHaveBeenCalled()
    })
  })

  describe('closeBundle hook', () => {
    it('skips empty chunk removal when option is disabled', async () => {
      const plugin = cleanupPlugin({
        ...mockOptions,
        removeEmptyChunks: false
      })

      const closeBundle = plugin.closeBundle as () => Promise<void>
      await closeBundle()

      expect(fs.readFile).not.toHaveBeenCalled()
      expect(fs.remove).not.toHaveBeenCalled()
    })

    it('removes empty chunks when detected', async () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'empty.js': createMinimalChunk('empty.js')
      })

      // @ts-expect-error
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockEmptyChunkContent)

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      const closeBundle = plugin.closeBundle as () => Promise<void>

      generateBundle(outputOptions, bundle)
      await closeBundle()

      expect(fs.readFile).toHaveBeenCalledWith(
        path.join('/output/dir', 'empty.js'),
        'utf8'
      )
      expect(fs.remove).toHaveBeenCalledWith(
        path.join('/output/dir', 'empty.js')
      )
      expect(log.debug).toHaveBeenCalledWith(
        'cleanup-plugin',
        'Removed empty chunk:',
        expect.any(String)
      )
    })

    it('preserves non-empty chunks', async () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'normal.js': createMinimalChunk('normal.js')
      })

      // @ts-expect-error
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockNormalChunkContent)

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      const closeBundle = plugin.closeBundle as () => Promise<void>

      generateBundle(outputOptions, bundle)
      await closeBundle()

      expect(fs.readFile).toHaveBeenCalledWith(
        path.join('/output/dir', 'normal.js'),
        'utf8'
      )
      expect(fs.remove).not.toHaveBeenCalled()
      expect(log.debug).not.toHaveBeenCalled()
    })

    it('handles errors during cleanup', async () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'error.js': createMinimalChunk('error.js')
      })

      const mockError = new Error('Mock filesystem error')
      vi.mocked(fs.readFile).mockRejectedValueOnce(mockError)

      const mockPluginContext = createMinimalPluginContext({ error: vi.fn() as any })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      const closeBundle = plugin.closeBundle as (this: PluginContext) => Promise<void>

      generateBundle(outputOptions, bundle)
      await closeBundle.call(mockPluginContext)

      expect(mockPluginContext.error).toHaveBeenCalledWith(mockError)
    })
  })

  describe('empty chunk detection', () => {
    it('correctly identifies empty chunks', async () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'test.js': createMinimalChunk('test.js')
      })

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      const closeBundle = plugin.closeBundle as () => Promise<void>

      const emptyChunkVariations = [
        '\n//# sourceMappingURL=data:application/json;base64,xyz789\n',
        '\n//# sourceMappingURL=test.js.map\n'
      ]

      for (const content of emptyChunkVariations) {
        vi.mocked(fs.readFile).mockReset()
        // @ts-expect-error
        vi.mocked(fs.readFile).mockResolvedValueOnce(content)

        generateBundle(outputOptions, bundle)
        await closeBundle()

        expect(fs.remove).toHaveBeenCalled()
      }
    })

    it('handles malformed source map comments', async () => {
      const plugin = cleanupPlugin(mockOptions)
      const outputOptions = createMinimalOutputOptions({ dir: '/output/dir' })
      const bundle = createMinimalBundle({
        'test.js': createMinimalChunk('test.js')
      })

      const malformedContent = '\n//# sourceMappingURL\n'
      // @ts-expect-error
      vi.mocked(fs.readFile).mockResolvedValueOnce(malformedContent)

      const generateBundle = plugin.generateBundle as (options: NormalizedOutputOptions, bundle: OutputBundle) => void
      const closeBundle = plugin.closeBundle as () => Promise<void>

      generateBundle(outputOptions, bundle)
      await closeBundle()

      expect(fs.remove).not.toHaveBeenCalled()
    })
  })
})