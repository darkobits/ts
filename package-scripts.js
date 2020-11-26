require('./src/etc/babel-register');

/**
 * Resolve the path to our standard-version CLI that uses our custom
 * configuration. It is safe to use a compiled file in our dist folder for the
 * purposes of version bumping because our prepare script will ensure it exists.
 */
const standardVersion = require.resolve(`${__dirname}/dist/bin/standard-version`);


module.exports = require('./src/config/package-scripts')(({ npsUtils }) => ({
  scripts: {
    // N.B. These scripts will not run `nps prebump` / `nps postbump` per the
    // config file in config/package-scripts, but this package does not utilize
    // them, so there is no need to re-implement that logic here.
    bump: {
      description: 'Generates a change log and tagged commit for a release.',
      script: npsUtils.series(
        'nps prepare',
        `${standardVersion}`
      ),
      beta: {
        description: 'Generates a change log and tagged commit for a beta release.',
        script: npsUtils.series(
          'nps prepare',
          `${standardVersion} --prerelease=beta`
        )
      },
      first: undefined
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
    }
  }
}));
