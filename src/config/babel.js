module.exports = () => {
  return {
    extends: require('@darkobits/ts').babel,
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'entry',
        corejs: 3,
        // Do not transpile import() statements. This will allow packages that
        // publish CommonJS to import ES Modules.
        exclude: ['@babel/plugin-proposal-dynamic-import']
      }],
      '@babel/preset-typescript',
      '@babel/preset-react',
      '@linaria/babel-preset'
    ],
    plugins: [
      'babel-plugin-transform-import-meta',
      '@babel/plugin-transform-runtime',
      ['@babel/plugin-proposal-decorators', { legacy: true, loose: true }],
      // At the moment, this is required for Linaria to work.
      ['babel-plugin-module-resolver', {
        cwd: 'packagejson',
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json']
      }]
    ],
    comments: false,
    sourceType: 'unambiguous'
  };
};
