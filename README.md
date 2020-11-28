<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/100517002-855a0480-313c-11eb-8966-3ca9ec1f222e.png" style="max-width: 100%">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/ts"><img src="https://img.shields.io/npm/v/@darkobits/ts.svg?style=flat-square"></a>
  <a href="https://travis-ci.com/github/darkobits/ts"><img src="https://img.shields.io/travis/com/darkobits/ts.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/ts"><img src="https://img.shields.io/david/darkobits/ts?style=flat-square"></a>
  <a href="https://www.conventionalcommits.org"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
</p>

# Philosophy

`ts` serves a similar purpose to tools like `create-react-app`, but without the
training wheels; its target audience is experienced developers who are familiar
with modern JavaScript tooling and are looking for a way to simplify and
consolidate their build and release toolchains across multiple projects they
manage. The two principal features of `ts` are:

* **Dependency management:** All common dependencies needed to build and release
  a modern JavaScript / TypeScript project are provided by `ts`. This reduces
  bloat in your package.json, reduces the maintenance burden of keeping
  dependencies up to date, ensures versioning for tooling and their related
  plugins are always in sync, letting you spend more time focusing on your
  project and less time dealing with tooling, configuration, and compatibility
  issues.
* **Configuration:** Base configuration with sane defaults is provided for each
  tool managed by `ts`. However, configurations can always be extended and
  customized to suit your project's needs.

For developers that manage a large number of projects, using a consolidated
toolchain like `ts` can save a tremendous amount of time and promote consistency
from project to project. While `ts` is "opinionated", it aims to be highly
flexible as well, allowing developers extend the base configurations provided by
`ts` to suit their project's needs without having to ["eject"](https://create-react-app.dev/docs/available-scripts/#npm-run-eject).

# Features

* Transpilation with [Babel](https://babeljs.io/).
* Type-checking and declaration file generation with [TypeScript](https://www.typescriptlang.org).
* Unit testing with [Jest](https://jestjs.io/).
* Linting with [ESLint](https://eslint.org/).
* Version and change log management with [`standard-version`](https://github.com/conventional-changelog/standard-version).
* Easily check for newer versions of dependencies with [`npm-check`](https://github.com/dylang/npm-check).
* Package script management with [NPS](https://github.com/sezna/nps).

It is recommended that you have at least a working knowledge of these tools
before installing `ts`.

# Install

```
npm install --save-dev @darkobits/ts
```

# Conventions

Projects that use `ts` should adhere to the following conventions:

* Source files should be contained in a root directory named `src`.
* Source files will be transpiled to a root directory named `dist`.
* Changelogs will be written to a root file named `CHANGELOG.md`.
* Path mapping is set up such that `src` is treated as a root. For example, to
  import a file at `src/lib/utils.ts` from anywhere in your project, you would
  write:

  ```ts
  import utils from 'lib/utils';
  ```

  This keeps import statements terse and declarative, and prevents
  [relative path hell](https://goenning.net/2017/07/21/how-to-avoid-relative-path-hell-javascript-typescript-projects/).
* Unit tests should end in `.spec.ts` and should reside in the `src` directory
  alongside source files.
* Commit messages should follow the [Conventional Commit](https://www.conventionalcommits.org)
  specification, allowing tooling to automatically keep your project's change
  log up-to-date and compute the correct [semantic version](https://semver.org/)
  to use when creating a new release.

# Configuration Files

This section will walk you through setting up the configuration files required
by the various tools used by `ts`. If you are already familiar with setting up
these tools, this process should be straightforward. Each base configuration
provided by `ts` comes in one of two variants depending on whether the
underlying tool's configuration supports an `extends` option:

* For tools that support an `extends` option, `ts` will provide a string literal
  pointing to its base configuration. Simply provide this value as the `extends`
  option in the tool's configuration file.
* For tools that do not support `extends`, `ts` will provide a function that
  accepts a configuration object for the underlying tool. `ts` will then merge
  this object with its base configuration.

## NPS

NPS is used to manage and coordinate tasks, keeping your "scripts" section terse
while still giving the developer the flexibility to write custom scripts using
the full power of JavaScript. To configure NPS, create `package-scripts.js` in
your project root. To use the base package scripts from `ts`, call the `nps`
configuration function:

> `package-scripts.js`

```js
module.exports = require('@darkobits/ts').nps();
```

To define additional package scripts, pass an object to `nps`:

```js
module.exports = require('@darkobits/ts').nps({
  scripts: {
    // Long form:
    foo: {
      description: 'My awesome script.',
      script: 'foo --bar --baz'
    },
    // Short form:
    bar: 'bar --qux'
  }
});
```

Once you have created this file, you can get a list of all package scripts by
running:

```
npx nps --scripts
```

Take a moment to familiarize yourself with the base scripts provided by `ts`.
You may also wish to create aliases to commonly-used scripts in `package.json`.
At the very least, it is recommended that you alias the `prepare` script, which
NPM will then run as a lifecycle phase after `npm install`:

```json
"scripts": {
  "prepare": "nps prepare"
}
```

**💁🏻‍♀️ PROTIP:** To save yourself a few keystrokes, you can install the NPS CLI
globally (`npm i -g nps`) which will allow you to run package scripts without
having to use the `npx` prefix (or `npm run ...` if you've aliased a script in
`package.json`). Even better, you can [add `./node_modules/.bin` to your `$PATH`](https://www.youtube.com/watch?v=2WZ5iS_3Jgs&feature=youtu.be)
and avoid having to install NPS globally.

**💁🏻‍♀️ PROTIP:** NPS supports partial string matching for script names. For
example, to run the script `build.watch`, you only need to type `nps b.w`. ✨

## <img src="https://user-images.githubusercontent.com/441546/100516407-80935180-3138-11eb-9a98-b9c0fdeb3014.png" height="24">

Babel is used to transpile your code, while the TypeScript compiler is used for
type-checking and for generating declaration files. To configure Babel, create
`babel.config.js` in your project root and `extend` the `ts` base configuration.

> `babel.config.js`

```js
module.exports = {
  extends: require('@darkobits/ts').babel
};
```

## <img src="https://user-images.githubusercontent.com/441546/100515271-b122bd80-312f-11eb-9137-a3cae4ce8ef1.png" height="18"> TypeScript

In your project root, create `tsconfig.json`. Then, `extend` the TypeScript
configuration `ts`. When configuring TypeScript, there are a few fields that
must be declared directly in your project's `tsconfig.json` because TypeScript
resolves paths relative to the `tsconfig.json` in which they were defined. These
fields are `compilerOptions.baseUrl`, `compilerOptions.outDir`, and
`compilerOptions.paths`.

> `tsconfig.json`

```jsonc
{
  "extends": "@darkobits/ts/config/tsconfig-base.json",
  "compilerOptions": {
    "baseUrl": "src",
    "outDir": "dist",
    "paths": {"*": ["*", "src/*"]}
  }
}
```

## <img src="https://user-images.githubusercontent.com/441546/100515295-db747b00-312f-11eb-9368-7e58dfeef76c.png" height="16"> Jest

Jest is used for unit-testing your project. To configure Jest, create
`jest.config.js` in your project root, then invoke the Jest configuration
function from `ts`.

> `jest.config.js`

```js
module.exports = require('@darkobits/ts').jest();
```

Tp provide additional/custom configuration:

```js
module.exports = require('@darkobits/ts').jest({
  collectCoverageFrom: [
    '<rootDir>/my-custom-path'
  ]
});
```

## <img src="https://user-images.githubusercontent.com/441546/100515367-72413780-3130-11eb-9242-76f2823274ce.png" height="20"> ESLint

ESLint is used to reduce bugs by encouraging best practices and consistent code
style. To configure ESLint, create `.eslintrc.js` in your project root. Then,
`extend` the ESLint configuration from `ts`.

> `.eslintrc.js`

```js
module.exports = {
  extends: require('@darkobits/ts').eslint,
}
```

# Running Scripts

The primary way you will interact with tooling is via "package scripts" using
NPS. `ts` provides a robust set of default package scripts for most common
tasks, and you are able to add your own (or even overwrite the defaults) in your
`package-scripts.js` file.

For a list of all scripts provided by `ts`, make sure you have created a
`package-scripts.js` file in your project root per the instructions above. Then,
you may run:

```
npx nps --scripts
```

This will print a list of all defined scripts, a brief description of what the
script does, and the command(s) it will execute.

If you prefer to run scripts using `npm run script-name`, you can alias any
NPS package script in `package.json` thusly:

```json
"scripts": {
  "script-name": "nps script.name"
}
```

Note that the `npx` prefix is not required here because NPM will automatically
look for the NPS binary in your local `node_modules` folder.

This rest of this section will go over the most common scripts used to manage a
project. It assumes the user has not installed NPS globally nor added
`./node_modules/.bin` to their `$PATH`, so each example will use the long form
notation with `npx`.

## Building

The build script will compile your project with Babel and use TypeScript to
type-check the project and emit type declaration files. These two processes are
run in parallel.

To execute this script, run:

```
npx nps build
```

To continuously build and type-check the project in watch mode, run:

```
npx nps build.watch
```

## Testing

To run unit tests for your project with Jest, run:

```
npx nps test
```

To continuously run tests in watch mode, run:

```
npx nps test.watch
```

To run unit tests and generate a coverage report, run:

```
npx nps test.coverage
```

## Versioning

To generate (or update) your project's `CHANGELOG.md` and bump the project's
version in `package.json`, run:

```
npx nps bump
```

To create a beta release, run:

```
npx nps bump.beta
```

For your project's [first release](https://github.com/conventional-changelog/standard-version#first-release),
you may not want to bump the version at all, and only generate a change-log and
release commit. For this, run:

```
npx nps bump.first
```

**Note:** `ts` uses `standard-version` under the hood. Unlike other release
management tools, `standard-version` will _never_ modify remote resources. In
other words, after creating a release commit, it will not push that commit
upstream and it will not run `npm publish` for you. This gives you a chance to
review everything before actually cutting a release. If you still wish to
automate this process (in CI, for example) you can explicitly call `git push`
and/or `npm publish` after running this script.

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
  "prepare": "nps prepare"
}
```
