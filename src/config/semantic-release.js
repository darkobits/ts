// Enable debugging.
// require('debug').enable('semantic-release:*');

const {
  NPM_TOKEN,
  GH_TOKEN
} = process.env;

module.exports = {
  branches: [
    { name: 'master', channel: 'latest' },
    { name: 'beta', channel: 'beta', prerelease: 'beta' }
  ],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      // Note: These rules are applied in addition to the default release rules,
      // and do not overwrite them.
      releaseRules: [
        { type: 'chore', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'style', release: 'minor' }
      ]
    }],
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md'
    }],
    ['@semantic-release/release-notes-generator', {
      // preset: 'conventionalcommits',
      config: require.resolve('./changelog-preset')
    }],
    // Conditionally add the NPM plugin if NPM_TOKEN is present.
    NPM_TOKEN ? '@semantic-release/npm' : undefined,
    // Conditionally add the GitHub plugin if GH_TOKEN is present.
    GH_TOKEN ? '@semantic-release/github' : undefined,
    // Responsible for creating a release commit containing changes to
    // package.json, CHANGELOG.md, etc. This commit will be tagged and pushed
    // back to the remote. Without this plugin, semantic-release will simply
    // tag the commit at HEAD and changes to all files updated by the release
    // will be discarded.
    ['@semantic-release/git', {
      message: 'chore(release): ${nextRelease.version}\n[skip ci]'
    }]
  ].filter(Boolean)
};
