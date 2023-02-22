`ts` is an integrated toolchain for building, testing, and releasing modern TypeScript projects. It can
be compared to tools like `create-react-app`, with a focus on quality and flexibility. Its target
audience are experienced developers who are familiar with modern JavaScript tooling and are looking for
a way to simplify and consolidate their build and release process across various projects.

The principal features of `ts` are:

### Dependency Management

All [common dependencies](features) needed to build and release a modern, high-quality
JavaScript/TypeScript project are provided by `ts`. Using a single dependency for a project's entire
toolchain reduces the maintenance burden of keeping dependencies up to date and ensures tooling and
related plugins are kept in sync and compatible, allowing the you to focus building awesome software. ✨

### Configuration Management

`ts` is opinionated insofar as it ships with a default configuration for each tool it provides. However,
base configurations can always be customized to suit a project's needs, or not used at all. Rather than
implementing a feature like **"[eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)"**,
`ts` aims to be flexible enough to support projects of varying complexity by giving the developer the
ability to opt-out of or easily override/re-configure the provided defaults.

### Task-Running

A good build toolchain needs to have a developer-friendly API; typically a command-line tool. These CLIs
are effectively the developer's user interface, the entrypoint to the build system that the developer
will interact with on a regular basis. `ts` uses [`nr`](https://darkobits.gitbook.io/nr/), a robust
task-runner for JavaScript projects that encourages self-documentation, making it trivial for new
contributors to an open source project to get up and running as quickly as possible.
