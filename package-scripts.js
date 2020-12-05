require('./src/etc/babel-register');

module.exports = require('./src').nps(({ npsUtils }) => ({
  scripts: {
    prepare: npsUtils.series(
      npsUtils.series.nps('lint', 'build', 'test.passWithNoTests'),
      './dist/etc/link-bins.js'
    ),
    publish: {
      description: 'Re-pack and publish the package.',
      script: 're-pack publish'
    },
    repack: {
      description: 'Re-pack the package.',
      script: 're-pack',
      watch: {
        description: 'Link and continuously re-pack the package.',
        script: 're-pack --link --watch'
      }
    },
    docs: {
      serve: {
        description: 'Start a local server for documentation.',
        script: 'docsify serve ./docs'
      }
    }
  }
}));
