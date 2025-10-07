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
  const publicPath =
    typeof __webpack_public_path__ !== 'undefined'
      ? __webpack_public_path__
      : '/';
  const workerPublicPath = /^(?:https?:)?\/\//.test(publicPath)
    ? publicPath
    : new URL(publicPath, window.location.origin).toString();

  // Always load the dedicated emitted worker entry at worker.js
  // This ensures a real JS file is fetched (not a dev TS virtual path)
  const resolvedWorkerUrl = new URL('worker.js', workerPublicPath).toString();

  const source = [
    `self.__PUBLIC_PATH__ = ${JSON.stringify(workerPublicPath)}`,
    `importScripts(${JSON.stringify(resolvedWorkerUrl)});`,
  ].join('\n');

  return URL.createObjectURL(
    new Blob([source], { type: 'application/javascript' }),
  );
}
