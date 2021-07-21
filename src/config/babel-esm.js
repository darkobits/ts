const path = require('path');

const { resolvePath } = require('babel-plugin-module-resolver');
const readPkgUp = require('read-pkg-up');

const cjsConfig = require('./babel');
const { TS_ENV } = process.env;

module.exports = TS_ENV === 'esm' ? {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      },
      modules: false
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // This plugin must come before @babel/plugin-proposal-class-properties.
    ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-add-module-exports',
    ['babel-plugin-module-resolver', {
      cwd: 'packagejson',
      root: ['./src'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
      stripExtensions: [],
      resolvePath: (sourcePath, currentFile, opts) => {
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
    }]
  ],
  // Strip comments from transpiled code.
  comments: false,
  sourceType: 'unambiguous'
} : cjsConfig;
