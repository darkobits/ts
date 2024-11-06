/* eslint-disable unicorn/no-null */
import { createRequire } from 'node:module'
import path from 'node:path'

import chalk from 'chalk'

import log from './log'

import type { Plugin } from 'vite'

const prefix = chalk.dim.cyan('node-external')

const require = createRequire(import.meta.url)

function isNodeModule(root: string, id: string) {
  if (id.startsWith('.') || path.isAbsolute(id)) return id.includes('/node_modules/')

  try {
    require.resolve(id, { paths: [root] })
    return true
  } catch {
    return false
  }
}

export function nodeExternalPlugin({ root }: {root: string}): Plugin {
  return {
    name: 'ts:plugin-node-externals',
    enforce: 'pre',
    apply: 'build',
    resolveId: (source, importer, options: any) => {
      const [importSpecifier] = source.split('?')
      if (options.isEntry) return null
      if (!importer) return null
      if (isNodeModule(root, importSpecifier)) {
        log.verbose(prefix, chalk.cyan(importSpecifier))
        return { id: importSpecifier, external: true }
      }
      return null
    }
  }
}