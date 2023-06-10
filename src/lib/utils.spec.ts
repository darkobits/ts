import { describe, it, expect, vi } from 'vitest';


const mockExecSync = vi.fn();

vi.doMock('child_process', () => {
  return {
    execSync: mockExecSync
  };
});


describe('gitDescribe', () => {
  it('should parse results', async () => {
    mockExecSync.mockImplementation(() => 'v1.2.3-15-g7246d34');
    const { gitDescribe } = await import('./utils');
    expect(gitDescribe()).toBe('v1.2.3-7246d34');
  });
});
