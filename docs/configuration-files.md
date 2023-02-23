# Configuration Files

This section will walk you through setting up the configuration files required by the various tools used
by `ts`. If you are already familiar with setting up these tools, this process should be
straightforward.

`ts` takes one of two approaches to configuration, depending on the tool:

For tools that support JavaScript configuration files that export an object or function, `ts` will
provide a higher-order function which uses a base configuration with reasonable defaults, but will allow
you to invoke it with your own configuration function to set any overrides you may need. The two
configurations are then recursively merged.

For tools that leverage an `extends` option (ie: ESLint), `ts` provides an appropriate plugin/preset,
and additional configuration may be applied according to the tool's configuration schema.

---

# NR

[`nr`](https://github.com/darkobits/nr) is used to manage and coordinate tasks, keeping your
`package.json` "scripts" section terse while still giving you the flexibility to write custom scripts
using a JavaScript or TypeScript configuration file. To configure NR, create `nr.config.ts` or
`nr.config.js` in your project root. To use the base package scripts from `ts`, call the `nr`
configuration function:

```ts
// nr.config.ts
import { nr } from '@darkobits/ts';

export default nr();
```

To define additional package scripts or to overwrite one of the defaults, pass a function to `nr`:

```ts
// nr.config.ts
import { nr } from '@darkobits/ts';

export default nr(({ command, script }) => {
  script('awesome', {
    description: 'Do awesome things.',
    run: [
      command('awesome-cmd', ['awesome', { sauce: true }])
    ]
  })
});
```

Once you have created this file, you can produce a list of all package scripts by running:

```
npx nr --scripts
```

Take a moment to familiarize yourself with the base scripts provided by `ts`. You may also wish to
create aliases to commonly-used scripts in `package.json`. At the very least, it is recommended that you
alias the `prepare` script, which NPM will then run as a lifecycle phase after `npm install`:

```json
"scripts": {
  "prepare": "nr prepare"
}
```

`nr` supports partial string matching for script names. For example, to run the script `build.watch`,
you only need to type `nr b.w`. ✨

?> Complete documentation for `nr` can be found [here](https://github.com/darkobits/nr).

---

# ![TypeScript](https://user-images.githubusercontent.com/441546/100515271-b122bd80-312f-11eb-9137-a3cae4ce8ef1.png ':size=28') TypeScript :id=type-script

While `ts` does not use the TypeScript compiler directly, Vite plugins (and likely your IDE) need a
TypeScript configuration file to be present. `ts` also relies on some settings in this file to configure
Vite. In your project root, create `tsconfig.json`. Then, `extend` the base TypeScript configuration
from `ts`.

When configuring TypeScript, there are a few fields that _must_ be declared directly in your project's
`tsconfig.json` because TypeScript resolves certain paths relative to the `tsconfig.json` in which they
were defined.

In particular, `ts` uses the `baseUrl` and `outDir` settings to configure Vite, so these _must_ be set.

A minimal `tsconfig.json` should therefore contain the following:

```js
// tsconfig.json
{
  "extends": "@darkobits/ts/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "src",
    "outDir": "dist"
  }
}
```

---

# ![Vite](https://vitejs.dev/logo-with-shadow.png ':size=28') Vite :id=vite

Vite is used to compile your project. `ts` also uses plugins that type-check and lint your project as
well. To configure Vite, create `vite.config.js` or `vite.config.ts` in your project root. Then,
default-export one of the Vite configuration presets from `ts`. The examples below use the "library"
preset, suitable for building Node projects such as backend servers, CLIs, or libraries.

```ts
// vite.config.ts
import { vite } from '@darkobits/ts';

export default vite.library();
```

To provide additional/custom configuration:

```ts
// vite.config.ts
import { vite } from '@darkobits/ts';

export default vite.library({
  // Add your custom Vitest configuration here.
});
```

For more information on configuring Vite, consult the [Vite configuration documentation](https://vitejs.dev/config/).

---

# ![Vitest](https://user-images.githubusercontent.com/441546/214199495-d2479d48-6180-493b-b5e2-5d3fa2b7d99c.png ':size=28') Vitest :id=vitest

Vitest is used for unit-testing your project. By default, Vitest will use your existing Vite
configuration file with additional options for Vitest under the `test` key. Configuration presets
provided by `ts` ship with sensible defaults for Vitest, but these settings may be customized:

```ts
// vite.config.ts
import { vite } from '@darkobits/ts';

export default vite.library({
  test: {
    // Add your custom Vitest configuration here.
  }
});
```

For more information on configuring Vitest, consult the [Vitest configuration documentation](https://vitest.dev/config/).

---

# ![ESLint](https://user-images.githubusercontent.com/441546/100515367-72413780-3130-11eb-9242-76f2823274ce.png ':size=28') ESLint :id=eslint

ESLint is used to reduce bugs by encouraging best practices and consistent code style. To configure
ESLint, create `.eslintrc.js` in your project root. If your project has `"type": "module"` set in
`package.json`, you _must_ use the `.cjs` extension as ESLint does not support ESM configuration files.
Then, `extend` the configuration preset from `ts`.

```js
// .eslintrc.js
module.exports = {
  extends: 'plugin:@darkobits/ts'
};
```

For more information on configuring ESLint, consult the [ESLint configuration documentation](https://eslint.org/docs/latest/use/configure/).
