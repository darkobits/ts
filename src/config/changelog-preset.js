const config = require('conventional-changelog-conventionalcommits');


/**
 * Custom CHANGELOG preset based on conventional-changelog.
 *
 * See: https://github.com/conventional-changelog/conventional-changelog-config-spec
 */
module.exports = config({
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}\n[skip ci]',
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
