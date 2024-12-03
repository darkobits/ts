import path from 'node:path'

import { defineConfig } from '@darkobits/nr'
import chalk from 'chalk'
import { isCI } from 'ci-info'
import fs from 'fs-extra'

import { defaultPackageScripts } from './src'

export default defineConfig([
  // Register the default scripts defined by this package.
  defaultPackageScripts,
  // Additionally, register our own custom scripts.
  ({ command, fn, script }) => {
    script('test.smoke', [[
      command.node('index.js', { cwd: './tests/fixtures/cjs' }),
      command.node('index.js', { cwd: './tests/fixtures/esm' })
    ]], {
      group: 'Test',
      description: 'Run smoke tests against the compiled version of the project.',
      timing: true
    })

    // When publishing this package, we use re-pack's 'publish' command to
    // publish from the .re-pack directory rather than `npm publish`.
    script('publish', [
      // Re-pack the project.
      command('re-pack'),
      // Publish the project.
      command('re-pack', { args: ['publish'] }),
      // Push the release commit.
      command('git', { args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }] }),
      // Remove the re-pack directory.
      fn(() => fs.rm(path.resolve('.re-pack'), { recursive: true, force: true }))
    ], {
      group: 'Release',
      description: `Publish the package using ${chalk.white.bold('re-pack')}.`,
      timing: true
    })

    // Automatically publish a new version of the package after performing a
    // version bump.
    script('postBump', [
      'script:publish',
      command('git', { args: ['push', 'origin', 'HEAD', { setUpstream: true, followTags: true }] })
    ], {
      group: 'Lifecycle',
      description: '[hook] After a bump script completes, publish to NPM and push the release commit.'
    })

    if (!isCI) {
      script('postBuild', [
        command.node('./scripts/update-readme.mts', {
          nodeOptions: ['--loader=ts-node/esm', '--no-warnings']
        })
      ], {
        group: 'Lifecycle',
        description: '[hook] Update dependency versions in README.'
      })

      script('postPrepare', 'script:test.smoke', {
        group: 'Lifecycle',
        description: '[hook] After the prepare script, run smoke tests.'
      })
    }
  }
])