const config = require('conventional-changelog-conventionalcommits');


/**
 * Custom CHANGELOG preset based on conventional-changelog.
 */
module.exports = config({
  types: [
    {type: 'feat', section: '✨ Features'},
    {type: 'fix', section: '🐞 Bug Fixes'},
    {type: 'chore', section: '🏗 Chores'},
    {type: 'docs', section: '📖 Documentation'},
    {type: 'refactor', section: '🛠 Refactoring'},
    {type: 'style', section: '🎨 Style'},
    {type: 'test', section: '🚦 Tests'}
  ],
  releaseCommitMessageFormat: '🚀 chore(release): {{currentTag}}'
});
