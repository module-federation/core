//@ts-nocheck
export async function fileSystemRunInContextStrategy(
  chunkId: string,
  rootOutputDir: string,
  remotes: Remotes,
  callback: CallbackFunction,
) {
  const fs = require('fs');
  const path = require('path');
  const vm = require('vm');
  const filename = path.join(
    __dirname,
    rootOutputDir + __webpack_require__.u(chunkId),
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
        )(chunk, require, path.dirname(filename), filename);
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
  let url;
  try {
    url = new URL(chunkName, __webpack_require__.p);
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
    )(chunk, require, urlDirname, chunkName);
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
  const http = require('http') as typeof import('http');
  const https = require('https') as typeof import('https');
  const vm = require('vm') as typeof import('vm');
  const path = require('path') as typeof import('path');
  let url: URL;
  const globalThisVal = new Function('return globalThis')();

  try {
    url = new URL(chunkName, __webpack_require__.p);
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
  protocol.get(url.href, (res: import('http').IncomingMessage) => {
    let data = '';
    res.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    res.on('end', () => {
      const chunk = {};
      const urlDirname = url.pathname.split('/').slice(0, -1).join('/');

      vm.runInThisContext(
        `(function(exports, require, __dirname, __filename) {${data}\n})`,
        chunkName,
      )(chunk, require, urlDirname, chunkName);
      callback(null, chunk);
    });
    res.on('error', (err) => {
      callback(err, null);
    });
  });
}
