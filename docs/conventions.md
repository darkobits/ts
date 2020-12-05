# Conventions

Projects that use `ts` should adhere to / assume the following conventions:

### Source Files & Build Artifacts

Source files should be contained in a root directory named `src`. Source files
will be transpiled to a root directory named `dist`.

The `dist` directory should be added to the project's `.gitignore` file:

```sh
# Build artifacts.
/dist
```

To ensure the correct files are included in package tarballs when publishing to
NPM, the following should be added to `package.json`:

```json
"files": [
  "dist"
]
```

The `main` field should also be set to point to the correct file in the `dist`
folder. If the project's entrypoint was at `src/index.ts`, `main` should be set
thusly:

```json
"main": "dist/index.js"
```

### Commit Messages

`ts` ships with several release scripts that automate the process of determining
what kind of [semantic version](https://semver.org/) bump (ex: major, minor,
patch) to use as well as generating a change log. In order for these scripts to
work, a project's commit messages **must** follow the [Conventional Commit](https://www.conventionalcommits.org)
specification.

 Change logs will be written to a root file named `CHANGELOG.md`.

### Path Mapping & Relative Imports

Path mapping is set up such that `src` is treated as a root. For example, to
import a file at `src/lib/utils.ts` from anywhere in your project, you would
write:

```js
import utils from 'lib/utils';
```

This keeps import statements terse and declarative, and prevents [relative path hell](https://goenning.net/2017/07/21/how-to-avoid-relative-path-hell-javascript-typescript-projects/).

### Tests

Test files should end in `.spec.ts` and should reside in the `src` directory
alongside source files.
