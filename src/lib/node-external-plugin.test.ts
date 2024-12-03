/* eslint-disable unicorn/no-null */
import path from 'node:path'

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { nodeExternalPlugin } from './node-external-plugin'

vi.mock('./log')

vi.mock('node:module', () => ({
  createRequire: () => ({
    resolve: vi.fn((id: string, options: {paths: Array<string>}) => {
      if (id === 'existing-module') return path.join(options.paths[0], 'node_modules', id, 'index.js')
      throw new Error('Module not found')
    })
  })
}))

describe('ts:plugin-node-externals', () => {
  const mockRoot = '/test/project/root'

  let plugin: ReturnType<typeof nodeExternalPlugin>

  beforeEach(() => {
    vi.clearAllMocks()
    plugin = nodeExternalPlugin({ root: mockRoot })
  })

  describe('resolveId', () => {
    it('should return null for entry points', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['test-module', '/src/index.ts', { isEntry: true }]
        )

        expect(result).toBeNull()
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should return null when no importer is provided', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['test-module', undefined, { isEntry: false }]
        )

        expect(result).toBeNull()
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should handle relative paths in node_modules', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['./node_modules/some-module', '/src/index.ts', { isEntry: false }]
        )

        expect(result).toEqual({
          id: './node_modules/some-module',
          external: true
        })
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should handle absolute paths in node_modules', async () => {
      if (typeof plugin.resolveId === 'function') {
        const absolutePath = path.join(mockRoot, 'node_modules/some-module')

        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          [absolutePath, '/src/index.ts', { isEntry: false }]
        )

        expect(result).toEqual({
          id: absolutePath,
          external: true
        })
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should handle bare module specifiers that exist', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['existing-module', '/src/index.ts', { isEntry: false }]
        )

        expect(result).toEqual({
          id: 'existing-module',
          external: true
        })
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should return null for non-existent bare module specifiers', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['non-existent-module', '/src/index.ts', { isEntry: false }]
        )

        expect(result).toBeNull()
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should handle module specifiers with query parameters', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['existing-module?query=param', '/src/index.ts', { isEntry: false }]
        )

        expect(result).toEqual({
          id: 'existing-module',
          external: true
        })
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should return null for relative paths outside node_modules', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          ['./src/utils', '/src/index.ts', { isEntry: false }]
        )

        expect(result).toBeNull()
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })

    it('should return null for absolute paths outside node_modules', async () => {
      if (typeof plugin.resolveId === 'function') {
        const result = await Reflect.apply(
          plugin.resolveId,
          null,
          [path.join(mockRoot, 'src/utils'), '/src/index.ts', { isEntry: false }]
        )

        expect(result).toBeNull()
      } else {
        throw new TypeError(`Expected type of plugin.resolveId to be "function", got "${typeof plugin.resolveId}".`)
      }
    })
  })
})