/**
 * Options object accepted by `loadFont`.
 */
export interface LoadFontOptions extends Omit<FontFaceDescriptors, 'weight'> {
  url: string;
  family: string;
  weight?: number;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}


/**
 * Asynchronously loads a remote font and adds it to the document's font list.
 */
export async function loadFont(opts: LoadFontOptions) {
  const { url, family, weight, ...rest } = opts;

  const formatMap: Record<string, string> = {
    woff: 'woff',
    woff2: 'woff2',
    ttf: 'truetype',
    otf: 'opentype'
  };

  const extension = url.split('.').pop();

  const format = extension ? formatMap[extension] : undefined;

  const urlValue = format
    ? `url(${url}) format('${format}')`
    : `url(${url})`;

  const font = new FontFace(family, urlValue, {
    ...rest,
    weight: String(weight)
  } as Required<FontFaceDescriptors>);

  document.fonts.add(await font.load());
}
