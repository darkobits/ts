import merge from 'deepmerge';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
// eslint-disable-next-line import/no-unresolved
import { UserConfig, UserConfigExport } from 'vitest/config';

// Relative path required here.
import { SRC_DIR } from '../etc/constants';


const baseConfig: UserConfig = {
  plugins: [
    tsConfigPathsPlugin()
  ],
  test: {
    include: [
      `${SRC_DIR}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
    ],
    deps: {
      interopDefault: true
    }
  }
};


export default async (userConfigExport?: UserConfigExport) => {
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
