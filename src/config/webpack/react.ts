/* eslint-disable require-atomic-updates */
import path from 'path';

import { dirname } from '@darkobits/ts';
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
import {
  createWebpackConfigurationPreset,
  getPackageManifest
} from 'lib/webpack';


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
  const OUR_NODE_MODULES = await findUp('node_modules', { cwd: dirname(), type: 'directory' });

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
        name: '[name]-[hash].[ext]'
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
      'react-dom': isDevelopment
        ? require.resolve('@hot-loader/react-dom')
        : require.resolve('react-dom')
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
    // This must be set because the below assets are considered part of the
    // Webpack compilation.
    protectWebpackAssets: false,
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

  // ----- Optimizations -------------------------------------------------------

  config.optimization.minimize = isProduction;

  // N.B. This is needed in order to ensure hot reloading works.
  config.optimization.runtimeChunk = 'single';

  if (isProduction) {
    config.optimization.chunkIds = 'named';
    config.optimization.mergeDuplicateChunks = true;
    config.optimization.concatenateModules = true;

    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          chunks: 'all',
          test: (module: webpack.NormalModule) => module.context?.includes('node_modules'),
          name: (module: webpack.NormalModule) => {
            if (module.context) {
              const pkgJson = getPackageManifest(module.context);

              if (pkgJson) {
                return `${pkgJson.name}-${pkgJson.version}`;
              }
            }

            throw new Error(`Unable to resolve name/version for: ${module.context}`);
          },
          filename: 'vendor/[name].js',
          reuseExistingChunk: true,
          enforce: true,
          priority: 10
        },
        default: {
          chunks: 'all',
          test: (module: webpack.NormalModule) => !module.context?.includes('node_modules'),
          name: 'app',
          filename: '[name]-[contenthash].js',
          reuseExistingChunk: true,
          maxSize: Number.POSITIVE_INFINITY,
          maxInitialRequests: Number.POSITIVE_INFINITY,
          enforce: true,
          priority: 0
        }
      }
    };
  }


  // ----- Misc ----------------------------------------------------------------

  config.devtool = isDevelopment ? 'eval' : 'source-map';

  config.performance = {
    maxAssetSize: bytes('550kb'),
    maxEntrypointSize: bytes('550kb')
  };

  config.cache = {
    type: 'filesystem'
  };

  config.stats = 'normal';
}, ({ config, isDevelopment }) => {
  // As of version 7.4.0, @babel/polyfill is deprecated in favor of including
  // core-js and regenerator-runtime directly.
  // See: https://babeljs.io/docs/en/babel-polyfill
  const SUPPORT_MODULES = [
    require.resolve('core-js/stable'),
    require.resolve('regenerator-runtime/runtime'),
    isDevelopment && require.resolve('react-hot-loader/patch')
  ].filter(Boolean) as Array<string>;

  config.entry.vendor = SUPPORT_MODULES;

  // if (typeof config.entry.index === 'string') {
  //   config.entry.index = [
  //     ...SUPPORT_MODULES,
  //     config.entry.index
  //   ];
  // } else {
  //   config.entry.vendor = SUPPORT_MODULES;
  // }
});
