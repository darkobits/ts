const Module = require('module');
const path = require('path');

const { resolvePath: pluginModuleResolver } = require('babel-plugin-module-resolver');

const { EXTENSIONS_WITH_DOT } = require('../etc/constants');

const { NODE_ENV } = process.env;


function changeExtension(sourcePath, ext) {
  const parsed = path.parse(sourcePath);
  parsed.base = !parsed.ext ? `${parsed.base}${ext}` : parsed.base.replace(/\.\w{2,}$/g, ext);
  parsed.ext = ext;
  return path.format(parsed);
}


function customResolvePath(sourcePath, currentFile, opts) {
  // ----- Node Built-Ins ------------------------------------------------------

  if (Module.builtinModules.includes(sourcePath)) {
    return sourcePath;
  }

  if (sourcePath.startsWith('node:') && Module.builtinModules.includes(sourcePath.slice(5))) {
    return sourcePath;
  }


  // ----- URL Schemes ---------------------------------------------------------

  if ( sourcePath.startsWith('data:') || sourcePath.startsWith('file:')) {
    return sourcePath;
  }


  // ----- Internal Files ------------------------------------------------------

  // Note: This will be `null` if importing from outside the package.
  const resolvedInternalPath = pluginModuleResolver(sourcePath, currentFile, opts);

  if (resolvedInternalPath) {
    // Because this plugin was designed prior to ESM, when file extensions were
    // not required in import specifiers, we need to manually add them to the
    // final specifier.
    return changeExtension(resolvedInternalPath, '.js');
  }


  // ----- External Packages / Files -------------------------------------------

  /**
   * With the introduction of conditional exports (ie: export maps), it is
   * impossible to know how a package's author has configured path rewrites for
   * files within their package. And, there currently appears to be no way to
   * interrogate this behavior programmatically, so for now we will just leave
   * these as-is.
   */
  return sourcePath;
}


module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: '16' },
      modules: NODE_ENV === 'test' ? 'cjs' : false,
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
      cwd: 'babelrc',
      root: ['./src'],
      extensions: EXTENSIONS_WITH_DOT,
      // Because we are transpiling to native ESM, we don't want to strip any
      // extensions from import specifiers.
      stripExtensions: NODE_ENV === 'test' ? undefined : [],
      resolvePath: NODE_ENV === 'test' ? pluginModuleResolver : customResolvePath
    }]
  ],
  comments: false,
  compact: false,
  // Consider a file to be a "module" if import/export statements are present,
  // or else consider it a "script".
  sourceType: 'unambiguous'
};
