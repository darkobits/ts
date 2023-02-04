import fs from 'fs';
import path from 'path';

import fg from 'fast-glob';
import glob from 'glob';
import micromatch from 'micromatch';

import { EXTENSIONS_PLAIN } from '../etc/constants';

import type { Plugin } from 'vite';


/**
 * @private
 *
 * Checks if the provided `id` refers to a node module.
 */
function isNodeModule(id: string) {
  // Relative and absolute paths will almost always be resolvable using the file
  // system, so require.resolve is not a reliable method for those types of
  // import.
  if (id.startsWith('.') || path.isAbsolute(id)) {
    return id.includes('/node_modules/');
  }

  try {
    // If the `id` is neither relative nor absolute, AND is resolvable by Node,
    // then it has to be a node module.
    require.resolve(id);
    return true;
  } catch {
    // Failing to resolve here could mean the `id` is meant to be resolved by a
    // different plugin.
    return false;
  }
}


/**
 * @private
 *
 * Generates an entry point for each file in the host project.
 *
 * Note: This must be set in the base configuration because Vite/Rollup needs
 * it to be set before this plugin is loaded. Therefore we export it as a
 * utility rather than using it in the plugin itself.
 *
 * See: https://rollupjs.org/configuration-options/#input
 */
export function generateNoBundleEntries(srcRoot: string) {
  const include = `${srcRoot}/**/*.{${EXTENSIONS_PLAIN.join(',')}}`;
  const ignore = `${srcRoot}/**/*.{spec,test}.*`;

  return Object.fromEntries(glob.sync(include, { ignore }).map(file => {
    // This will remove `src/` as well as the file extension from each file, so
    // e.g. src/nested/foo.js becomes nested/foo
    const entry = path.relative(srcRoot, file.slice(0, file.length - path.extname(file).length));
    // This expands the relative paths to absolute paths, so e.g. src/nested/foo
    // becomes /project/src/nested/foo.js
    const absolute = path.resolve(file);
    return [entry, absolute];
  }));
}


interface Config {
  /**
   * See: https://rollupjs.org/guide/en/#outputpreservemodulesroot
   */
  root?: string;

  /**
   * See: https://rollupjs.org/guide/en/#outputentryfilenames
   */
  fileNames?: string;

  /**
   * Glob(s) for marking files as external while copying them to the output.
   */
  copy?: string | Array<string>;

  /**
   * Glob(s) for marking files as non-external, preserving them in the output.
   */
  internal?: string | Array<string>;
}


/**
 *
 * Based on https://github.com/ManBearTM/vite-plugin-no-bundle
 */
export function noBundlePlugin(config?: Config): Plugin {
  const preserveModulesRoot = config?.root ?? 'src';
  const entryFileNames = config?.fileNames ?? '[name].js';

  // Store the resolved absolute root path.
  let root: string;

  // Create a matcher function from provided internal config (if any).
  const isInternal = (file: string) => (config?.internal
    ? micromatch.isMatch(file, config.internal)
    : false);

  // Create a matcher function from provided copy config (if any).
  const isCopyTarget = (file: string) => (config?.copy
    ? micromatch.isMatch(file, config.copy)
    : false);

  return {
    name: 'no-bundle',
    enforce: 'pre',
    apply: 'build',

    config: userConfig => {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const { entry } = userConfig.build?.lib || {};

      if (!entry) throw new Error('[no-bundle-plugin] Required field "build.lib.entry" could not be found.');

      return {
        build: {
          lib: {
            entry
            // Set in the original plugin, this was breaking our ability to
            // transpile source to other formats.
            // formats: ['es']
          },
          rollupOptions: {
            output: {
              preserveModules: true,
              preserveModulesRoot,
              entryFileNames
            }
          }
        }
      };
    },

    configResolved: resolvedConfig => {
      root = resolvedConfig.root;
    },

    async buildStart() {
      if (config?.copy) {
        const cwd = preserveModulesRoot ? path.join(root, preserveModulesRoot) : root;
        const files = await fg(config.copy, { cwd });

        files.forEach(file => {
          this.emitFile({
            type: 'asset',
            source: fs.readFileSync(path.join(cwd, file)),
            fileName: file
          });
        });
      }
    },

    resolveId: (source, importer, options) => {
      // Remove any query parameters
      const [id] = source.split('?');

      if (options.isEntry) return null;
      if (isInternal(id)) return null;
      if (isNodeModule(id)) return { id, external: true };

      // Treat absolute paths as starting from project root.
      const absolutePath = path.isAbsolute(id)
        ? path.join(root, id)
        : path.join(path.dirname(importer as string), id);

      // Get the relative path starting from `root`.
      const relativePath = path.relative(root, absolutePath);

      // Mark the source as external and with side effects if it matches a glob
      // pattern, excluding it from the build. The file is then emitted manually
      // in buildStart.
      if (isCopyTarget(relativePath)) {
        return {
          // Enforce relative path to avoid issues with preserveModulesRoot.
          id: path.isAbsolute(id) ? path.relative(path.dirname(importer as string), absolutePath) : id,
          external: true,
          moduleSideEffects: true
        };
      }

      return null;
    }
  };
}
