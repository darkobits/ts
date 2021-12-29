/**
 * This is a runtime utility and has been factored-out into its own module to
 * avoid dependency bloat in consumers.
 */


/**
 * Injects a <script> tag with the provided URL into the document and returns a
 * Promise that resolves when the script has finished loading.
 */
export async function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', err => reject(err));
    document.head.append(script);
  });
}
