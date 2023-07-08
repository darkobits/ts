import path from 'path';

import fs from 'fs-extra';

import log from './log';
import { getPackageContext } from './utils';

import type { Plugin } from 'vite';


/**
 * Responsible for running tsc-alias on emitted declaration files.
 *
 * TODO: Refactor this to use wait-on with a timeout.
 */
export default function executablePlugin(): Plugin {
  const prefix = log.prefix('executablePlugin');

  return {
    name: 'vite-plugin-tsc-alias',
    enforce: 'post',
    async closeBundle() {
      const binList: Array<string> = [];
      const { root, packageJson: { bin } } = await getPackageContext();

      if (!bin) {
        log.verbose(prefix, 'Project does not declare any executable scripts.');
        return;
      }

      if (typeof bin === 'string') {
        binList.push(path.resolve(root, bin));
      } else if (typeof bin === 'object') {
        Object.values(bin).forEach(binPath => binList.push(path.resolve(root, binPath)));
      } else {
        this.error(new TypeError(`Expected type of "bin" in package.json to be "string" or "object", got "${typeof bin}".`));
      }

      log.silly(prefix, `Root: ${root}`);
      log.silly(prefix, 'Executables:', binList);

      try {
        for (const binPath of binList) {
          if (await fs.exists(binPath)) {
            await fs.chmod(binPath, '0755');
            log.verbose(prefix, `Set executable flag on ${log.chalk.green(binPath)}.`);
          } else {
            // We may not see the file we're looking for if the compilation
            // encountered errors that prevented writing.
            const relativeBinPath = path.relative(root, binPath);
            log.verbose(prefix, `Executable script ${log.chalk.green(relativeBinPath)} declared in package.json does not exist.`);
          }
        }
      } catch (err: any) {
        this.error(err);
      }
    }
  };
}
