const path = require('path');

const { resolvePath } = require('babel-plugin-module-resolver');

const { EXTENSIONS_WITH_DOT } = require('../etc/constants');
const cjsConfig = require('./babel');

const { TS_ENV } = process.env;


/**
 * Because extensions are required in import identifiers in ES Modules (except
 * when importing a bare package name), we need to add them to identifiers that
 * import other files in the local package or files within other packages.
 */
function customResolvePath(sourcePath, currentFile, opts) {
  // Do not attempt to resolve internal, data, and file URL schemes.
  // See: https://nodejs.org/api/esm.html#urls
  if (sourcePath.startsWith('node:') || sourcePath.startsWith('data:') || sourcePath.startsWith('file:')) {
    return sourcePath;
  }

  const resolvedPath = resolvePath(sourcePath, currentFile, opts);

  // Handle import identifiers for node_modules packages and files
  // therein.
  if (resolvedPath === null) {
    return sourcePath;
  }

  // This case will handle all files internal to the project.
  if (typeof resolvedPath === 'string') {
    // Add extensions to imports without them.
    if (path.extname(resolvedPath) === '') {
      return `${resolvedPath}.js`;
    }

    // Change extensions to .js for imports with extensions.
    return resolvedPath.replace(/\.\w{2}$/g, '.js');
  }

  // eslint-disable-next-line unicorn/no-null
  return null;
}

module.exports = TS_ENV === 'esm' ? {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '16' },
      modules: false,
      // Do not transpile import() statements. This will allow packages that
      // publish CommonJS to import ES Modules.
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
  // Consider a file to be a "module" if import/export statements are present,
  // or else consider it a "script".
  sourceType: 'unambiguous'
} : cjsConfig;
