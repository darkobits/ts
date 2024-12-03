import ms from 'ms'
import { replaceTscAliasPaths } from 'tsc-alias'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import tscAliasPlugin from './tsc-alias-plugin'

vi.mock('tsc-alias')
vi.mock('./log')
vi.mock('ms')

describe('ts:tsc-alias-plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ms).mockReturnValue('100ms' as any)
  })

  describe('plugin configuration', () => {
    it('should create a plugin with correct basic configuration', () => {
      const plugin = tscAliasPlugin()
      expect(plugin.name).toBe('ts:tsc-alias-plugin')
      expect(plugin.enforce).toBe('post')
    })

    it('should merge user options with default options', () => {
      const userOptions = {
        debug: true,
        configFile: 'custom-tsconfig.json'
      }

      const plugin = tscAliasPlugin(userOptions)

      if (typeof plugin.closeBundle === 'function') {
        void Reflect.apply(plugin.closeBundle, {}, [])

        expect(replaceTscAliasPaths).toHaveBeenCalledWith(expect.objectContaining({
          debug: true,
          configFile: 'custom-tsconfig.json',
          output: expect.any(Object)
        }))
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })

    it('should preserve default output handlers when user options are provided', () => {
      const userOptions = {
        debug: true
      }

      const plugin = tscAliasPlugin(userOptions)

      if (typeof plugin.closeBundle === 'function') {
        void Reflect.apply(plugin.closeBundle, {}, [])

        expect(replaceTscAliasPaths).toHaveBeenCalledWith(expect.objectContaining({
          output: expect.objectContaining({
            verbose: true,
            clear: expect.any(Function),
            debug: expect.any(Function),
            info: expect.any(Function),
            error: expect.any(Function),
            assert: expect.any(Function)
          })
        }))
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })
  })

  describe('closeBundle', () => {
    it('should successfully execute replaceTscAliasPaths', async () => {
      const plugin = tscAliasPlugin()
      const mockContext = {
        error: vi.fn()
      }

      if (typeof plugin.closeBundle === 'function') {
        await Reflect.apply(plugin.closeBundle, mockContext, [])
        expect(replaceTscAliasPaths).toHaveBeenCalled()
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })

    it('should handle errors during replaceTscAliasPaths', async () => {
      const mockError = new Error('Failed to replace paths')
      vi.mocked(replaceTscAliasPaths).mockRejectedValueOnce(mockError)

      const plugin = tscAliasPlugin()
      const mockContext = {
        error: vi.fn()
      }

      if (typeof plugin.closeBundle === 'function') {
        await Reflect.apply(plugin.closeBundle, mockContext, [])
        expect(mockContext.error).toHaveBeenCalledWith(mockError)
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })
  })

  describe('output handlers', () => {
    it('should invoke error handler with correct context', () => {
      const plugin = tscAliasPlugin()
      const errorMessage = 'Error test message'
      const mockContext = {
        error: vi.fn()
      }

      if (typeof plugin.closeBundle === 'function') {
        void Reflect.apply(plugin.closeBundle, mockContext, [])

        const options = vi.mocked(replaceTscAliasPaths).mock.calls[0][0]
        options?.output?.error.call(mockContext, errorMessage)

        expect(mockContext.error).toHaveBeenCalledWith(errorMessage, true)
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })

    it('should invoke assert handler with correct context', () => {
      const plugin = tscAliasPlugin()
      const assertMessage = 'Assertion test message'
      const mockContext = {
        error: vi.fn()
      }

      if (typeof plugin.closeBundle === 'function') {
        void Reflect.apply(plugin.closeBundle, mockContext, [])

        const options = vi.mocked(replaceTscAliasPaths).mock.calls[0][0]
        options?.output?.assert.call(mockContext, false, assertMessage)

        expect(mockContext.error).toHaveBeenCalledWith(assertMessage, true)
      } else {
        throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
      }
    })
  })
})