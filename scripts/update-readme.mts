import { EOL } from 'node:os'

import ejs from 'ejs'
import fs from 'fs-extra'

interface DependencyInfo {
  name: string
  url: string
}

const OUR_PACKAGE_JSON_PROMISE = import('../package.json', { with: { type: 'json' }})

/**
 * Gets the current local version of the provided dependency.
 */
async function getDependencyVersion(name: string) {
  const { dependencies, peerDependencies } = await OUR_PACKAGE_JSON_PROMISE

  if (Reflect.has(peerDependencies, name))
    return Reflect.get(peerDependencies, name) as string

  if (Reflect.has(dependencies, name))
    return Reflect.get(dependencies, name) as string

  throw new Error(`[getDependencyVersion] Unable to get dependency version for "${name}".`)
}

/**
 * Constructs a Markdown table with each dependency and its version.
 */
async function buildDependencyTable(dependencies: Array<DependencyInfo>) {
  const table = [
    '| Name | Version',
    '| :-- | :--'
  ]

  for (const dependency of dependencies) {
    const { name, url } = dependency
    const version = await getDependencyVersion(name)
    table.push(`| [\`${name}\`](${url}) | \`${version}\``)
  }

  return table.join(EOL)
}

/**
 * List of major dependencies we want to show version information for.
 */
const dependencies = [{
  name: 'typescript',
  url: 'https://github.com/microsoft/TypeScript'
}, {
  name: 'vite',
  url: 'https://github.com/vitejs/vite'
}, {
  name: 'vitest',
  url: 'https://github.com/vitest-dev/vitest'
}, {
  name: 'eslint',
  url: 'https://github.com/eslint/eslint'
}, {
  name: '@darkobits/eslint-plugin',
  url: 'https://github.com/darkobits/eslint-plugin'
}, {
  name: 'semantic-release',
  url: 'https://github.com/semantic-release/semantic-release'
}, {
  name: '@darkobits/nr',
  url: 'https://github.com/darkobits/nr'
}]

const data = {
  dependencyVersionTable: await buildDependencyTable(dependencies)
}

ejs.renderFile('scripts/README.md.ejs', data, {}, (err, result) => {
  // return err ? reject(err) : resolve(result);
  if (err) {
    process.stdout.write(err.toString())
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  } else {
    void fs.writeFile('README.md', result)
  }
})