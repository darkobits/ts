import { loadFont } from './load-font';

const documentMock = {
  fonts: {
    add: jest.fn()
  }
};

class FontFace {
  [index: string]: any;
  family: string;
  url: string;

  constructor(family: string, url: string, opts: any) {
    this.family = family;
    this.url = url;
    Object.entries(opts).forEach(([key, value]) => {
      this[key] = value;
    });
  }

  async load() {
    return this;
  }
}

describe('loadFont', () => {
  beforeEach(() => {
    // @ts-expect-error
    global.FontFace = FontFace;
    // @ts-expect-error
    global.document = documentMock;
  });

  it('should work', async () => {
    const family = 'Comic Sans MS';
    const url = 'comic-sans.ttf';

    await loadFont({ family, url });

    expect(documentMock.fonts.add).toHaveBeenCalledWith({
      family,
      url: `url(${url}) format('truetype')`
    });
  });
});
