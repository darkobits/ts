require('./src/etc/babel-register');

module.exports = require('./src/config/package-scripts')(({ npsUtils }) => ({
  scripts: {
    publish: npsUtils.series(
      'nps build',
      './dist/scripts/re-pack.js'
    )
  }
}));
