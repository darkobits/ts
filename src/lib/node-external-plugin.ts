/* eslint-disable unicorn/no-null */
import { createRequire } from 'node:module'
import path from 'path'

import type { Plugin } from 'vite'

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
    name: 'ts-vite-plugin-node-external',
    enforce: 'pre',
    apply: 'build',
    resolveId: (source, importer, options: any) => {
      const [id] = source.split('?')
      if (options.isEntry) return null
      if (!importer) return null
      if (isNodeModule(root, id)) return { id, external: true }
      return null
    }
  }
}