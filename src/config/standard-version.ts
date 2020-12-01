// -----------------------------------------------------------------------------
// ----- Standard Version Configuration ----------------------------------------
// -----------------------------------------------------------------------------

/**
 * Uses 'extends': N/A
 * Non-CJS Config: N/A
 * Babel Config:   N/A
 *
 * Custom configuration for standard-version's CHANGELOG generation. This is
 * loaded via custom logic in our standard-version entrypoint rather than a
 * user-provided configuration file.
 */
export default {
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
