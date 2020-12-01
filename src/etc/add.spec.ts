import log from 'lib/log';

// Here to make sure our Jest configuration hasn't been inadvertently broken.
describe('add', () => {
  it('should add two numbers', () => {
    log.info('foo');
    expect(2 + 2).toEqual(4);
  });
});
