# Advanced

### Adding Local `node_modules/.bin` to `$PATH`

To save yourself a few keystrokes when issuing commands to `nr`, you can
[add `./node_modules/.bin` to your `$PATH`](https://www.youtube.com/watch?v=2WZ5iS_3Jgs)
which will allow you to run locally-installed versions of NPM package
executables from the command line. This approach is preferable to:

* Aliasing the script in `package.json` and using `npm run script:name`.
* Using the `npx` prefix and using `npx nr script.name`.
* Installing `nr` globally.

To ensure your shell is configured correctly, run `which nr` from a `ts`
project's root directory. You should see the following output:

```
> which nr
./node_modules/.bin/nr
```

Now, to run a package script:

```
nr script.name
```
