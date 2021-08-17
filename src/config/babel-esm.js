const path = require('path');

const { resolvePath } = require('babel-plugin-module-resolver');
const readPkgUp = require('read-pkg-up');

const { EXTENSIONS_WITH_DOT } = require('../etc/constants');

const cjsConfig = require('./babel');

const { TS_ENV } = process.env;


/**
 * Because extensions are required in import identifiers in ES Modules (except
 * when importing a bare package name), we need to add them to identifiers that
 * import other files in the local package or files within other packages.
 */
function customResolvePath(sourcePath, currentFile, opts) {
  const resolvedPath = resolvePath(sourcePath, currentFile, opts);

  // Handle import identifiers for node_modules packages and files
  // therein.
  if (resolvedPath === null) {
    try {
      // Get the absolute path require() would use to load the file.
      const requirePath = require.resolve(sourcePath);

      // This will usually be the case for Node built-ins. Return identifier
      // as-is.
      if (requirePath === sourcePath) {
        return sourcePath;
      }

      // Load the package.json for that package.
      const pkg = readPkgUp.sync( { cwd: path.dirname(requirePath) });

      // If the import identifier is the bare package name, return it as-is.
      if (sourcePath === pkg.packageJson.name) {
        return sourcePath;
      }

      // Otherwise, return the remainder of the absolute path including
      // and after the original import identifier, which will give us an
      // appropriate file extension.
      const fixedPath = requirePath.slice(requirePath.lastIndexOf(sourcePath));

      return fixedPath;
    } catch {
      // eslint-disable-next-line unicorn/no-null
      return null;
    }
  }

  // This case will handle all files internal to the project.
  if (typeof resolvedPath === 'string') {
    return resolvedPath.replace(/\.\w{2}$/g, '.js');
  }
}

module.exports = TS_ENV === 'esm' ? {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '14' },
      modules: false,
      exclude: ['@babel/plugin-proposal-dynamic-import']
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    'babel-plugin-add-module-exports',
    ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: EXTENSIONS_WITH_DOT,
      stripExtensions: [],
      resolvePath: customResolvePath
    }]
  ],
  comments: false,
  compact: false,
  sourceType: 'unambiguous'
} : cjsConfig;
