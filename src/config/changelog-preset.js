const config = require('conventional-changelog-conventionalcommits');


/**
 * Custom CHANGELOG preset based on conventional-changelog.
 *
 * See: https://github.com/conventional-changelog/conventional-changelog-config-spec
 */
module.exports = config({
  // While this parameter is defined in the spec, standard-version doesn't seem
  // to read it here. It does work when passed as a CLI argument; see
  // nr.config.ts.
  // releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
  types: [
    {type: 'feat', section: '✨ Features'},
    {type: 'fix', section: '🐞 Bug Fixes'},
    {type: 'chore', section: '🏗 Chores'},
    {type: 'docs', section: '📖 Documentation'},
    {type: 'refactor', section: '🛠 Refactoring'},
    {type: 'style', section: '🎨 Style'},
    {type: 'test', section: '🚦 Tests'}
  ]
});
