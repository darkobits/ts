import path from 'path';


/**
 * TODO:
 * - Add "clean" option to have re-pack remove the .re-pack directory after
 *   publishing.
 * - Add helper like Vite's `defineConfig` to facilitate type-safe configuration
 *   files.
 * - Add note about whether dry run was used in the final log message.
 */
export default {
  // @ts-expect-error - We have no way of knowing the signature of this
  // function. TODO: Add helper `defineConfig` in re-pack.
  afterRepack: ({ fs, packDir }) => {
    // Moves config/tsconfig-base.json to tsconfig.json in the re-packed package
    // root. This allows consumers to extend "@darkobits/ts/tsconfig.json" in
    // their tsconfig files. Note: Users cannot use a simple package identifier
    // like "@darkobits/ts" because Vitest/Vite will try to load 'index.js'.
    fs.moveSync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'tsconfig.json')
    );
  }
};
