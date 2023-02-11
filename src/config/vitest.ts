import merge from 'deepmerge';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';


// Relative path required here.
import { BARE_EXTENSIONS, TEST_FILE_PATTERNS } from '../etc/constants';
import { getSourceAndOutputDirectories } from '../lib/utils';

import type { UserConfig, UserConfigExport } from 'vitest/config';


export default async (userConfigExport?: UserConfigExport) => {
  const { srcDir } = await getSourceAndOutputDirectories();

  const baseConfig: UserConfig = {
    plugins: [
      tsConfigPathsPlugin()
    ],
    test: {
      deps: {
        interopDefault: true
      },
      coverage: {
        all: true
      }
    }
  };

  if (srcDir) {
    // @ts-expect-error - We know baseConfig.test is defined.
    baseConfig.test.include = [
      `${srcDir}/**/*.{${TEST_FILE_PATTERNS.join(',')}}.{${BARE_EXTENSIONS.join(',')}}`
    ];

    // @ts-expect-error - We know baseConfig.test.coverage is defined.
    baseConfig.test.coverage.include = [
      `${srcDir}/**/*.{${BARE_EXTENSIONS.join(',')}}`
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
