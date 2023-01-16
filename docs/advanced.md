# Advanced

### Adding Local `node_modules/.bin` to `$PATH`

To save yourself a few keystrokes when issuing commands to `nr`, you can add `./node_modules/.bin` to
your `$PATH` environment variable, which will allow you to run locally-installed versions of NPM package
executables from the command line. This approach is preferable to:

* Aliasing the script in `package.json` and using `npm run script:name`.
* Using the `npx` prefix and using `npx nr script.name`.
* Installing `nr` globally.

To do so, in your shell configuration file, add the line:

```
export PATH="$PATH:$(npm root)/.bin"
```

To ensure your shell is configured correctly, run `which nr` from a `ts` project's root directory. You
should see the following output:

```
> which nr
/path/to/your/project/node_modules/.bin/nr
```

Now, to run a package script:

```
nr script.name
```
