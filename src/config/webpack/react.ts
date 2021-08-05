/* eslint-disable require-atomic-updates */
// -----------------------------------------------------------------------------
// ----- Webpack Configuration (React) -----------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';

import * as devcert from 'devcert';
import findUp from 'find-up';
import webpack from 'webpack';

// Plugins
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import log from 'lib/log';
import { createWebpackConfigurationPreset } from 'lib/webpack';


// ----- React Configuration ---------------------------------------------------

const compileTime = log.createTimer();

export default createWebpackConfigurationPreset(async ({
  argv,
  bytes,
  config,
  isDevelopment,
  isProduction,
  pkgJson,
  pkgRoot
}) => {
  // Resolve the path to this package's node_modules folder, which may be nested
  // in the host package's node_modules tree. We will need to add this to
  // Webpack's module resolution configuration so that any dependencies that NPM
  // decides to nest in this folder can still be resolved by the host package.
  const OUR_NODE_MODULES = await findUp('node_modules', { cwd: __dirname, type: 'directory' });

  if (!OUR_NODE_MODULES) {
    throw new Error(`${log.prefix('webpack')} Unable to resolve the ${log.chalk.green('node_modules')} directory for "tsx".`);
  }


  // ----- Entry / Output ------------------------------------------------------

  config.entry = {
    // As of version 7.4.0, @babel/polyfill is deprecated in favor of including
    // core-js and regenerator-runtime directly.
    // See: https://babeljs.io/docs/en/babel-polyfill
    support: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'react-hot-loader/patch'
    ],
    index: path.resolve(pkgRoot, 'src', 'index.tsx')
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
      loader: require.resolve('@linaria/webpack-loader'),
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
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDevelopment
      }
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
    template: path.resolve(pkgRoot, 'src', 'index.html'),
    inject: true,
    /**
     * Set the document title to "displayName" from package.json using:
     * <title><%= htmlWebpackPlugin.options.title %></title>
     */
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


  // ----- Dev Server ----------------------------------------------------------

  if (isDevelopment) {
    const hasCertificates = devcert.hasCertificateFor('localhost');

    if (!hasCertificates) {
      log.info('Generating development certificate.');
      log.info(log.chalk.dim('You may be prompted for your password. This should only happen once.'));
      log.info(log.chalk.dim(`For more information, see: ${log.chalk.blue('https://github.com/davewasmer/devcert')}`));
    }

    const { key, cert } = await devcert.certificateFor('localhost');

    if (!hasCertificates) {
      log.info('Certificates generated.');
    }

    config.devServer = {
      host: '0.0.0.0',
      port: 8080,
      hot: true,
      inline: true,
      overlay: true,
      compress: true,
      disableHostCheck: true,
      historyApiFallback: true,
      quiet: true,
      https: { key, cert }
    };
  }


  // ----- Misc ----------------------------------------------------------------

  config.devtool = isDevelopment ? 'eval' : 'source-map';

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

  config.cache = {
    type: 'filesystem'
  };

  config.stats = 'minimal';
});
