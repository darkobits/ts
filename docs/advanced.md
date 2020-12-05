# Advanced

### Adding Local `node_modules/.bin` to `$PATH`

To save yourself a few keystrokes when issuing NPS commands, you can
[add `./node_modules/.bin` to your `$PATH`](https://www.youtube.com/watch?v=2WZ5iS_3Jgs)
which will allow you to run locally-installed versions of NPM packages from the
command line. This approach is preferable to:

* Aliasing the script in `package.json` and using `npm run script:name`.
* Using the `npx` prefix and using `npx nps script.name`.
* Installing NPS globally.

To ensure your shell is configured correctly, run `which nps` from a `ts`
project's root directory. You should see the following output:

```
> which nps
./node_modules/.bin/nps
```

Now, to run a package script:

```
nps script.name
```
