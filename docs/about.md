`ts` is an integrated toolchain for building, testing, and releasing modern TypeScript projects. It can
be compared to tools like `create-react-app`, with a focus on quality and flexibility. Its target
audience are experienced developers who are familiar with modern JavaScript tooling and are looking for
a way to simplify and consolidate their build and release process across various projects.

The principal features of `ts` are:

#### Dependency Management

All [common dependencies](features) needed to build and release a modern, high-quality
JavaScript/TypeScript project are provided by `ts`. Using a single dependency for a project's entire
toolchain reduces the maintenance burden of keeping dependencies up to date and ensures tooling and
related plugins are kept in sync and compatible, allowing the you to focus building awesome software. ✨

#### Configuration Management

`ts` is opinionated insofar as it ships with a default configuration for each tool it provides. However,
base configurations can always be customized to suit a project's needs, or not used at all. Rather than
implementing a feature like **"[eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)"**,
`ts` aims to be flexible enough to support projects of varying complexity by giving the developer the
ability to opt-out of or easily override/re-configure the provided defaults.

#### Task-Running

A good build toolchain needs to have a developer-friendly API; typically a command-line tool. That CLI
is effectively the developer's user interface; it is what they will interact with every time they want
to build, test, or otherwise work on a project. For small projects, NPM's package scripts will suffice.
As projects grow, they typically require a more sophisticated tool to accommodate the more complex
requirements of larger applications. `ts` uses [`nr`](https://darkobits.gitbook.io/nr/), a robust
task-runner for JavaScript projects. Specifically, it encourages you to document and organize your
scripts, making it easy for new developers to quickly comprehend how to interact with your project's
build/test/deploy systems.

`ts` provides a comprehensive set of scripts that you can use in your project with just a 2-line
[configuration file](configuration-files?id=nr).

---

## Sandbox & Template Repository

`ts` offers a couple of ways for you to experiment with it. First, there is a [StackBlitz sandbox](https://codesandbox.io/p/sandbox/ts-template-y3dgkt)
that contains a simple Node application based on `ts`. Use it to get up and running in seconds if you
just want to mess around. If you'd like to start a new project based on `ts`, there is a [GitHub template repository](https://github.com/darkobits/ts-template)
that you can clone with a single click; just replace a few fields in `package.json` and start coding!
