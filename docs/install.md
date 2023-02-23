# Install

### Requirements

> TL;DR: Node 14 or later, NPM 8 or later.

In order to use `ts`, it is recommended that you are running at least the [LTS](https://github.com/nodejs/release#release-schedule)
version of Node, but `ts` should work on versions as old as `14.x`.

Secondly, `ts` relies on the peer dependency installation strategy of NPM 8 (and later). Specifically,
it declares all tooling that expose executable scripts (ie: Vite, ESLint, TypeScript) as peer
dependencies, and it expects that the package manager being used will automatically install these
dependencies _and_ link their executable scripts in the standard `node_modules/.bin` directory.

You _may_ be able to configure Yarn or PNPm to mimic this behavior but, by default, both of these
package managers implement radically different installation strategies that break the above assumptions
and make it impossible for `ts` to expose executables properly.

As such, alternative package managers are not officially supported.

### Existing Projects

To add `ts` to an existing project, run:

```
npm install --save-dev @darkobits/ts
```

Then, follow the instructions in the [Configuration Files](configuration-files) section to configure the
various tools provided by `ts`.

---

### New Projects

The easiest way to start a new project using `ts` is to use the template repository [`ts-template`](https://github.com/darkobits/ts-template). This
repository is a "batteries included" template that contains everything you need to start coding your
next project in just a few minutes.

1. Create a fork of the template repository and follow the instructions to clone the repository to your
   local machine.
2. From the repository root, run `npm install` to install dependencies, build, type-check, unit test,
   and lint the project.
3. Update the `name`, `author`, `description`, and `repository` fields in `package.json`.
4. Happy coding! 👩🏻‍💻

When using the template repository, you will not need to manually create configuration files yourself.
However, you should still read through the [Configuration Files](configuration-files) and [Running Scripts](running-scripts)
sections of the documentation to learn how to use `ts` effectively.
