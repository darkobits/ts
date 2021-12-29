import { injectScript } from './inject-script';

const headMock: Array<any> = [];

const documentMock = {
  head: {
    append: (value: any) => headMock.push(value)
  },
  createElement: jest.fn(() => {
    const el = {
      addEventListener: jest.fn((name: string, cb: any) => {
        if (name === 'load' && typeof cb === 'function') {
          cb();
        }
      })
    };

    return el;
  })
};

describe('injectScript', () => {
  beforeEach(() => {
    // @ts-expect-error
    global.document = documentMock;
  });

  it('should add a script tag to the document', async () => {
    const src = 'src';
    await injectScript(src);
    const script = headMock[0];
    expect(documentMock.createElement).toHaveBeenCalled();
    expect(script.addEventListener).toHaveBeenCalledTimes(2);
    expect(script.src).toBe(src);
  });
});
