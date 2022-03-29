// import path from 'path';

import env from '@darkobits/env';
// import faker from '@faker-js/faker';
// import readPkgUp from 'read-pkg-up';

import { getNpmInfo } from 'lib/utils';

jest.mock('@darkobits/env');
jest.mock('@darkobits/fd-name');
jest.mock('read-pkg-up');

// Note: This function cannot be tested at this time because it uses a dynamic
// import statement to load 'read-pkg-up', and troubleshooting Jest on this
// issue is not worth the effort. Re-visit when Jest's ESM support improves.
// describe.skip('getPackageInfo', () => {
//   const readPkgUpMock = readPkgUp as jest.Mocked<typeof readPkgUp>;
//   const pkgName = faker.lorem.word();
//   const pkgPath = faker.system.directoryPath();

//   beforeEach(() => {
//     readPkgUpMock.sync.mockReturnValue({
//       packageJson: {
//         name: pkgName
//       },
//       path: path.join(pkgPath, 'package.json')
//     });
//   });

//   it('should return the contents of the nearest package.json', () => {
//     const result = getPackageInfo();
//     expect(result.json.name).toEqual(pkgName);
//     expect(result.rootDir).toEqual(pkgPath);
//     expect(readPkgUpMock.sync).toHaveBeenCalled();
//   });
// });

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
