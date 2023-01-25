import merge from 'deepmerge';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
// eslint-disable-next-line import/no-unresolved
import { UserConfig, UserConfigExport } from 'vitest/config';

// Relative path required here.
import { getSourceAndOutputDirectories } from '../lib/utils';


export default async (userConfigExport?: UserConfigExport) => {
  const { srcDir } = await getSourceAndOutputDirectories();

  const baseConfig: UserConfig = {
    plugins: [
      tsConfigPathsPlugin()
    ],
    test: {
      deps: {
        interopDefault: true
      }
    }
  };

  if (srcDir) {
    // @ts-expect-error - We know baseConfig.test is defined.
    baseConfig.test.include = [
      `${srcDir}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
    ];
  }

  if (!userConfigExport) {
    return baseConfig;
  }

  if (typeof userConfigExport === 'function') {
    // @ts-expect-error - User configuration functions do not in fact require an
    // argument.
    const userConfigResult = await userConfigExport();

    return merge(baseConfig, userConfigResult);
  }

  return merge(baseConfig, await userConfigExport);
};
