require('./src/etc/babel-register');
const { skipIfCiNpmLifecycle } = require('./src/lib/utils');


module.exports = require('./src').nps(({ npsUtils }) => ({
  scripts: {
    prepare: skipIfCiNpmLifecycle('prepare', npsUtils.series(
      npsUtils.series.nps(
        'lint',
        'build',
        'test.passWithNoTests'
      ),
      `node --require ${require.resolve('./src/etc/babel-register')} ${require.resolve('./src/etc/link-bins')}`
    )),
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
