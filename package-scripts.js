require('./src/etc/babel-register');

module.exports = require('./src/config/package-scripts')(({ npsUtils }) => ({
  scripts: {
    publish: npsUtils.series(
      'npx re-pack',
      'npm publish .re-pack --tag=beta --ignore-scripts'
    )
  }
}));
