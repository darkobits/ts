import path from 'path';


// import env from '@darkobits/env';
import { faker } from '@faker-js/faker';
import {
  describe,
  it,
  vi,
  beforeEach,
  afterEach,
  expect
} from 'vitest';
// import {
//   vi
// } from 'vitest';

// import {
//   getNpmInfo,
//   getPackageInfo
// } from 'lib/utils';


// vi.mock('@darkobits/env');
vi.mock('@darkobits/fd-name');


beforeEach(() => {
  vi.resetModules();
});


describe('getPackageInfo', () => {
  const pkgName = faker.lorem.word();
  const pkgPath = faker.system.directoryPath();

  const readPkgUpMock = {
    readPackageUp: vi.fn(async () => {
      return {
        packageJson: {
          name: pkgName
        },
        path: path.join(pkgPath, 'package.json')
      };
    })
  };

  beforeEach(() => {
    vi.doMock('read-pkg-up', () => readPkgUpMock);
  });

  it('should return the contents of the nearest package.json', async () => {
    const { getPackageInfo } = await import('lib/utils');

    const result = await getPackageInfo();
    expect(result.json.name).toEqual(pkgName);
    expect(result.rootDir).toEqual(pkgPath);
    expect(readPkgUpMock.readPackageUp).toHaveBeenCalled();
  });
});


describe('getNpmInfo', () => {
  describe('when called during an "npm install" command', () => {
    beforeEach(() => {
      const envMock = vi.fn((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['install'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });

      vi.doMock('@darkobits/env', () => ({ default: envMock }));
    });

    it('should report accurate info', async () => {
      const { default: envMock } = await import('@darkobits/env');
      const { getNpmInfo } = await import('lib/utils');
      const result = getNpmInfo();
      expect(result.command).toBe('install');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(true);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(3);
    });

    afterEach(() => {
      vi.doUnmock('@darkobits/env');
    });
  });

  describe('when called during an "npm ci" command', () => {
    beforeEach(() => {
      const envMock = vi.fn((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['ci'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });

      vi.doMock('@darkobits/env', () => ({ default: envMock }));
    });

    it('should report accurate info', async () => {
      const { default: envMock } = await import('@darkobits/env');
      const { getNpmInfo } = await import('lib/utils');

      const result = getNpmInfo();
      expect(result.command).toBe('ci');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(true);
      expect(envMock).toHaveBeenCalledTimes(3);
    });

    afterEach(() => {
      vi.doUnmock('@darkobits/env');
    });
  });

  describe('when called during any other command', () => {
    beforeEach(() => {
      const envMock = vi.fn((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['audit'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });

      vi.doMock('@darkobits/env', () => ({ default: envMock }));
    });

    it('should report accurate info', async () => {
      const { default: envMock } = await import('@darkobits/env');
      const { getNpmInfo } = await import('lib/utils');

      const result = getNpmInfo();
      expect(result.command).toBe('audit');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(3);
    });

    afterEach(() => {
      vi.doUnmock('@darkobits/env');
    });
  });
});
