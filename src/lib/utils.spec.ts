/* eslint-disable unicorn/no-null,  unicorn/no-useless-undefined */
import { execSync } from 'node:child_process'

import { findUp } from 'find-up'
import { getTsconfig, type TsConfigResult } from 'get-tsconfig'
import { readPackageUp } from 'read-package-up'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  getPackageContext,
  inferESLintConfigurationStrategy,
  createViteConfigurationScaffold,
  createPluginReconfigurator,
  gitDescribe
} from './utils'

import type { ViteConfigurationScaffold } from 'etc/types'

vi.mock('node:child_process')
vi.mock('read-package-up')
vi.mock('get-tsconfig')
vi.mock('find-up')
vi.mock('./log')

describe('getPackageContext', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should correctly handle successful package context retrieval', async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      path: '/test/path/package.json',
      packageJson: {}
    })
    vi.mocked(findUp).mockResolvedValue('/test/path/tsconfig.json')
    vi.mocked(getTsconfig).mockReturnValue({
      config: {
        compilerOptions: {
          baseUrl: '/test/src',
          outDir: 'dist'
        }
      }
    } as TsConfigResult)

    const result = await getPackageContext()
    expect(result).toEqual(expect.objectContaining({
      root: '/test/path',
      srcDir: '/test/src',
      outDir: expect.any(String),
      tsConfigPath: '/test/path/tsconfig.json',
      packageJson: {}
    }))
  })

  it('should handle missing package.json', async () => {
    vi.mocked(readPackageUp).mockResolvedValue(undefined)
    await expect(getPackageContext()).rejects.toThrow('Unable to find package.json')
  })

  it('should handle missing tsconfig.json', async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      path: '/test/path/package.json',
      packageJson: {}
    })
    vi.mocked(findUp).mockResolvedValue(undefined)
    await expect(getPackageContext()).rejects.toThrow('Unable to find tsconfig.json')
  })

  it('should handle invalid tsconfig.json', async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      path: '/test/path/package.json',
      packageJson: {}
    })
    vi.mocked(findUp).mockResolvedValue('/test/path/tsconfig.json')
    vi.mocked(getTsconfig).mockReturnValue(null)
    await expect(getPackageContext()).rejects.toThrow('Unable to locate a tsconfig.json file')
  })

  it('should handle missing baseUrl in tsconfig.json', async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      path: '/test/path/package.json',
      packageJson: {}
    })
    vi.mocked(findUp).mockResolvedValue('/test/path/tsconfig.json')
    vi.mocked(getTsconfig).mockReturnValue({
      config: {
        compilerOptions: {}
      }
    } as TsConfigResult)
    await expect(getPackageContext()).rejects.toThrow('"compilerOptions.baseUrl" must be set')
  })

  it('should handle missing outDir in tsconfig.json', async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      path: '/test/path/package.json',
      packageJson: {}
    })
    vi.mocked(findUp).mockResolvedValue('/test/path/tsconfig.json')
    vi.mocked(getTsconfig).mockReturnValue({
      config: {
        compilerOptions: {
          baseUrl: '/test/src'
        }
      }
    } as TsConfigResult)
    await expect(getPackageContext()).rejects.toThrow('"compilerOptions.outDir" must be set')
  })
})

describe('inferESLintConfigurationStrategy', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should prioritize flat configuration files', async () => {
    vi.mocked(findUp).mockImplementation(async patterns => {
      if (Array.isArray(patterns)) {
        if (patterns.includes('eslint.config.js')) return '/test/eslint.config.js'
        if (patterns.includes('.eslintrc')) return '/test/.eslintrc'
      }
      return undefined
    })

    const result = await inferESLintConfigurationStrategy('/test')
    expect(result).toEqual({
      type: 'flat',
      configFile: '/test/eslint.config.js'
    })
  })

  it('should fall back to legacy configuration files', async () => {
    vi.mocked(findUp).mockImplementation(async patterns => {
      if (Array.isArray(patterns)) {
        if (patterns.includes('eslint.config.js')) return undefined
        if (patterns.includes('.eslintrc')) return '/test/.eslintrc'
      }
      return undefined
    })

    const result = await inferESLintConfigurationStrategy('/test')
    expect(result).toEqual({
      type: 'legacy',
      configFile: '/test/.eslintrc'
    })
  })

  it('should return false when no configuration files are found', async () => {
    vi.mocked(findUp).mockResolvedValue(undefined)
    const result = await inferESLintConfigurationStrategy('/test')
    expect(result).toBe(false)
  })
})

describe('createPluginReconfigurator', () => {
  it('should handle promises correctly', async () => {
    const plugin = {
      name: 'test-plugin',
      apply: 'build'
    }

    const config = {
      ...createViteConfigurationScaffold(),
      plugins: [Promise.resolve(plugin)]
    } as ViteConfigurationScaffold

    const reconfigure = createPluginReconfigurator(config)

    if (typeof reconfigure === 'function') {
      await reconfigure({
        name: 'test-plugin',
        apply: 'build'
      })

      expect(config.plugins).toHaveLength(1)
      expect(config.plugins[0]).toEqual({
        name: 'test-plugin',
        apply: 'build'
      })
    }
  })

  it('should handle non-promise values correctly', async () => {
    const plugin = {
      name: 'test-plugin',
      apply: 'build'
    }

    const config = {
      ...createViteConfigurationScaffold(),
      plugins: [plugin]
    } as ViteConfigurationScaffold

    const reconfigure = createPluginReconfigurator(config)

    if (typeof reconfigure === 'function') {
      await reconfigure({
        name: 'test-plugin',
        apply: 'build'
      })

      expect(config.plugins).toHaveLength(1)
      expect(config.plugins[0]).toEqual({
        name: 'test-plugin',
        apply: 'build'
      })
    }
  })

  it('should handle null config gracefully', async () => {
    const reconfigure = createPluginReconfigurator(null as any)

    if (typeof reconfigure === 'function') {
      await reconfigure({
        name: 'test-plugin',
        apply: 'build'
      })
    }
  })

  it('should handle empty plugins array', async () => {
    const config: ViteConfigurationScaffold = createViteConfigurationScaffold()
    const reconfigure = createPluginReconfigurator(config)

    if (typeof reconfigure === 'function') {
      await expect(
        reconfigure({
          name: 'test-plugin',
          apply: 'build'
        })
      ).rejects.toThrow('Unable to find an existing plugin instance')
    }
  })

  // it('should handle invalid plugin values', async () => {
  //   const config: ViteConfigurationScaffold = {
  //     ...createViteConfigurationScaffold(),
  //     plugins: [undefined]
  //   }

  //   const reconfigure = createPluginReconfigurator(config)

  //   if (typeof reconfigure === 'function') {
  //     await expect(
  //       reconfigure({
  //         name: 'test-plugin',
  //         apply: 'build'
  //       })
  //     ).rejects.toThrow('Unable to find an existing plugin instance')
  //   }
  // })

  it('should handle array values in flattened plugin list', async () => {
    const config: ViteConfigurationScaffold = {
      ...createViteConfigurationScaffold(),
      plugins: [[]] as any
    }

    const reconfigure = createPluginReconfigurator(config)

    if (typeof reconfigure === 'function') {
      await expect(
        reconfigure({
          name: 'test-plugin',
          apply: 'build'
        })
      ).rejects.toThrow('Unable to find an existing plugin instance')
    }
  })
})

describe('gitDescribe', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should handle successful git describe', () => {
    vi.mocked(execSync).mockReturnValue('v1.2.3-4-gabcd123\n')
    expect(gitDescribe()).toBe('v1.2.3-abcd123')
  })

  it('should handle git describe with just tags', () => {
    vi.mocked(execSync).mockReturnValue('v1.2.3\n')
    expect(gitDescribe()).toBe('v1.2.3')
  })

  it('should handle git describe with just commit hash', () => {
    vi.mocked(execSync).mockReturnValue('abcd123\n')
    expect(gitDescribe()).toBe('abcd123')
  })

  it('should handle git command failures', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git command failed')
    })
    expect(gitDescribe()).toBe('')
  })
})