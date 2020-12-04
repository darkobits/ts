// -----------------------------------------------------------------------------
// ----- Standard Version Changelog Preset -------------------------------------
// -----------------------------------------------------------------------------

/**
 * Uses 'extends': N/A
 * Non-CJS Config: N/A
 * Babel Config:   N/A
 *
 * Custom preset for standard-version's CHANGELOG generation.
 */
// @ts-expect-error: Package does not have type defs.
import config from 'conventional-changelog-conventionalcommits';


export default config({
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
