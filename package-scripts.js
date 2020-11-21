require('./src/etc/babel-register');

module.exports = require('./src/config/package-scripts')(({ npsUtils }) => ({
  scripts: {
    publish: 're-pack --publish',
    repack: {
      script: 're-pack',
      watch: 're-pack --link --watch'
    }
  }
}));
