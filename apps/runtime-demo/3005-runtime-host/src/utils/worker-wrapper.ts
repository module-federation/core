// eslint-disable-next-line camelcase
declare let __webpack_public_path__: string;

// Wrapper that creates a small loader Blob to establish a stable publicPath
// and then imports the actual worker script via importScripts. This mirrors
// patterns used by custom worker loaders to avoid blob:// publicPath issues.
export class WorkerWrapper extends Worker {
  constructor(url: string | URL, options?: WorkerOptions) {
    const objectURL = generateWorkerLoader(url);
    super(objectURL, options);
    URL.revokeObjectURL(objectURL);
  }
}

export function generateWorkerLoader(url: string | URL): string {
  // eslint-disable-next-line camelcase
  const publicPath = typeof __webpack_public_path__ !== 'undefined' ? __webpack_public_path__ : '/';
  const workerPublicPath = /^(?:https?:)?\/\//.test(publicPath)
    ? publicPath
    : new URL(publicPath, window.location.origin).toString();

  const source = [
    // Expose a conventional variable the worker entry can optionally read
    `self.__PUBLIC_PATH__ = ${JSON.stringify(workerPublicPath)}`,
    // Load the actual worker bundle from a network URL so webpack's 'auto' publicPath works
    `importScripts(${JSON.stringify(url.toString())});`,
  ].join('\n');

  return URL.createObjectURL(
    new Blob([source], { type: 'application/javascript' }),
  );
}


