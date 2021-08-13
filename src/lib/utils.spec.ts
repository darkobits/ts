import { getBinPathSync } from 'get-bin-path';
import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';

import {
  getPackageInfo,
  resolveBin,
  getNpmInfo
} from 'lib/utils';

import type env from '@darkobits/env';

const PKG_NAME = '__PKG_NAME__';
const BIN_NAME = '__BIN_NAME__';
const PKG_JSON = '__PKG_JSON__';
const PKG_PATH = '__PKG_PATH__';
const BIN_PATH = '__BIN_PATH__';

jest.mock('read-pkg-up', () => {
  return {
    sync: jest.fn(() => {
      return {
        packageJson: PKG_JSON,
        path: PKG_PATH
      };
    })
  };
});


jest.mock('resolve-pkg', () => {
  return jest.fn(() => PKG_PATH);
});


jest.mock('get-bin-path', () => {
  return {
    getBinPathSync: jest.fn(() => BIN_PATH)
  };
});


describe('getPackageInfo', () => {
  it('should do return the contents of the nearest package.json', () => {
    const result = getPackageInfo();
    expect(result.json).toEqual(PKG_JSON);
    expect(result.rootDir).toEqual('.');
    expect(readPkgUp.sync).toHaveBeenCalled();
  });
});


describe('resolveBin', () => {
  describe('when the binary and package name match', () => {
    it('should return the path to the binary', () => {
      const result = resolveBin(PKG_NAME);
      expect(result.binPath).toBe(BIN_PATH);
      expect(result.pkgPath).toBe(PKG_PATH);
      expect(resolvePkg).toHaveBeenCalledWith(PKG_NAME, { cwd: __dirname });
      expect(getBinPathSync).toHaveBeenCalledWith({ cwd: PKG_PATH, name: PKG_NAME });
    });
  });

  describe('when the binary and package name differ', () => {
    it('should return the path to the binary', () => {
      const result = resolveBin(PKG_NAME, BIN_NAME);
      expect(result.binPath).toBe(BIN_PATH);
      expect(result.pkgPath).toBe(PKG_PATH);
      expect(resolvePkg).toHaveBeenCalledWith(PKG_NAME, { cwd: __dirname });
      expect(getBinPathSync).toHaveBeenCalledWith({ cwd: PKG_PATH, name: BIN_NAME });
    });
  });
});


describe('getNpmInfo', () => {
  describe('when called during an "npm install" command', () => {
    let getNpmInfoMock: typeof getNpmInfo;
    let envMock: typeof env;

    beforeEach(() => {
      jest.resetModules();
      jest.resetAllMocks();

      jest.doMock('@darkobits/env', () => {
        const envModule = jest.fn(arg => {
          switch (arg) {
            case 'npm_config_argv':
              return { original: ['install'] };
            case 'npm_lifecycle_event':
              return 'npm_lifecycle_event';
            case 'npm_lifecycle_script':
              return 'npm_lifecycle_script';
          }
        });

        // @ts-expect-error
        envModule.has = jest.fn();

        return envModule as unknown as typeof env;
      });

      getNpmInfoMock = require('lib/utils').getNpmInfo;
      envMock = require('@darkobits/env');
    });

    it('should report accurate info', () => {
      const result = getNpmInfoMock();
      expect(result.command).toBe('install');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(true);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(5);
    });
  });

  describe('when called during an "npm ci" command', () => {
    let getNpmInfoMock: typeof getNpmInfo;
    let envMock: typeof env;

    beforeEach(() => {
      jest.resetModules();
      jest.resetAllMocks();

      jest.doMock('@darkobits/env', () => {
        const envModule = jest.fn(arg => {
          switch (arg) {
            case 'npm_config_argv':
              return { original: ['ci'] };
            case 'npm_lifecycle_event':
              return 'npm_lifecycle_event';
            case 'npm_lifecycle_script':
              return 'npm_lifecycle_script';
          }
        });

        // @ts-expect-error
        envModule.has = jest.fn();

        return envModule as unknown as typeof env;
      });

      getNpmInfoMock = require('lib/utils').getNpmInfo;
      envMock = require('@darkobits/env');
    });

    it('should report accurate info', () => {
      const result = getNpmInfoMock();
      expect(result.command).toBe('ci');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(true);
      expect(envMock).toHaveBeenCalledTimes(5);
    });
  });

  describe('when called during any other command', () => {
    let getNpmInfoMock: typeof getNpmInfo;
    let envMock: typeof env;

    beforeEach(() => {
      jest.resetModules();
      jest.resetAllMocks();

      jest.doMock('@darkobits/env', () => {
        const envModule = jest.fn(arg => {
          switch (arg) {
            case 'npm_config_argv':
              return { original: ['audit'] };
            case 'npm_lifecycle_event':
              return 'npm_lifecycle_event';
            case 'npm_lifecycle_script':
              return 'npm_lifecycle_script';
          }
        });

        // @ts-expect-error
        envModule.has = jest.fn();

        return envModule as unknown as typeof env;
      });

      getNpmInfoMock = require('lib/utils').getNpmInfo;
      envMock = require('@darkobits/env');
    });

    it('should report accurate info', () => {
      const result = getNpmInfoMock();
      expect(result.command).toBe('audit');
      expect(result.event).toBe('npm_lifecycle_event');
      expect(result.script).toBe('npm_lifecycle_script');
      expect(result.isInstall).toBe(false);
      expect(result.isCi).toBe(false);
      expect(envMock).toHaveBeenCalledTimes(5);
    });
  });
});
