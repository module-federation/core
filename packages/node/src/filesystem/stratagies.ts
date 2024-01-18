//@ts-nocheck
// export async function fileSystemRunInContextStrategy(
//   chunkId: string,
//   rootOutputDir: string,
//   remotes: Remotes,
//   callback: CallbackFunction,
// ) {
//   const fs = await import('fs');
//   const path = await import('path');
//   const vm = await import('vm');
//   const filename = path.join(
//     __dirname,
//     rootOutputDir + __webpack_require__.u(chunkId),
//   );
//   if (fs.existsSync(filename)) {
//     fs.readFile(filename, 'utf-8', (err: Error, content: string) => {
//       if (err) {
//         callback(err, null);
//         return;
//       }
//       const chunk = {};
//       try {
//         // vm.runInThisContext(
//         //   '(function(exports, require, __dirname, __filename) {' +
//         //     content +
//         //     '\n})',
//         //   filename,
//         // )(chunk, require, path.dirname(filename), filename);

//          const mod = new vm.SourceTextModule(content,
//           {
//                   // @ts-ignore
//                   importModuleDynamically: async (specifier) => {
//                       const mod = await import(/* webpackIgnore */ specifier)
//                       const exports = Object.keys(mod)
//                       const module = new vm.SyntheticModule(exports, function() {
//                           for (const k of exports) {
//                               this.setExport(k, mod[k])
//                           }
//                       });
//                         // @ts-ignore
//                         await module.link(()=>{});
//                         await module.evaluate();
//                         return module;
//                   },

//                   initializeImportMeta: (meta, module)=>{
//                       // @ts-ignore
//                       meta.url = import.meta.url
//                   }
//               }
//           )

//           await mod.link(async (specifier, parent) => {
//               const mod = await import(specifier)
//               const exports = Object.keys(mod)
//               return new vm.SyntheticModule(exports, function () {
//                   for (const k of exports) {
//                       this.setExport(k, mod[k])
//                   }
//               })

//           })

//           await mod.evaluate()
//           chunk = mod.namespace

//         callback(null, chunk);
//       } catch (e) {
//         console.log("'runInThisContext threw'", e);
//         callback(e as Error, null);
//       }
//     });
//   } else {
//     const err = new Error(`File ${filename} does not exist`);
//     callback(err, null);
//   }
// }

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

export const NODE_ESM_httpEvalStrategyString = `
async function httpEvalStrategy(
  chunkName,
  remoteName,
  remotes,
  callback,
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
  let chunk = {};
  try {
    const urlDirname = url.pathname.split('/').slice(0, -1).join('/');
    ${modExecuteString('data')}
      chunk = mod.namespace
    
    callback(null, chunk);
  } catch (e) {
    callback(e, null);
  }
}



`;

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

export const NODE_ESM_httpVmStrategy = `
async function httpVmStrategy(
  chunkName,
  remoteName,
  remotes,
  callback,
){
  const http = await import('http') ;
  const https = await import('https');
  const vm = await import('vm');
  const path = await import('path');
  let url;
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
      (instance) => {
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
  protocol.get(url.href, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk.toString();
    });
    res.on('end', () => {
      // The offerings are still cjs bundle it seems
      const chunk = {};
      const urlDirname = url.pathname.split('/').slice(0, -1).join('/');

      vm.runInThisContext(
        \`(function(exports, require, __dirname, __filename) {\${data}\n})\`,
        chunkName,
      )(chunk, __WEBPACK_EXTERNAL_createRequire(import.meta.url), urlDirname, chunkName);
      callback(null, chunk);
    });
    res.on('error', (err) => {
      callback(err, null);
    });
  });
}
`;

function modExecuteString(data) {
  return `
const mod = new vm.SourceTextModule(${data},
  { 
          // @ts-ignore
          importModuleDynamically: async (specifier) => {
              const mod = importModule(specifier) //await import(/* webpackIgnore: true */specifier)
              const exports = Object.keys(mod)
              const module = new vm.SyntheticModule(exports, function() {
                  for (const k of exports) {
                      this.setExport(k, mod[k])
                  }
              });
                // @ts-ignore
                await module.link(()=>{});
                await module.evaluate();
                return module;
          },
          
          initializeImportMeta: (meta, module)=>{
              // @ts-ignore
              meta.url = import.meta.url 
          }
      }
  )
  
  await mod.link(async (specifier, parent) => {
      const mod = await import(/* webpackIgnore: true */ specifier)
      const exports = Object.keys(mod)
      return new vm.SyntheticModule(exports, function () {
          for (const k of exports) {
              this.setExport(k, mod[k])
          }
      })
  
  })
  
  await mod.evaluate()

`;
}
