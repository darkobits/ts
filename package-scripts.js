require('./src/etc/babel-register');

module.exports = require('./src').nps(() => ({
  scripts: {
    prepare: {
      script: [
        'nps build',
        'nps test.passWithNoTests',
        // N.B. Dependent packages will be able to use the ts.scripts.link-bins
        // binary invoked in nps.ts, but because we are bootstrapping, we have
        // to invoke this script in a slightly more verbose manner.
        `node --require ${require.resolve('./src/etc/babel-register')} ${require.resolve('./src/bin/scripts/link-bins')}`,
        'npx ts.scripts.update-notifier'
      ].join(' && ')
    },
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
