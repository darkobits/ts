import { describe, it, expect } from 'vitest';

import log from 'lib/log';

// This tests that Vitest works with our configured path mappings.
describe('Vitest', () => {
  it('should initialize and run test files.', () => {
    expect(log).toHaveProperty('info');
    expect(true).toEqual(true);
  });
});
