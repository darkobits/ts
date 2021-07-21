const { resolvePath } = require('babel-plugin-module-resolver');

module.exports = {
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

        // Effectively appends the appropriate extension to imports that reference
        // a file within a package in node_modules.
        if (resolvedPath === null) {
          try {
            const requireResolvedPath = require.resolve(sourcePath);
            const idx = requireResolvedPath.lastIndexOf(sourcePath);
            return requireResolvedPath.slice(idx);
          } catch {
            return null;
          }
        }

        // Since we are instructing the plugin to not strip extensions, we have to
        // manually replace the source extension with .js.
        if (typeof resolvedPath === 'string') {
          return resolvedPath.replace(/\.\w{2}$/g, '.js');
        }
      }
    }]
  ],
  // Strip comments from transpiled code.
  comments: false,
  sourceType: 'unambiguous'
};
