/* eslint-disable no-undef */

// @ts-ignore
if (!globalThis.usedChunks) {
  // @ts-ignore
  globalThis.usedChunks = new Set();
}
/**
 * Initialize usedChunks and share it globally.
 * @type {Set}
 */
// @ts-ignore
export const { usedChunks } = globalThis;
/**
 * Load hostStats from the JSON file.
 * @returns {object} hostStats - An object containing host stats data.
 */
const loadHostStats = () => {
  try {
    //@ts-ignore
    const statsPath = '../federated-stats.json';
    //@ts-ignore
    const fsModule = __non_webpack_require__('fs') as typeof import('fs');
    //@ts-ignore
    const pathModule = __non_webpack_require__('path') as typeof import('path');
    const absoluteStatsPath = pathModule.join(
      __dirname,
      '../federated-stats.json',
    );
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-run1',
        hypothesisId: 'H2',
        location: 'packages/node/src/utils/flush-chunks.ts:loadHostStats',
        message: 'attempting runtime stats load',
        data: {
          dirname: __dirname,
          statsPath,
          absoluteStatsPath,
          statsExists: fsModule.existsSync(absoluteStatsPath),
          hasNonWebpackRequire: typeof __non_webpack_require__ === 'function',
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    //@ts-ignore
    return __non_webpack_require__(absoluteStatsPath);
  } catch (e: any) {
    try {
      //@ts-ignore
      const fsModule = __non_webpack_require__('fs') as typeof import('fs');
      //@ts-ignore
      const pathModule = __non_webpack_require__(
        'path',
      ) as typeof import('path');
      const absoluteStatsPath = pathModule.join(
        __dirname,
        '../federated-stats.json',
      );
      if (fsModule.existsSync(absoluteStatsPath)) {
        const raw = fsModule.readFileSync(absoluteStatsPath, 'utf-8');
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'nested-webpack-postfix1',
              hypothesisId: 'H2',
              location: 'packages/node/src/utils/flush-chunks.ts:loadHostStats',
              message: 'fallback loaded stats via fs.readFileSync',
              data: { absoluteStatsPath, rawLength: raw.length },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
        return JSON.parse(raw);
      }
    } catch {
      // fallback to empty below
    }
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-postfix1',
        hypothesisId: 'H2',
        location: 'packages/node/src/utils/flush-chunks.ts:loadHostStats',
        message: 'runtime stats load failed',
        data: { errorMessage: e?.message || String(e) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return {};
  }
};

export const getAllKnownRemotes = function () {
  // Attempt to access the global federation controller safely
  const federationController = new Function('return globalThis')()
    .__FEDERATION__;
  if (!federationController || !federationController.__INSTANCES__) {
    // If the federation controller or instances are not defined, return an empty object
    return {};
  }

  var collected = {};
  // Use a for...of loop to iterate over all federation instances
  for (const instance of federationController.__INSTANCES__) {
    // Use another for...of loop to iterate over the module cache Map entries
    for (const [key, cacheModule] of instance.moduleCache) {
      // Check if the cacheModule has remoteInfo and use it to collect remote names
      if (cacheModule.remoteInfo) {
        //@ts-ignore
        collected[cacheModule.remoteInfo.name] = cacheModule.remoteInfo;
      }
    }
  }
  return collected;
};

/**
 * Create a shareMap based on the loaded modules.
 * @returns {object} shareMap - An object containing the shareMap data.
 */
const createShareMap = () => {
  // Check if __webpack_share_scopes__ is defined and has a default property
  // @ts-ignore
  if (__webpack_share_scopes__?.default) {
    // Reduce the keys of the default property to create the share map
    // @ts-ignore
    return Object.keys(__webpack_share_scopes__.default).reduce((acc, key) => {
      // @ts-ignore
      const shareMap = __webpack_share_scopes__.default[key];
      // shareScope may equal undefined or null if it has unexpected value
      if (!shareMap || typeof shareMap !== 'object') {
        return acc;
      }
      // Get the loaded modules for the current key
      const loadedModules = Object.values(shareMap)
        // Filter out the modules that are not loaded
        // @ts-ignore
        .filter((sharedModule) => sharedModule.loaded)
        // Map the filtered modules to their 'from' properties
        // @ts-ignore
        .map((sharedModule) => sharedModule.from);

      // If there are any loaded modules, add them to the accumulator object
      if (loadedModules.length > 0) {
        // @ts-ignore
        acc[key] = loadedModules;
      }
      // Return the accumulator object for the next iteration
      return acc;
    }, {});
  }
  // If __webpack_share_scopes__ is not defined or doesn't have a default property, return an empty object
  return {};
};

/**
 * Process a single chunk and return an array of updated chunks.
 * @param {string} chunk - A chunk string containing remote and request data.
 * @param {object} shareMap - An object containing the shareMap data.
 * @param {object} hostStats - An object containing host stats data.
 * @returns {Promise<Array>} A promise that resolves to an array of updated chunks.
 */
// @ts-ignore
const processChunk = async (chunk, shareMap, hostStats) => {
  const chunks = new Set();
  const [remote, req] = chunk.split('/');
  const request = './' + req;
  const knownRemotes = getAllKnownRemotes();
  //@ts-ignore
  if (!knownRemotes[remote]) {
    console.error(
      `flush chunks: Remote ${remote} is not defined in the global config`,
    );
    return;
  }

  try {
    //@ts-ignore
    const remoteName = new URL(knownRemotes[remote].entry).pathname
      .split('/')
      .pop();
    //@ts-ignore

    const statsFile = knownRemotes[remote].entry
      .replace(remoteName, 'federated-stats.json')
      .replace('ssr', 'chunks');
    // #region agent log
    const remoteEntryUrl = (knownRemotes as Record<string, { entry: string }>)[
      remote
    ]?.entry;
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-run1',
        hypothesisId: 'H4',
        location: 'packages/node/src/utils/flush-chunks.ts:processChunk',
        message: 'computed federated stats URL',
        data: { remote, request, remoteEntry: remoteEntryUrl, statsFile },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    let stats = {};

    try {
      stats = await fetch(statsFile).then((res) => res.json());
    } catch (e) {
      console.error('flush error', e);
    }
    //@ts-ignore

    const [prefix] = knownRemotes[remote].entry.split('static/');
    //@ts-ignore

    if (stats.federatedModules) {
      //@ts-ignore

      stats.federatedModules.forEach((modules) => {
        if (modules.exposes?.[request]) {
          //@ts-ignore

          modules.exposes[request].forEach((chunk) => {
            chunks.add([prefix, chunk].join(''));

            Object.values(chunk).forEach((chunk) => {
              //@ts-ignore

              if (chunk.files) {
                //@ts-ignore

                chunk.files.forEach((file) => {
                  chunks.add(prefix + file);
                });
              }
              //@ts-ignore

              if (chunk.requiredModules) {
                //@ts-ignore

                chunk.requiredModules.forEach((module) => {
                  if (shareMap[module]) {
                    // If the module is from the host, log the host stats
                  }
                });
              }
            });
          });
        }
      });
    }

    return Array.from(chunks);
  } catch (e) {
    console.error('flush error:', e);
  }
};

/**
 * Flush the chunks and return a deduplicated array of chunks.
 * @returns {Promise<Array>} A promise that resolves to an array of deduplicated chunks.
 */
export const flushChunks = async () => {
  const hostStats = loadHostStats();
  const shareMap = createShareMap();

  const allFlushed = await Promise.all(
    Array.from(usedChunks).map(async (chunk) =>
      processChunk(chunk, shareMap, hostStats),
    ),
  );

  // Deduplicate the chunks array
  const dedupe = Array.from(new Set([...allFlushed.flat()]));

  // Clear usedChunks
  usedChunks.clear();
  // Filter out any undefined or null values
  return dedupe.filter(Boolean);
};
