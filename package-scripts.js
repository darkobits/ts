module.exports = require('@darkobits/ts').nps({
  scripts: {
    repack: {
      default: {
        description: 'Re-pack the package.',
        script: 're-pack'
      },
      watch: {
        description: 'Link and continuously re-pack the package.',
        script: 're-pack --link --watch'
      }
    },
    publish: {
      description: 'Re-pack and publish the package.',
      script: 're-pack publish'
    }
  }
});
