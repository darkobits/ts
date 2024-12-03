import path from 'node:path'

import chalk from 'chalk'
import fs from 'fs-extra'

import log from './log'
import { getPackageContext } from './utils'

import type { Plugin } from 'vite'

const prefix = chalk.dim.cyan('executable')

/**
 * Adds an executable flag to any output files that match `"bin"` declarations
 * in the project's `package.json`.
 */
export default function executablePlugin(): Plugin {
  return {
    name: 'ts:executable-plugin',
    enforce: 'post',
    async closeBundle() {
      const binList: Array<string> = []
      const { root, packageJson: { bin } } = await getPackageContext()

      if (!bin) {
        log.debug(prefix, chalk.yellow.dim('Project does not declare any executable scripts.'))
        return
      }

      if (typeof bin === 'string') {
        binList.push(path.resolve(root, bin))
      } else if (typeof bin === 'object') {
        Object.values(bin).forEach(binPath => binList.push(path.resolve(root, binPath)))
      } else {
        this.error(new TypeError(`Expected type of "bin" in package.json to be "string" or "object", got "${typeof bin}".`))
      }

      log.debug(prefix, `Root: ${root}`)
      log.debug(prefix, 'Executables:', binList)

      try {
        for (const binPath of binList) {
          if (await fs.exists(binPath)) {
            await fs.chmod(binPath, '0755')
            log.info(prefix, chalk.green(path.relative(root, binPath)))
          } else {
            // We may not see the file we're looking for if the compilation
            // encountered errors that prevented writing.
            const relativeBinPath = path.relative(root, binPath)
            log.warn(prefix, `Executable ${chalk.green(relativeBinPath)} declared in package.json does not exist.`)
          }
        }
      } catch (err: any) {
        this.error(err)
      }
    }
  }
}