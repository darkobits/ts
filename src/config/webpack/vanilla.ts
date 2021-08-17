import path from 'path';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import findUp from 'find-up';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack from 'webpack';

import log from 'lib/log';
import { createWebpackConfigurationPreset } from 'lib/webpack';


// ----- Vanilla Configuration -------------------------------------------------

const compileTime = log.createTimer();

export default createWebpackConfigurationPreset(({
  config,
  isDevelopment,
  isProduction,
  pkg
}) => {
  // Resolve the path to this package's node_modules folder, which may be nested
  // in the host package's node_modules tree. We will need to add this to
  // Webpack's module resolution configuration so that any dependencies that NPM
  // decides to nest in this folder can still be resolved by the host package.
  const OUR_NODE_MODULES = findUp.sync('node_modules', { cwd: __dirname, type: 'directory' });

  if (!OUR_NODE_MODULES) {
    throw new Error(`${log.prefix('webpack')} Unable to resolve the ${log.chalk.green('node_modules')} directory for "tsx".`);
  }


  // ----- Entry / Output ------------------------------------------------------

  config.output = {
    path: path.resolve(pkg.rootDir, 'dist'),
    filename: isDevelopment ? '[name].js' : '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js'
  };


  // ----- Loaders -------------------------------------------------------------

  // TypeScript & JavaScript files.
  config.module.rules.push({
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: [{
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true
      }
    }, {
      loader: require.resolve('@linaria/webpack-loader'),
      options: {
        sourceMap: isDevelopment,
        displayName: isDevelopment
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

  config.plugins.push(new CleanWebpackPlugin({
    cleanAfterEveryBuildPatterns: [
      // Remove generated LICENSE files. This seems to be a Webpack 5 issue.
      '**/*LICENSE*'
    ]
  }));

  config.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: isProduction
  }));

  config.plugins.push(new webpack.ProgressPlugin(progress => {
    if (progress === 0) {
      log.verbose(log.prefix('webpack'), `Bundling with Webpack v${webpack.version}.`);
    }

    if (progress === 1) {
      log.verbose(log.prefix('webpack'), `Done in ${log.chalk.bold(compileTime)}.`);
    }
  }));

  if (isProduction) {
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

  config.optimization = {
    minimize: isProduction
  };

  config.stats = 'normal';
});
