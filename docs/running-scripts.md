# Running Scripts

The primary way you will interact with tooling is via package scripts using
`nr`. `ts` provides a robust set of default package scripts for most common
tasks, and you are able to add your own (or even overwrite the defaults) in your
`nr.config.js` file.

For a list of all scripts provided by `ts`, make sure you have created an
`nr.config.js` file in your project root, then run:

```
npx nr --scripts
```

This will print a list of all defined scripts, a brief description of what the
script does, and the command(s) it will execute.

If you prefer to run scripts using `npm run script-name`, you can alias any
`nr` script in `package.json` thusly:

```json
"scripts": {
  "script-name": "nr script.name"
}
```

?> The `npx` prefix is not required here because NPM will automatically look for
the `nr` executable in your local `node_modules` folder.

This rest of this section will go over the most common scripts used to manage a
project. It assumes the user has not installed `nr` globally (not recommended)
nor added [`./node_modules/.bin` to their `$PATH`](#advanced), so each example
will use the long form notation with `npx`.

## Building

The build script will lint your project using ESLint, compile with Babel, and
use TypeScript to type-check and emit type declaration files. These two
processes are run in parallel.

To execute this script, run:

```
npx nr build
```

To continuously build and type-check the project in watch mode, run:

```
npx nr build.watch
```

### Pre-Build & Post-Build Scripts

If you define `prebuild` and/or `postbuild` scripts in `nr.config.js`, `ts` will
run them before and after the `build` script. These scripts are not run with
`build.watch`.

```js
// nr.config.js
import { nr } from '@darkobits/nr';

export default nr(({ createCommand, createScript }) => {
  createScript('postbuild', {
    description: 'Runs after the "build" script.',
    run: [
      createCommand('cleanup', [
        // Runs del .cache --force
        'del', ['.cache'], { force: true }
      ])
    ]
  })
});
```

## Testing

To run unit tests for your project with Jest, run:

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

Linting is performed automatically as part of the `build` script, but you can
still manually lint the project by running:

```
npx nr lint
```

To automatically fix any fixable errors in the project, run:

```
npx nr lint.fix
```

## Releasing

To generate (or update) your project's `CHANGELOG.md` and bump the project's
version in `package.json`, run:

```
npx nr bump
```

To create a beta release, run:

```
npx nr bump.beta
```

For your project's [first release](https://github.com/conventional-changelog/standard-version#first-release),
you may not want to bump the version at all, and only generate a change-log and
release commit. For this, run:

```
npx nr bump.first
```

?> `ts` uses [`standard-version`](https://github.com/conventional-changelog/standard-version)
under the hood. Unlike other release management tools, `standard-version` will
_never_ modify remote resources. In other words, after creating a release
commit, it will not push that commit upstream and it will not run `npm publish`
for you. This gives you a chance to review everything before publishing a
release. If you wish to automate this process (in CI, for example) you can
explicitly call `git push` and/or `npm publish` after running this script.

### Pre-Bump & Post-Bump Scripts

If you define `prebump` and/or `postbump` scripts in `package-scripts.js`, `ts`
will run them before and after `bump*` scripts.

```js
// nr.config.js
import { nr } from '@darkobits/nr';

export default nr(({ createCommand, createScript }) => {
  createScript('postbump', {
    description: 'Runs after any "bump" scripts.',
    run: [
      createCommand('cleanup', [
        // Runs del .cache --force
        'del', ['.cache'], { force: true }
      ])
    ]
  })
});
```

## NPM Lifecycles

`ts` also provides a `prepare` script that will build and test the project and
run any unit tests. The `prepare` lifecycle is designed to ensure that when a
developer clones a repository for the first time and runs `npm install`, they
can be confident that the project builds and its tests are passing. This gives
the developer confidence that the project's tooling is configured correctly and
that its source code is in a good working state.

To have NPM run this script as part of the "prepare" lifecycle, you _must_
create an alias in `package.json`:

```json
"scripts": {
  "prepare": "nr prepare"
}
```
