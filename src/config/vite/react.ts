import path from 'path';

import {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS_WITH_DOT
} from '@darkobits/ts/etc/constants';
import reactRefreshPlugin from '@vitejs/plugin-react-refresh';
import * as devcert from 'devcert';
import checkerPlugin from 'vite-plugin-checker';
// @ts-expect-error - No type declarations.
import linariaPlugin from 'vite-plugin-linaria';
import tsconfigPathsPlugin from 'vite-tsconfig-paths';

import log from 'lib/log';
import { gitDescribe, readDotenvUp } from 'lib/utils';
import {
  createViteConfigurationPreset,
  getPackageManifest
} from 'lib/vite';


// ----- React Configuration ---------------------------------------------------

export default createViteConfigurationPreset(async ({
  config,
  isDevServer,
  isProduction,
  mode,
  pkg
}) => {
  // ----- Input / Output ------------------------------------------------------

  // TODO: Change this when Vite makes it less awkward to put index.html in
  // a subdirectory like 'src'. Using 'src' currently breaks module resolution.
  config.root = path.resolve(pkg.rootDir);

  config.build.outDir = path.resolve(pkg.rootDir, OUT_DIR);

  // Creates bundles for each production dependency by name and version. Assets
  // and application code are named using hashes.
  if (isProduction) {
    config.build.rollupOptions = {
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: id => {
          const cleanedId = id.replace(/\0/g, '');

          if (id.includes('node_modules')) {
            const dirname = path.dirname(cleanedId);
            const manifest = getPackageManifest(dirname);

            if (manifest) {
              return `vendor/${manifest.name}-${manifest.version}`;
            }

            throw new Error(`Unable to parse manifest for vendor module: ${id}`);
          }

          return 'app';
        }
      }
    };
  }

  // ----- Module Resolution ---------------------------------------------------

  // This ensures that React and React DOM are always resolved to the same
  // package. Not doing this can result in hooks-related errors.
  config.resolve.dedupe = ['react', 'react-dom'];

  // Prevents https://github.com/vitejs/vite/issues/813.
  config.optimizeDeps = {
    include: [require.resolve('react')]
  };


  // ----- Environment ---------------------------------------------------------

  // Load variables from the nearest .env file and map them into the appropriate
  // format.
  const dotEnv = Object.fromEntries(Object.entries(readDotenvUp() ?? {}).map(([key, value]) => [
    `process.env.${key}`,
    JSON.stringify(value)
  ]));

  config.define = {
    ...dotEnv,
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

  // Enable React Fast Refresh.
  config.plugins.push(reactRefreshPlugin());

  // Add support for Linaria.
  // See: https://github.com/denn1s/vite-plugin-linaria
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  config.plugins.push(linariaPlugin());

  // Add support for TypeScript path mappings.
  // See: https://github.com/aleclarson/vite-tsconfig-paths
  config.plugins.push(tsconfigPathsPlugin({
    projects: [pkg.rootDir]
  }));


  // ----- Development Server --------------------------------------------------

  if (isDevServer) {
    const hosts = ['localhost'];
    const hasCertificates = devcert.hasCertificateFor(hosts);

    if (!hasCertificates) {
      log.info('Generating certificates...');
    }

    const { key, cert } = await devcert.certificateFor(hosts);

    // eslint-disable-next-line require-atomic-updates
    config.server.https = { key, cert };
  }
});
