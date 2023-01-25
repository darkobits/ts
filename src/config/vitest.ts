import merge from 'deepmerge';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
// eslint-disable-next-line import/no-unresolved
import { defineConfig, UserConfigExport } from 'vitest/config';


export default (userConfig?: UserConfigExport) => merge<UserConfigExport>(
  defineConfig({
    plugins: [
      tsConfigPathsPlugin()
    ],
    test: {
      deps: {
        interopDefault: true
      }
    }
  }),
  userConfig ?? {}
);
