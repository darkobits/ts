`ts` is an integrated toolchain for building, testing, and releasing modern
TypeScript projects. It can be compared to tools like `create-react-app` with a
focus on flexibility. Its target audience is experienced developers who are
familiar with modern JavaScript tooling and are looking for a way to simplify
and consolidate their build and release process across their projects.

The two principal features of `ts` are:

### Dependency Management

All [common dependencies](features) needed to build and release a modern
JavaScript/TypeScript project are provided by `ts`. Using a single dependency
for a project's entire toolchain reduces the maintenance burden of keeping
dependencies up to date, ensures tooling and related plugins are kept in sync
and compatible, allowing the developer to focus building awesome software. ✨

### Configuration

`ts` is opinionated insofar as it ships with a default configuration for each
tool it provides. However, base configurations can always be customized to suit
a project's needs, or not used at all. This makes `ts` highly flexible by
default without having to **"[eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)"**.
