# Configuration Files

This section will walk you through setting up the configuration files required
by the various tools used by `ts`. If you are already familiar with setting up
these tools, this process should be straightforward. Each base configuration
provided by `ts` comes in one of two variants depending on whether the
underlying tool's configuration supports an `extends` option:

* For tools that support an `extends` option, `ts` will provide a string literal
  pointing to its base configuration file. Simply provide this value as the
  `extends` option in the tool's configuration file.
* For tools that do not support `extends`, `ts` will provide a function that
  accepts a configuration object and will perform a recursive merge with its
  base configuration and return the merged object to the tool.

## NR

[`nr`](https://github.com/darkobits/nr) is used to manage and coordinate tasks,
keeping your `package.json` "scripts" section terse while still giving the
developer the flexibility to write custom scripts using the full power of
JavaScript. To configure NR, create `nr.config.js` in your project root. To use
the base package scripts from `ts`, call the `nr` configuration function:

```js
// nr.config.js
import { nr } from '@darkobits/ts';

export default nr();
```

To define additional package scripts, pass a function to `nr`:

```js
// nr.config.js
import { nr } from '@darkobits/ts';

export default nr(({ createCommand, createScript }) => {
  createScript('awesome', {
    description: 'Do awesome things.',
    run: [
      createCommand('awesome-cmd', ['awesome', { sauce: true }])
    ]
  })
});
```

Once you have created this file, you can get a list of all package scripts by
running:

```
npx nr --scripts
```

Take a moment to familiarize yourself with the base scripts provided by `ts`.
You may also wish to create aliases to commonly-used scripts in `package.json`.
At the very least, it is recommended that you alias the `prepare` script, which
NPM will then run as a lifecycle phase after `npm install`:

```json
"scripts": {
  "prepare": "nr prepare"
}
```

`nr` supports partial string matching for script names. For example, to run the
script `build.watch`, you only need to type `nr b.w`. ✨

?> Complete documentation for `nr` can be found [here](https://github.com/darkobits/nr).

## ![Babel](https://user-images.githubusercontent.com/441546/100516407-80935180-3138-11eb-9a98-b9c0fdeb3014.png ':size=128') :id=babel

Babel is used to transpile your code, while the TypeScript compiler is used for
type-checking and for generating declaration files. To configure Babel, create
`babel.config.js` in your project root and `extend` the `ts` base configuration.

```js
// babel.config.js
module.exports = {
  extends: require('@darkobits/ts').babel
};
```

!> As of Babel 7, a Babel configuration file **must** be authored using CommonJS
syntax.

## ![TypeScript](https://user-images.githubusercontent.com/441546/100515271-b122bd80-312f-11eb-9137-a3cae4ce8ef1.png ':size=22') TypeScript :id=type-script

In your project root, create `tsconfig.json`. Then, `extend` the TypeScript
configuration from `ts`.

When configuring TypeScript, there are a few fields that _must_ be declared
directly in your project's `tsconfig.json` because TypeScript resolves certain
paths relative to the `tsconfig.json` in which they were defined.

```json
// tsconfig.json
{
  "extends": "@darkobits/ts/tsconfig.json",
  "include": ["src"],
  "compilerOptions": {
    "baseUrl": "src",
    "outDir": "dist"
  }
}
```

## ![Jest](https://user-images.githubusercontent.com/441546/100515295-db747b00-312f-11eb-9368-7e58dfeef76c.png ':size=20') Jest :id=jest

Jest is used for unit-testing your project. To configure Jest, create
`jest.config.js` in your project root, then invoke the Jest configuration
function from `ts`.

```js
// jest.config.js
import { jest } from '@darkobits/ts';

export default jest();
```

To provide additional/custom configuration:

```js
// jest.config.js
import { jest } from '@darkobits/ts';

export default jest({
  // Add your custom Jest configuration here.
});
```

## ![ESLint](https://user-images.githubusercontent.com/441546/100515367-72413780-3130-11eb-9242-76f2823274ce.png ':size=20') ESLint :id=eslint

ESLint is used to reduce bugs by encouraging best practices and consistent code
style. To configure ESLint, create `.eslintrc.js` in your project root. Then,
`extend` the ESLint configuration from `ts`.

```js
// .eslintrc.js
module.exports = {
  extends: require('@darkobits/ts').eslint,
}
```

!> As of ESLint 7, an ESLint configuration file **must** be authored using
CommonJS syntax.
