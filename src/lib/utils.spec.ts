import path from 'node:path';

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockExecSync = vi.fn();
vi.doMock('child_process', () => ({
  execSync: mockExecSync
}));

const mockReadPackageUp = vi.fn();
vi.doMock('read-package-up', () => ({
  readPackageUp: mockReadPackageUp
}));

const mockFindUp = vi.fn();
vi.doMock('find-up', () => ({
  findUp: mockFindUp
}));

const mockGetTsconfig = vi.fn();
vi.doMock('get-tsconfig', () => ({
  getTsconfig: mockGetTsconfig
}));

describe('gitDescribe', () => {
  it('should parse results', async () => {
    mockExecSync.mockImplementation(() => 'v1.2.3-15-g7246d34');
    const { gitDescribe } = await import('./utils');
    expect(gitDescribe()).toBe('v1.2.3-7246d34');
  });
});

describe('getPackageContext', () => {
  it('should return package metadata', async () => {
    const testPackageRoot = '/foo/bar/baz';
    const testSrcDir = 'src';
    const testOutDir = 'dist';
    const testPackageJson = {
      name: 'foo-pkg',
      version: '1.0.0'
    };
    const testTsConfig = {
      compilerOptions: {
        baseUrl: 'src',
        outDir: 'dist'
      }
    };

    mockReadPackageUp.mockImplementation(async () => ({
      path: testPackageRoot,
      packageJson: testPackageJson
    }));

    mockFindUp.mockImplementation(async () => path.join(testPackageRoot, 'tsconfig.json'));

    mockGetTsconfig.mockImplementation(() => ({
      path: testPackageRoot,
      config: testTsConfig
    }));

    const { getPackageContext } = await import('./utils');

    expect(await getPackageContext()).toMatchObject({
      root: testPackageRoot,
      outDir: path.join(testPackageRoot, testOutDir),
      srcDir: testSrcDir,
      tsConfigPath: path.join(testPackageRoot, 'tsconfig.json'),
      packageJson: testPackageJson,
      tsConfig: testTsConfig
    });
  });
});

describe('inferESLintConfigurationStrategy', () => {
  describe('when the user has a flat configuration file', () => {
    it('should return type "flat"', async () => {
      const testPackageRoot = '/foo/bar/baz';

      mockFindUp.mockImplementation(async (patterns: Array<string>) => {
        if (patterns.some(pattern => /\.config.js$/.test(pattern))) {
          return path.join(testPackageRoot, patterns[0]);
        }
      });

      const { inferESLintConfigurationStrategy } = await import('./utils');

      expect(await inferESLintConfigurationStrategy()).toMatchObject({
        type: 'flat',
        configFile: path.join(testPackageRoot, 'eslint.config.js')
      });
    });
  });

  describe('when the user has a legacy configuration file', () => {
    it('should return type "legacy"', async () => {
      const testPackageRoot = '/foo/bar/baz';

      mockFindUp.mockImplementation(async (patterns: Array<string>) => {
        if (patterns.some(pattern => pattern.endsWith('.eslintrc'))) {
          return path.join(testPackageRoot, patterns[0]);
        }
      });

      const { inferESLintConfigurationStrategy } = await import('./utils');

      expect(await inferESLintConfigurationStrategy()).toMatchObject({
        type: 'legacy',
        configFile: path.join(testPackageRoot, '.eslintrc')
      });
    });
  });

  describe('when the user has no configuration file', () => {
    it('should return false', async () => {
      mockFindUp.mockImplementation(async () => {
        return;
      });

      const { inferESLintConfigurationStrategy } = await import('./utils');

      expect(await inferESLintConfigurationStrategy()).toBe(false);
    });
  });
});

describe('createViteConfigurationScaffold', () => {
  it('should return a basic Vite configuration object', async () => {
    const { createViteConfigurationScaffold } = await import('./utils');

    expect(createViteConfigurationScaffold()).toMatchObject({
      build: {},
      plugins: [],
      resolve: {},
      server: {},
      test: {}
    });
  });
});

describe('createViteConfigurationPreset', () => {
  const testPackageRoot = '/foo/bar/baz';
  // const testSrcDir = 'src';
  // const testOutDir = 'dist';
  const testPackageJson = {
    name: 'foo-pkg',
    version: '1.0.0'
  };

  const testTsConfig = {
    compilerOptions: {
      baseUrl: 'src',
      outDir: 'dist'
    }
  };

  const testOutDir = 'dist';

  const testConfigEnv = {
    command: 'build',
    mode: 'development'
  } as const;

  beforeEach(() => {
    mockReadPackageUp.mockImplementation(async () => ({
      path: testPackageRoot,
      packageJson: testPackageJson
    }));

    mockFindUp.mockImplementation(async () => path.join(testPackageRoot, 'tsconfig.json'));

    mockGetTsconfig.mockImplementation(() => ({
      path: testPackageRoot,
      config: testTsConfig
    }));
  });

  describe('when the user provides a configuration function', () => {
    it('should call the function and merge its return value with the base configuration', async () => {
      const { createViteConfigurationPreset } = await import('./utils');

      const testPreset = createViteConfigurationPreset(({ config }) => {
        config.build.outDir = testOutDir;
      });

      const testUserConfig = {
        root: testPackageRoot
      };

      const fnForVite = testPreset(async () => testUserConfig);
      const configResult = await fnForVite(testConfigEnv);

      expect(configResult).toMatchObject({
        root: testPackageRoot,
        build: {
          outDir: testOutDir
        }
      });
    });

    it('should call the function and allow it to modify configuration in-place', async () => {
      const { createViteConfigurationPreset } = await import('./utils');

      const testPreset = createViteConfigurationPreset(({ config }) => {
        config.build.outDir = testOutDir;
      });

      const fnForVite = testPreset(async ({ config }) => {
        config.root = testPackageRoot;
      });

      const configResult = await fnForVite(testConfigEnv);

      expect(configResult).toMatchObject({
        root: testPackageRoot,
        build: {
          outDir: testOutDir
        }
      });
    });
  });

  describe('when the user provides a configuration value', () => {
    it('should merge the provided value with the base configuration', async () => {
      const { createViteConfigurationPreset } = await import('./utils');

      const testPreset = createViteConfigurationPreset(({ config }) => {
        config.build.outDir = testOutDir;
      });

      const fnForVite = testPreset({
        root: testPackageRoot
      });

      const configResult = await fnForVite(testConfigEnv);

      expect(configResult).toMatchObject({
        root: testPackageRoot,
        build: {
          outDir: testOutDir
        }
      });
    });
  });

  describe('when the user provides nothing', () => {
    it('should return the base configuration', async () => {
      const { createViteConfigurationPreset } = await import('./utils');

      const testPreset = createViteConfigurationPreset(({ config }) => {
        config.build.outDir = testOutDir;
      });

      const fnForVite = testPreset();

      const configResult = await fnForVite(testConfigEnv);

      expect(configResult).toMatchObject({
        build: {
          outDir: testOutDir
        }
      });
    });
  });
});
