// Enable debugging.
// require('debug').enable('semantic-release:*');

module.exports = {
  branches: [
    { name: 'master', channel: 'latest' },
    { name: 'beta', channel: 'beta', prerelease: 'beta' }
  ],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      // config: require.resolve('./src/config/changelog-preset'),
      // Note: These rules are applied in addition to the default release rules,
      // and do not overwrite them.
      releaseRules: [
        { type: 'chore', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'style', release: 'minor' },
      ]
    }],
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md'
    }],
    ['@semantic-release/release-notes-generator', {
      // preset: 'conventionalcommits',
      config: require.resolve('./src/config/changelog-preset')
    }],
    '@semantic-release/npm',
    ['@semantic-release/git', {
      message: 'chore(release): ${nextRelease.version}\n[skip ci]'
    }]
    // We do not need to release to GitHub.
    // '@semantic-release/github'
  ]
}
