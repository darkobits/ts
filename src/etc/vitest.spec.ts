import {
  describe,
  it,
  expect
} from 'vitest';

// This tests that Vitest works with our configured path mappings.
import log from 'lib/log';


describe('Vitest', () => {
  it('should initialize and run test files.', () => {
    expect(log).toHaveProperty('info');
    expect(true).toEqual(true);
  });
});
