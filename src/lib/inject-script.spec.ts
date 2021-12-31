/**
 * @jest-environment jsdom
 */
import { injectScript } from './inject-script';


describe('injectScript', () => {
  it('should add a script tag to the document', async () => {
    const src = 'https://src.foo/';

    const promise = injectScript(src);

    const scriptTag = document.head.querySelector('script');
    if (!scriptTag) throw new Error('No <script> tag found.');

    scriptTag.dispatchEvent(new Event('load'));

    await promise;

    expect(scriptTag.src).toBe(src);
    expect(scriptTag.async).toBe(true);
  });
});
