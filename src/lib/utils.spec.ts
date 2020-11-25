import readPkgUp from 'read-pkg-up';
import resolvePkg from 'resolve-pkg';
import {
  requireBin,
  getUserScripts
} from 'lib/utils';


jest.mock('resolve-pkg', () => {
  return jest.fn(pkgName => {
    if (pkgName === 'pkg-with-named-bin') {
      return '/path/to/pkg-with-named-bin';
    }

    if (pkgName === 'pkg-with-no-bin') {
      return '/path/to/pkg-with-no-bin';
    }

    if (pkgName === 'non-existent-pkg') {
      return false;
    }

    throw new Error(`[mock] Unknown package name: ${pkgName}`);
  });
});


jest.mock('read-pkg-up', () => {
  const sync = jest.fn(({ cwd }) => {
    if (cwd === '/path/to/pkg-with-named-bin') {
      return {
        packageJson: {
          bin: {
            'pkg-with-named-bin': '/path/to/pkg-with-named-bin/bin'
          }
        },
        path: '/path/to/pkg-with-named-bin'
      };
    }

    if (cwd === '/path/to/pkg-with-no-bin') {
      return {
        packageJson: {},
        path: '/path/to/pkg-with-no-bin'
      };
    }

    if (cwd === '/path/to/non-existent-pkg') {
      return false;
    }

    throw new Error(`Unknown cwd: ${cwd}`);
  });

  return {
    sync
  };
});


describe('requireBin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the package defines binaries', () => {
    it('should attempt to require the indicated binary', () => {
      expect.assertions(3);

      try {
        requireBin('pkg-with-named-bin');
      } catch (err) {
        expect(err.message).toMatch('Cannot find module');
        // @ts-expect-error
        expect(resolvePkg.mock.calls[0][0]).toBe('pkg-with-named-bin');
        // @ts-expect-error
        expect(readPkgUp.sync.mock.calls[0][0]).toMatchObject({cwd: '/path/to/pkg-with-named-bin'});
      }
    });
  });

  describe('when the package does not define binaries', () => {
    it('should throw an error', () => {
      expect.assertions(3);

      try {
        requireBin('pkg-with-no-bin');
      } catch (err) {
        expect(err.message).toMatch('"pkg-with-no-bin" does not export any binaries');
        // @ts-expect-error
        expect(resolvePkg.mock.calls[0][0]).toBe('pkg-with-no-bin');
        // @ts-expect-error
        expect(readPkgUp.sync.mock.calls[0][0]).toMatchObject({cwd: '/path/to/pkg-with-no-bin'});
      }
    });
  });

  describe('when the package does not exist', () => {
    it('should throw an error', async () => {
      expect.assertions(3);

      try {
        requireBin('non-existent-pkg');
      } catch (err) {
        expect(err.message).toMatch('Unable to resolve path to package "non-existent-pkg"');
        // @ts-expect-error
        expect(resolvePkg.mock.calls[0][0]).toBe('non-existent-pkg');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(readPkgUp.sync).not.toHaveBeenCalled();
      }
    });
  });

  describe('when the indicated binary does not exist', () => {
    it('should throw an error', () => {
      expect.assertions(3);

      try {
        requireBin('pkg-with-named-bin', 'bad-bin-name');
      } catch (err) {
        expect(err.message).toMatch('"pkg-with-named-bin" does not export a binary named "bad-bin-name"');
        // @ts-expect-error
        expect(resolvePkg.mock.calls[0][0]).toBe('pkg-with-named-bin');
        // @ts-expect-error
        expect(readPkgUp.sync.mock.calls[0][0]).toMatchObject({cwd: '/path/to/pkg-with-named-bin'});
      }
    });
  });
});


describe('getUserScripts', () => {
  const userScripts = {scripts: {}};

  describe('when provided a function', () => {
    it('should invoke the function and return the result', () => {
      const configFactory = () => userScripts;
      expect(getUserScripts(configFactory)).toEqual(userScripts);
    });
  });

  describe('when provided an object', () => {
    it('should return the object', () => {
      expect(getUserScripts(userScripts)).toEqual(userScripts);
    });
  });

  describe('when provided no argument', () => {
    it('should return a configuration scaffold', () => {
      expect(getUserScripts()).toMatchObject({scripts: {}});
    });
  });
});
