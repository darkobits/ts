const Module = require('module');
const path = require('path');

const { resolvePath: pluginModuleResolver } = require('babel-plugin-module-resolver');
const readPkgUp = require('read-pkg-up');
const resolveFrom = require('resolve-from');
const resolvePkg = require('resolve-pkg');

const { EXTENSIONS_WITH_DOT } = require('../etc/constants');
const cjsConfig = require('./babel');

const { TS_ENV } = process.env;


function resolvePackage(sourcePath) {
  try {
    return require.resolve(sourcePath);
  } catch {
    return resolvePkg(sourcePath);
  }
}


function introspectPackageImport(sourcePath, fromDir) {
  const resolvedPkg = resolvePackage(sourcePath);
  if (!resolvedPkg) return;

  const absoluteFilePath = resolveFrom(fromDir, sourcePath);
  const pkgInfo = readPkgUp.sync({ cwd: path.dirname(absoluteFilePath) });
  const kind = sourcePath === pkgInfo.packageJson.name ? 'bare' : 'file';
  const specifier = kind === 'file'
    ? absoluteFilePath.slice(absoluteFilePath.indexOf(sourcePath))
    : sourcePath;

  return {
    pkgName: pkgInfo.packageJson.name,
    pkgRoot: path.dirname(pkgInfo.path),
    kind,
    specifier
  };
}


function changeExtension(sourcePath, ext) {
  const parsed = path.parse(sourcePath);
  parsed.base = !parsed.ext ? `${parsed.base}${ext}` : parsed.base.replace(/\.\w{2,}$/g, ext);
  parsed.ext = ext;
  return path.format(parsed);
}


function customResolvePath(sourcePath, currentFile, opts) {
  const fromDir = path.dirname(currentFile);

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
    return changeExtension(resolvedInternalPath, '.js');
  }


  // ----- External Packages / Files -------------------------------------------

  const result = introspectPackageImport(sourcePath, fromDir);

  if (!result) {
    throw new Error(`Unable to resolve specifier: ${sourcePath}`);
  }

  return result.specifier;
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
      cwd: 'babelrc',
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
