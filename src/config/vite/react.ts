import path from 'path';

import {
  SRC_DIR,
  OUT_DIR,
  EXTENSIONS_WITH_DOT
} from '@darkobits/ts/etc/constants';
// import reactRefreshPlugin from '@vitejs/plugin-react-refresh';
import reactPlugin from '@vitejs/plugin-react';
import * as devcert from 'devcert';
import checkerPlugin from 'vite-plugin-checker';
// @ts-expect-error - No type declarations.
import linariaPlugin from 'vite-plugin-linaria';
import tsconfigPathsPlugin from 'vite-tsconfig-paths';

import log from 'lib/log';
import { gitDescribe } from 'lib/utils';
import {
  createViteConfigurationPreset
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
  config.root = path.resolve(pkg.rootDir, SRC_DIR);

  config.build.outDir = path.resolve(pkg.rootDir, OUT_DIR);

  // Creates bundles for each production dependency by name and version. Assets
  // and application code are named using hashes.
  if (isProduction) {
    config.build.rollupOptions = {
      output: {
        entryFileNames: '[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        manualChunks: rawId => {
          const id = rawId.replace(/\0/g, '');
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    };
  }

  // ----- Module Resolution ---------------------------------------------------

  // This ensures that React and React DOM are always resolved to the same
  // package. Not doing this can result in hooks-related errors.
  // TODO: This issue may have been fixed via plugin-react.
  // config.resolve.dedupe = [
  //   require.resolve('react'), require.resolve('react-dom')
  // ];

  // Prevents https://github.com/vitejs/vite/issues/813.
  // TODO: This issue may have been fixed via plugin-react.
  // config.optimizeDeps = {
  //   include: [require.resolve('react')]
  // };


  // ----- Environment ---------------------------------------------------------

  config.define = {
    'import.meta.env.GIT_DESC': JSON.stringify(gitDescribe()),
    'import.meta.env.NODE_ENV': JSON.stringify(mode),
    // There are Vite typedef errors with import.meta.env at the moment, so
    // re-add these as a temporary fallback.
    'process.env.GIT_DESC': JSON.stringify(gitDescribe()),
    'process.env.NODE_ENV': JSON.stringify(mode)
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(reactPlugin({
    babel: {
      babelrc: true,
      configFile: true
    }
  }));

  // Enable fast TypeScript and ESLint support using separate worker threads.
  config.plugins.push(checkerPlugin({
    typescript: true,
    eslint: {
      files: [
        path.resolve(pkg.rootDir, SRC_DIR)
      ],
      extensions: EXTENSIONS_WITH_DOT
    }
  }));

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


  // ----- Hacks ---------------------------------------------------------------

  /**
   * See: https://github.com/vitejs/vite/discussions/5079#discussioncomment-1890839
   */
  if (isProduction) {
    // eslint-disable-next-line require-atomic-updates
    config.css = {
      postcss: {
        plugins: [{
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: atRule => {
              if (atRule.name === 'charset') atRule.remove();
            }
          }
        }]
      }
    };
  }
});
