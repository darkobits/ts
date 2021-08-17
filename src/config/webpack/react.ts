/* eslint-disable require-atomic-updates */
import path from 'path';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as devcert from 'devcert';
import findUp from 'find-up';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import getPort from 'get-port';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import open from 'open';
import waitPort from 'wait-port';
import webpack from 'webpack';

import log from 'lib/log';
import { createWebpackConfigurationPreset } from 'lib/webpack';


// ----- React Configuration ---------------------------------------------------

const compileTime = log.createTimer();

export default createWebpackConfigurationPreset(async ({
  argv,
  bytes,
  config,
  isDevelopment,
  isDevServer,
  isProduction,
  pkg
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
    index: path.resolve(pkg.rootDir, 'src', 'index.tsx')
  };

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

  config.plugins.push(new CleanWebpackPlugin({
    cleanAfterEveryBuildPatterns: [
      // Remove generated LICENSE files. This seems to be a Webpack 5 issue.
      '**/*LICENSE*'
    ]
  }));

  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(pkg.rootDir, 'src', 'index.html'),
    inject: true,
    /**
     * Set the document title to "displayName" from package.json using:
     * <title><%= htmlWebpackPlugin.options.title %></title>
     */
    title: pkg.json.displayName ?? ''
  }));

  config.plugins.push(new MiniCssExtractPlugin({
    filename: isDevelopment ? 'styles.css' : 'styles-[contenthash].css'
  }));

  config.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: isProduction
  }));

  config.plugins.push(new webpack.EnvironmentPlugin({
    NODE_ENV: argv.mode,
    DISPLAY_NAME: pkg.json.displayName ?? '',
    DESCRIPTION: pkg.json.description ?? '',
    VERSION: pkg.json.version ?? ''
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

  if (isDevServer) {
    const host = 'localhost';
    const hasCertificates = devcert.hasCertificateFor(host);

    if (!hasCertificates) {
      log.info('Generating development certificate.');
      log.info(log.chalk.dim('You may be prompted for your password. This should only happen once.'));
      log.info(log.chalk.dim(`For more information, see: ${log.chalk.blue('https://github.com/davewasmer/devcert')}`));
    }

    const [
      port,
      { key, cert }
    ] = await Promise.all([
      getPort({ port: 8080 }),
      devcert.certificateFor(host)
    ]);

    if (!hasCertificates) {
      log.info('Certificates generated.');
    }

    log.info(log.chalk.dim(`Starting development server on port ${log.chalk.green(port)}...`));

    // Asynchronously wait for the dev server to start, then open a browser.
    void waitPort({ host, port, output: 'silent' }).then(() => void open(`https://${host}:${port}`));

    config.devServer = {
      https: { key, cert },
      // Causes the server to listen on all available network devices. Useful if
      // the developer needs to access the server from a different machine.
      host: '0.0.0.0',
      port,
      hot: true,
      inline: true,
      overlay: true,
      compress: true,
      disableHostCheck: true,
      historyApiFallback: true,
      quiet: true
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

  config.stats = 'normal';
}, ({ config }) => {
  // As of version 7.4.0, @babel/polyfill is deprecated in favor of including
  // core-js and regenerator-runtime directly.
  // See: https://babeljs.io/docs/en/babel-polyfill
  config.entry.support = [
    'core-js/stable',
    'regenerator-runtime/runtime',
    'react-hot-loader/patch'
  ];
});
