import path from 'path';

import {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS_WITH_DOT
} from '@darkobits/ts/etc/constants';
import checkerPlugin from 'vite-plugin-checker';
import tsconfigPathsPlugin from 'vite-tsconfig-paths';

import { gitDescribe } from 'lib/utils';
import { createViteConfigurationPreset } from 'lib/vite';


export default createViteConfigurationPreset(({ config, mode, pkg }) => {
  // ----- Input / Output ------------------------------------------------------

  // TODO: Change this when Vite makes it less awkward to put index.html in
  // a subdirectory like 'src'.
  config.root = path.resolve(pkg.rootDir);

  config.build.outDir = path.resolve(pkg.rootDir, OUT_DIR);

  config.build.lib = {
    entry: pkg.json.main
      ? path.resolve(pkg.rootDir, pkg.json.main).replace(OUT_DIR, SRC_DIR)
      : path.resolve(pkg.rootDir, SRC_DIR, 'index'),
    formats: ['cjs', 'es']
  };

  config.build.lib.fileName = path.basename(config.build.lib.entry);

  config.build.rollupOptions.external = Object.keys(pkg.json.dependencies ?? []);


  // ----- Environment ---------------------------------------------------------

  config.define = {
    'process.env.GIT_DESC': JSON.stringify(gitDescribe()),
    'process.env.NODE_ENV': JSON.stringify(mode)
  };


  // ----- Plugins -------------------------------------------------------------

  // Enable fast in-band TypeScript and ESLint support using separate worker
  // threads.
  config.plugins.push(checkerPlugin({
    typescript: true,
    eslint: {
      files: [path.resolve(config.root, SRC_DIR)],
      extensions: EXTENSIONS_WITH_DOT
    }
  }));

  // Add support for TypeScript path mappings.
  // See: https://github.com/aleclarson/vite-tsconfig-paths
  config.plugins.push(tsconfigPathsPlugin({
    projects: [pkg.rootDir]
  }));
});
