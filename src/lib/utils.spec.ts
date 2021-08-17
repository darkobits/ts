import path from 'path';

import env from '@darkobits/env';
import callsites from 'callsites';
import faker from 'faker';
import { getBinPathSync } from 'get-bin-path';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';

import {
  getPackageInfo,
  resolveBin,
  getNpmInfo
} from 'lib/utils';

jest.mock('@darkobits/env');
jest.mock('callsites');
jest.mock('read-pkg-up');
jest.mock('resolve-pkg');
jest.mock('get-bin-path');

describe('getPackageInfo', () => {
  const readPkgUpMock = readPkgUp as jest.Mocked<typeof readPkgUp>;
  const pkgName = faker.lorem.word();
  const pkgPath = faker.system.directoryPath();

  beforeEach(() => {
    readPkgUpMock.sync.mockReturnValue({
      packageJson: {
        name: pkgName
      },
      path: path.join(pkgPath, 'package.json')
    });
  });

  it('should return the contents of and path to the nearest package.json', () => {
    const result = getPackageInfo();
    expect(result.json.name).toEqual(pkgName);
    expect(result.rootDir).toEqual(pkgPath);
    expect(readPkgUpMock.sync).toHaveBeenCalled();
  });
});

describe('resolveBin', () => {
  const callsitesMock = callsites as jest.MockedFunction<typeof callsites>;
  const envMock = env as jest.Mocked<typeof env> & jest.MockedFunction<typeof env>;
  const resolvePkgMock = resolvePkg as jest.MockedFunction<typeof resolvePkg>;
  const getBinPathSyncMock = getBinPathSync as jest.MockedFunction<typeof getBinPathSync>;

  const ourFileName = faker.system.filePath();
  const ourDirname = path.dirname(ourFileName);
  const pkgName = faker.lorem.word();
  const binName = faker.lorem.word();
  const pkgPath = faker.system.filePath();
  const binPath = faker.system.filePath();

  describe('in ESM environments', () => {
    beforeEach(() => {
      // Ensure our check for NODE_ENV === 'test' returns true to force the
      // use of the callsites-based path.
      envMock.eq.mockImplementation((variableName: string) => variableName === 'NODE_ENV');

      callsitesMock.mockReturnValue([{
        getFileName: () => ourFileName
      } as any]);

      resolvePkgMock.mockReturnValue(pkgPath);
      getBinPathSyncMock.mockReturnValue(binPath);
    });

    describe('when the binary and package name match', () => {
      it('should return the path to the binary', () => {
        const result = resolveBin(pkgName);
        expect(result.binPath).toBe(binPath);
        expect(result.pkgPath).toBe(pkgPath);
        expect(resolvePkg).toHaveBeenCalledWith(pkgName, { cwd: ourDirname });
        expect(getBinPathSyncMock).toHaveBeenCalledWith({ cwd: pkgPath, name: pkgName });
      });
    });

    describe('when the binary and package name differ', () => {
      it('should return the path to the binary', () => {
        const result = resolveBin(pkgName, binName);
        expect(result.binPath).toBe(binPath);
        expect(result.pkgPath).toBe(pkgPath);
        expect(resolvePkg).toHaveBeenCalledWith(pkgName, { cwd: ourDirname });
        expect(getBinPathSync).toHaveBeenCalledWith({ cwd: pkgPath, name: binName });
      });
    });
  });

  describe('in non-ESM environments', () => {
    beforeEach(() => {
      // Ensure our check for NODE_ENV === 'test' returns false to force the
      // use of __dirname / __filename fallbacks.
      envMock.eq.mockImplementation((variableName: string) => variableName !== 'NODE_ENV');
      resolvePkgMock.mockReturnValue(pkgPath);
      getBinPathSyncMock.mockReturnValue(binPath);
    });

    describe('when the binary and package name match', () => {
      it('should return the path to the binary', () => {
        const result = resolveBin(pkgName);
        expect(result.binPath).toBe(binPath);
        expect(result.pkgPath).toBe(pkgPath);
        expect(resolvePkgMock).toHaveBeenCalledWith(pkgName, { cwd: __dirname });
        expect(getBinPathSyncMock).toHaveBeenCalledWith({ cwd: pkgPath, name: pkgName });
      });
    });

    describe('when the binary and package name differ', () => {
      it('should return the path to the binary', () => {
        const result = resolveBin(pkgName, binName);
        expect(result.binPath).toBe(binPath);
        expect(result.pkgPath).toBe(pkgPath);
        expect(resolvePkgMock).toHaveBeenCalledWith(pkgName, { cwd: __dirname });
        expect(getBinPathSync).toHaveBeenCalledWith({ cwd: pkgPath, name: binName });
      });
    });
  });
});

describe('getNpmInfo', () => {
  const envMock = env as jest.Mocked<typeof env> & jest.MockedFunction<typeof env>;

  describe('when called during an "npm install" command', () => {
    beforeEach(() => {
      envMock.mockImplementation((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['install'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });
    });

    it('should report accurate info', () => {
      const result = getNpmInfo();
      expect(result.command).toBe('install');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(true);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('when called during an "npm ci" command', () => {
    beforeEach(() => {
      envMock.mockImplementation((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['ci'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });
    });

    it('should report accurate info', () => {
      const result = getNpmInfo();
      expect(result.command).toBe('ci');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(true);
      expect(envMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('when called during any other command', () => {
    beforeEach(() => {
      envMock.mockImplementation((arg: string) => {
        switch (arg) {
          case 'npm_config_argv':
            return { original: ['audit'] };
          case 'npm_lifecycle_event':
            return 'npm_lifecycle_event';
          case 'npm_lifecycle_script':
            return 'npm_lifecycle_script';
        }
      });
    });

    it('should report accurate info', () => {
      const result = getNpmInfo();
      expect(result.command).toBe('audit');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(3);
    });
  });
});
