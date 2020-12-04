// -----------------------------------------------------------------------------
// ----- Webpack Configuration (Serverless) ------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';

import findUp from 'find-up';
import resolvePkg from 'resolve-pkg';
import webpack from 'webpack';

// Plugins
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import log from 'lib/log';
import { createWebpackConfigurationPreset } from 'lib/webpack';

const compileTime = log.createTimer();

export default createWebpackConfigurationPreset(({
  bytes,
  config,
  pkgJson,
  pkgRoot
}) => {
  // Resolve the path to this package's node_modules folder, which may be nested
  // in the host package's node_modules tree. We will need to add this to
  // Webpack's module resolution configuration so that any dependencies that NPM
  // decides to nest in this folder can still be resolved by the host package.
  const OUR_NODE_MODULES = findUp.sync('node_modules', { cwd: __dirname, type: 'directory' });

  if (!OUR_NODE_MODULES) {
    throw new Error(`${log.prefix('webpack')} Unable to resolve the ${log.chalk.green('node_modules')} directory for "tsx".`);
  }


  // ----- Load Serverless-Webpack ---------------------------------------------

  const serverlessWebpackPath = resolvePkg('serverless-webpack', { cwd: pkgRoot });

  if (!serverlessWebpackPath) {
    throw new Error(`${log.prefix('webpack')} Unable to resolve module "serverless-webpack". You may need to install it.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serverlessWebpack = require(serverlessWebpackPath);

  config.mode = serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production';
  log.verbose(log.prefix('webpack'), `Using mode: ${log.chalk.green(config.mode)}`);


  // ----- Entry / Output ------------------------------------------------------

  config.entry = serverlessWebpack.lib.entries;
  log.verbose(log.prefix('webpack'), 'Using entries:', config.entry);

  config.target = 'node';

  config.output = {
    libraryTarget: 'commonjs',
    path: path.resolve(pkgRoot, '.webpack'),
    filename: '[name].js'
  };


  // ----- Loaders -------------------------------------------------------------

  // TypeScript / JavaScript.
  config.module.rules.push({
    test: /\.(ts|js)$/,
    exclude: /node_modules/,
    use: [{
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true
      }
    }]
  });


  // ----- Module Resolution ---------------------------------------------------

  config.resolve = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [
      'node_modules',
      // Tell Webpack to look for modules in this package's nested node_modules
      // directory if it cannot find a package in the host package's
      // node_modules directory. This lets us manage dependencies on behalf of
      // the host package (like React) while letting the host package use their
      // own version if they desire.
      OUR_NODE_MODULES
    ]
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: config.mode === 'production'
  }));

  config.plugins.push(new webpack.EnvironmentPlugin({
    NODE_ENV: config.mode,
    DISPLAY_NAME: pkgJson.displayName ?? '',
    DESCRIPTION: pkgJson.description ?? '',
    VERSION: pkgJson.version ?? ''
  }));

  config.plugins.push(new webpack.ProgressPlugin(progress => {
    if (progress === 0) {
      log.verbose(log.prefix('webpack'), `Bundling with Webpack v${webpack.version}.`);
    }

    if (progress === 1) {
      log.verbose(log.prefix('webpack'), `Done in ${log.chalk.bold(compileTime)}.`);
    }
  }));

  if (config.mode === 'production') {
    // This runs ESLint and TypeScript as separate processes, dramatically
    // speeding-up build times.
    config.plugins.push(new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx,js,jsx}'
      },
      typescript: {
        enabled: true,
        diagnosticOptions: {
          semantic: true,
          syntactic: true
        }
      }
    }));
  }


  // ----- Misc ----------------------------------------------------------------

  config.devtool = config.mode === 'production' ? false : '#eval-source-map';

  config.performance = {
    maxAssetSize: bytes('1mb'),
    maxEntrypointSize: bytes('1mb')
  };

  config.optimization = {
    minimize: config.mode === 'production',
    splitChunks: false
  };

  config.stats = 'minimal';
});
