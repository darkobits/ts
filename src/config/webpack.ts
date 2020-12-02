// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';

import { getPackageInfo } from '@darkobits/ts/lib/utils';
import bytes from 'bytes';
import findUp from 'find-up';
import ms from 'ms';
import webpack from 'webpack';
import merge from 'webpack-merge';

// Plugins
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import log from 'lib/log';
import {
  ensureIndexEntrypoint,
  ensureIndexHtml,
  generateWebpackConfigurationScaffold
} from 'lib/utils';
import { WebpackConfigurationFactory } from 'etc/types';


// ----- Base Configuration ----------------------------------------------------

const baseConfiguration: WebpackConfigurationFactory = ({ argv, config, pkgJson, pkgRoot, isProduction, isDevelopment }) => {
  // Resolve the path to this package's node_modules folder, which may be nested
  // in the host package's node_modules tree. We will need to add this to
  // Webpack's module resolution configuration so that any dependencies that NPM
  // decides to nest in this folder can still be resolved by the host package.
  const OUR_NODE_MODULES = findUp.sync('node_modules', { cwd: __dirname, type: 'directory' });

  if (!OUR_NODE_MODULES) {
    throw new Error(`${log.prefix('webpack')} Unable to resolve the ${log.chalk.green('node_modules')} directory for "tsx".`);
  }


  // ----- Entry / Output ------------------------------------------------------

  config.entry = {
    support: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'react-hot-loader/patch'
    ],
    index: ensureIndexEntrypoint(pkgRoot)
  };

  config.output = {
    path: path.resolve(pkgRoot, 'dist'),
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
      loader: require.resolve('linaria/loader'),
      options: {
        sourceMap: isDevelopment,
        displayName: isDevelopment
      }
    }]
  });

  // Stylesheets.
  config.module.rules.push({
    test: /\.css$/,
    use: [{
      loader: MiniCssExtractPlugin.loader
    }, {
      loader: require.resolve('css-loader'),
      options: {
        sourceMap: isDevelopment
      }
    }]
  });

  // SVGs.
  config.module.rules.push({
    test: /\.svg$/,
    use: [{
      loader: require.resolve('@svgr/webpack')
    }]
  });

  // Other images.
  config.module.rules.push({
    test: /\.(png|jpg|gif)$/,
    use: [{
      loader: require.resolve('url-loader'),
      options: {
        limit: bytes('10kb'),
        name: '[name].[hash].[ext]'
      }
    }]
  });

  // Text files.
  config.module.rules.push({
    test: /\.txt$/,
    use: [{
      loader: require.resolve('raw-loader')
    }]
  });

  // Fonts.
  config.module.rules.push({
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    use: [{
      loader: require.resolve('url-loader'),
      options: {
        limit: bytes('10kb')
      }
    }]
  });


  // ----- Module Resolution ---------------------------------------------------

  config.resolve = {
    alias: {
      // Use the @hot-loader variant of react-dom in development to avoid this
      // issue: https://github.com/gatsbyjs/gatsby/issues/11934#issuecomment-469046186
      'react-dom': isDevelopment ? '@hot-loader/react-dom': 'react-dom'
    },
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

  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: ensureIndexHtml(pkgRoot),
    inject: true,
    title: pkgJson.displayName ?? ''
  }));

  config.plugins.push(new MiniCssExtractPlugin({
    filename: isDevelopment ? 'styles.css' : 'styles-[contenthash].css'
  }));

  config.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: isProduction
  }));

  config.plugins.push(new webpack.EnvironmentPlugin({
    NODE_ENV: argv.mode,
    DISPLAY_NAME: pkgJson.displayName ?? '',
    DESCRIPTION: pkgJson.description ?? '',
    VERSION: pkgJson.version ?? ''
  }));

  if (isDevelopment && !log.isLevelAtLeast('verbose')) {
    config.plugins.push(new FriendlyErrorsWebpackPlugin());
  }

  if (isProduction) {
    // Delete the build output directory before production builds.
    config.plugins.push(new CleanWebpackPlugin());

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


  // ----- Dev Server ----------------------------------------------------------

  if (isDevelopment) {
    config.devServer = {
      port: 8080,
      compress: true,
      historyApiFallback: true,
      disableHostCheck: true,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      overlay: true,
      quiet: true
    };
  }


  // ----- Misc ----------------------------------------------------------------

  config.devtool = isDevelopment ? '#eval-source-map' : '#source-map';

  config.performance = {
    maxAssetSize: bytes('550kb'),
    maxEntrypointSize: bytes('550kb')
  };

  config.optimization = {
    minimize: isProduction,
    splitChunks: {
      chunks: 'all'
    }
  };

  config.stats = 'minimal';

  return config;
};


// ----- Configuration Merger --------------------------------------------------

/**
 * Function that accepts a 'tsx' Webpack configuration factory and returns a
 * 'standard' Webpack configuration factory that will be passed to Webpack.
 *
 * The standard factory will invoke the user-provided configuration factory,
 * merge the resulting configuration with the 'tsx' base configuration, and
 * return the merged configuration object to Webpack.
 */
export default (userConfiguration: WebpackConfigurationFactory) => {
  // Return a function that conforms to the 'standard' Webpack configuration
  // factory signature.
  const standardConfigurationFactory: webpack.ConfigurationFactory = (env, argv) => {
    if (env === undefined && argv === undefined) {
      log.warn(log.prefix('webpack'), 'Configuration factory invoked with no arguments; unable to determine "mode".');
    }

    // Get host package metadata.
    const pkg = getPackageInfo();
    const pkgJson = pkg.json;
    const pkgRoot = pkg.rootDir;

    const isProduction = argv?.mode === 'production';
    const isDevelopment = argv?.mode === 'development';

    // Return the result of merging the configuration objects returned by the
    // base configuration factory and the user's configuration factory using
    // webpack-merge.
    return merge(
      baseConfiguration({
        env,
        argv,
        pkgJson,
        pkgRoot,
        config: generateWebpackConfigurationScaffold(),
        bytes,
        ms,
        isProduction,
        isDevelopment
      }),
      userConfiguration({
        env,
        argv,
        pkgJson,
        pkgRoot,
        config: generateWebpackConfigurationScaffold(),
        bytes,
        ms,
        isProduction,
        isDevelopment
      })
    );
  };

  return standardConfigurationFactory;
};
