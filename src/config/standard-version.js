/**
 * Custom configuration for standard-version's CHANGELOG generation.
 */
module.exports = {
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
};
