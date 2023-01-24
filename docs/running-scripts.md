# Running Scripts

The primary way you will interact with tooling is via package scripts using `nr`. `ts` provides a robust
set of default package scripts for most common tasks, and you are able to add your own (or even
overwrite the defaults) in your `nr.config.js` file.

For a list of all scripts provided by `ts`, make sure you have created an `nr.config.js` file in your
project root, then run:

```
npx nr --scripts
```

This will print a list of all defined scripts and a brief description of what each script does.

If you prefer to run scripts using `npm run script-name`, you can alias any `nr` script in
`package.json` thusly:

```json
"scripts": {
  "script-name": "nr script.name"
}
```

?> The `npx` prefix is not required here because NPM will automatically look for the `nr` executable in
your local `node_modules` folder.

This rest of this section will go over the most common scripts used to manage a project. It assumes the
user has not installed `nr` globally (not recommended) nor added [`./node_modules/.bin` to their `$PATH`](#advanced),
so each example will use the long form notation with `npx`.

## Building

The build script will lint your project using ESLint, compile with Babel, and use TypeScript to
type-check and emit type declaration files. These two processes are run in parallel.

To execute this script, run:

```
npx nr build
```

To continuously build and type-check the project in watch mode, run:

```
npx nr build.watch
```

### Pre-Build & Post-Build Scripts

If you define `prebuild` and/or `postbuild` scripts in `nr.config.js`, `ts` will run them before and
after the `build` script. These scripts are not run with `build.watch`.

```js
// nr.config.js
import { nr } from '@darkobits/nr';

export default nr(({ command, script }) => {
  script('postbuild', {
    description: 'Runs after the "build" script.',
    run: [
      command('cleanup', [
        // Runs del .cache --force
        'del', ['.cache'], { force: true }
      ])
    ]
  })
});
```

## Testing

To run unit tests for your project with Vitest, run:

```
npx nr test
```

To continuously run tests in watch mode, run:

```
npx nr test.watch
```

To run unit tests and generate a coverage report, run:

```
npx nr test.coverage
```

## Linting

Linting is performed automatically as part of the `build` script, but you can still manually lint the
project by running:

```
npx nr lint
```

To automatically fix any fixable errors in the project, run:

```
npx nr lint.fix
```

## Releasing (Semantic Release)

If you prefer to release your project automatically from a CI environment, `ts` ships with [`semantic-release`](https://github.com/semantic-release/semantic-release).
To extend the `ts` configuration for it, create `release.config.js` in your project root:

```js
// release.config.js
module.exports = {
  extends: require('@darkobits/ts').release
};
```

#### Publishing Releases to GitHub

If you need to publish your project to GitHub, you will need to create a [personal access token](https://github.com/settings/tokens)
with the `public_repo` scope and then configure a `GH_TOKEN` environment variable in your CI environment
with this value. If `GH_TOKEN` is not present, `ts` will omit the GitHub plugin from its
`semantic-release` configuration.

#### Publishing to NPM

If you need to publish your project to NPM, you will need to create an NPM Access Token (the
"Automation" token type is recommended) and then configure an `NPM_TOKEN` environment variable in your
CI environment with this value. If `NPM_TOKEN` is not present, `ts` will omit the NPM plugin from its
`semantic-release` configuration.

## Releasing (Standard Version)

To generate (or update) your project's `CHANGELOG.md` and bump the project's version in `package.json`,
run:

```
npx nr bump
```

To create a beta release, run:

```
npx nr bump.beta
```

For your project's [first release](https://github.com/conventional-changelog/standard-version#first-release),
you may not want to bump the version at all, and only generate a change-log and release commit. For
this, run:

```
npx nr bump.first
```

#### Pre-Bump & Post-Bump Scripts

If you define `prebump` and/or `postbump` scripts in `nr.config.js`, `nr` will run them before and
after any `bump*` scripts.

```js
// nr.config.js
import { nr } from '@darkobits/nr';

export default nr(({ command, script }) => {
  script('postbump', {
    description: 'Runs after any "bump" scripts.',
    run: [
      command('cleanup', [
        // Runs del .cache --force
        'del', ['.cache'], { force: true }
      ])
    ]
  })
});
```

## NPM Lifecycles

`ts` also provides a `prepare` script that will build and test the project and run any unit tests. The
`prepare` lifecycle is designed to ensure that when a developer clones a repository for the first time
and runs `npm install`, they can be confident that the project builds and its tests are passing. This
gives the developer confidence that the project's tooling is configured correctly and that its source
code is in a good working state.

To have NPM run this script as part of the "prepare" lifecycle, you _must_ create an alias in
`package.json`:

```json
"scripts": {
  "prepare": "nr prepare"
}
```
