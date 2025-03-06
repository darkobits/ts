import path from 'node:path'

import fs from 'fs-extra'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { getPackageContext } from 'lib/utils'

import executablePlugin from './executable-plugin'

import type { PackageContext } from 'etc/types'
import type { PluginContext } from 'rollup'

vi.mock('fs-extra')
vi.mock('./log')
vi.mock('./utils')

describe('ts:executable-plugin', () => {
  const mockRoot = '/test/root'

  let mockPluginContext: PluginContext

  beforeEach(() => {
    vi.clearAllMocks()

    mockPluginContext = {
      error: vi.fn((err: Error) => {
        throw err
      })
    } as unknown as PluginContext

    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: {}
    } as PackageContext)
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('should handle cases where "bin" is a string', async () => {
    const binPath = 'dist/cli.js'

    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: { bin: binPath }
    } as PackageContext)

    // @ts-expect-error Intentionally invalid argument.
    vi.mocked(fs.exists).mockResolvedValue(true)

    const plugin = executablePlugin()

    if (typeof plugin.closeBundle === 'function') {
      await Reflect.apply(plugin.closeBundle, mockPluginContext, [])
    } else {
      throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
    }

    expect(fs.chmod).toHaveBeenCalledWith(
      path.resolve(mockRoot, binPath),
      '0755'
    )
  })

  it('should handle cases where "bin" is an object', async () => {
    const binPaths = {
      cli1: 'dist/cli1.js',
      cli2: 'dist/cli2.js'
    }

    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: { bin: binPaths }
    } as unknown as PackageContext)

    // @ts-expect-error Intentionally invalid argument.
    vi.mocked(fs.exists).mockResolvedValue(true)

    const plugin = executablePlugin()

    if (typeof plugin.closeBundle === 'function') {
      await Reflect.apply(plugin.closeBundle, mockPluginContext, [])
    } else {
      throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
    }

    expect(fs.chmod).toHaveBeenCalledTimes(2)

    expect(fs.chmod).toHaveBeenCalledWith(
      path.resolve(mockRoot, binPaths.cli1),
      '0755'
    )

    expect(fs.chmod).toHaveBeenCalledWith(
      path.resolve(mockRoot, binPaths.cli2),
      '0755'
    )
  })

  it('should handle non-existent bin files', async () => {
    const binPath = 'dist/missing.js'

    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: { bin: binPath }
    } as PackageContext)

    // @ts-expect-error Intentionally invalid argument.
    vi.mocked(fs.exists).mockResolvedValue(false)

    const plugin = executablePlugin()

    if (typeof plugin.closeBundle === 'function') {
      await Reflect.apply(plugin.closeBundle, mockPluginContext, [])
    } else {
      throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
    }

    expect(fs.chmod).not.toHaveBeenCalled()
  })

  it('should throw an error on invalid "bin" values', async () => {
    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: { bin: 123 as any }
    } as PackageContext)

    const plugin = executablePlugin()

    if (typeof plugin.closeBundle === 'function') {
      await expect(
        Reflect.apply(plugin.closeBundle, mockPluginContext, [])
      ).rejects.toThrow(TypeError)
    } else {
      throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
    }
  })

  it('should handle fs operation errors', async () => {
    const binPath = 'dist/cli.js'

    const mockFsError = new Error('Failed to chmod')

    vi.mocked(getPackageContext).mockResolvedValue({
      root: mockRoot,
      packageJson: { bin: binPath }
    } as PackageContext)

    // @ts-expect-error Intentionally invalid argument.
    vi.mocked(fs.exists).mockResolvedValue(true)

    vi.mocked(fs.chmod).mockRejectedValue(mockFsError)

    const plugin = executablePlugin()

    if (typeof plugin.closeBundle === 'function') {
      await expect(
        Reflect.apply(plugin.closeBundle, mockPluginContext, [])
      ).rejects.toThrow(mockFsError)
    } else {
      throw new TypeError(`Expected type of plugin.closeBundle to be "function", got "${typeof plugin.closeBundle}".`)
    }
  })
})