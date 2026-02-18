const requireFn: NodeRequire = (() => {
  if (process.env['IS_ESM_BUILD'] === 'true') {
    const { createRequire } =
      require('node:module') as typeof import('node:module');
    return createRequire(import.meta.url);
  } else {
    return (0, eval)('require') as NodeRequire;
  }
})();

export async function fileSystemRunInContextStrategy(
  chunkId: string,
  rootOutputDir: string,
  remotes: Remotes,
  callback: CallbackFunction,
) {
  const { getWebpackRequireOrThrow } = requireFn(
    '@module-federation/sdk/bundler',
  );
  const webpackRequire = getWebpackRequireOrThrow() as any;
  const fs = requireFn('fs');
  const path = requireFn('path');
  const vm = requireFn('vm');
  const filename = path.join(
    __dirname,
    rootOutputDir + webpackRequire.u(chunkId),
  );
  if (fs.existsSync(filename)) {
    fs.readFile(filename, 'utf-8', (err: Error, content: string) => {
      if (err) {
        callback(err, null);
        return;
      }
      const chunk = {};
      try {
        vm.runInThisContext(
          '(function(exports, require, __dirname, __filename) {' +
            content +
            '\n})',
          filename,
        )(chunk, requireFn, path.dirname(filename), filename);
        callback(null, chunk);
      } catch (e) {
        console.log("'runInThisContext threw'", e);
        callback(e as Error, null);
      }
    });
  } else {
    const err = new Error(`File ${filename} does not exist`);
    callback(err, null);
  }
}

// HttpEvalStrategy
export async function httpEvalStrategy(
  chunkName: string,
  remoteName: string,
  remotes: Remotes,
  callback: CallbackFunction,
) {
  const { getWebpackRequireOrThrow } = requireFn(
    '@module-federation/sdk/bundler',
  );
  const webpackRequire = getWebpackRequireOrThrow() as any;
  let url;
  try {
    url = new URL(chunkName, webpackRequire.p);
  } catch (e) {
    console.error(
      'module-federation: failed to construct absolute chunk path of',
      remoteName,
      'for',
      chunkName,
      // e,
    );
    url = new URL(remotes[remoteName]);
    const getBasenameFromUrl = (url) => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    };
    const fileToReplace = getBasenameFromUrl(url.pathname);
    url.pathname = url.pathname.replace(fileToReplace, chunkName);
  }

  const data = await fetch(url).then((res) => res.text());
  const chunk = {};
  try {
    const urlDirname = url.pathname.split('/').slice(0, -1).join('/');

    eval(
      '(function(exports, require, __dirname, __filename) {' + data + '\n})',
    )(chunk, requireFn, urlDirname, chunkName);
    callback(null, chunk);
  } catch (e: any) {
    callback(e, null);
  }
}
// Define the type for the remote servers object
interface Remotes {
  [key: string]: {
    entry: string;
  };
}

// Define the type for the callback function
type CallbackFunction = (error: Error | null, chunk?: any) => void;

/**
 * HttpVmStrategy
 * This function is used to execute a chunk of code in a VM using HTTP or HTTPS based on the protocol.
 * @param {string} chunkName - The name of the chunk to be executed.
 * @param {string} remoteName - The name of the remote server.
 * @param {Remotes} remotes - An object containing the remote servers.
 * @param {CallbackFunction} callback - A callback function to be executed after the chunk is executed.
 */
export async function httpVmStrategy(
  chunkName: string,
  remoteName: string,
  remotes: Remotes,
  callback: CallbackFunction,
): Promise<void> {
  const { getWebpackRequireOrThrow } = requireFn(
    '@module-federation/sdk/bundler',
  );
  const webpackRequire = getWebpackRequireOrThrow() as any;
  const http = requireFn('http') as typeof import('http');
  const https = requireFn('https') as typeof import('https');
  const vm = requireFn('vm') as typeof import('vm');
  const path = requireFn('path') as typeof import('path');
  let url: URL;
  const globalThisVal = new Function('return globalThis')();

  try {
    url = new URL(chunkName, webpackRequire.p);
  } catch (e) {
    console.error(
      'module-federation: failed to construct absolute chunk path of',
      remoteName,
      'for',
      chunkName,
      // e,
    );
    // search all instances to see if any have the remote
    const container = globalThisVal['__FEDERATION__']['__INSTANCES__'].find(
      (instance: any) => {
        if (!instance) return;
        if (!instance.moduleCache.has(remoteName)) return;
        const container = instance.moduleCache.get(remoteName);
        if (!container.remoteInfo) return;
        return container.remoteInfo.entry;
      },
    );

    if (!container) {
      throw new Error('Container not found');
    }

    url = new URL(container.moduleCache.get(remoteName).remoteInfo.entry);
    const fileToReplace = path.basename(url.pathname);
    url.pathname = url.pathname.replace(fileToReplace, chunkName);
  }
  const protocol = url.protocol === 'https:' ? https : http;
  const req = protocol.get(url.href, (res: import('http').IncomingMessage) => {
    let data = '';
    res.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    res.on('end', () => {
      const chunk = {};
      const urlDirname = url.pathname.split('/').slice(0, -1).join('/');
      try {
        vm.runInThisContext(
          `(function(exports, require, __dirname, __filename) {${data}\n})`,
          chunkName,
        )(chunk, requireFn, urlDirname, chunkName);
        callback(null, chunk);
      } catch (err) {
        callback(err, null);
      }
    });
    res.on('error', (err) => {
      callback(err, null);
    });
  });
  req.on('error', (err) => callback(err, null));
}
