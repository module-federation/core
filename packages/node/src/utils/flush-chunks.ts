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
    return __non_webpack_require__('../federated-stats.json');
  } catch (e) {
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
      // Get the loaded modules for the current key
      // @ts-ignore
      const loadedModules = Object.values(__webpack_share_scopes__.default[key])
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
  try {
    // Create a set to store the chunks
    const chunks = new Set();

    // Split the chunk string into remote and request
    const [remote, request] = chunk.split('->');
    const knownRemotes = getAllKnownRemotes();

    // If the remote is not defined in the global config, return
    //@ts-ignore
    if (!knownRemotes[remote]) {
      console.error(
        `flush chunks:`,
        `Remote ${remote} is not defined in the global config`,
      );
      return;
    }

    try {
      // Extract the remote name from the URL
      //@ts-ignore
      const remoteName = new URL(
        //@ts-ignore
        globalThis.__remote_scope__._config[remote],
      ).pathname
        .split('/')
        .pop();

      // Construct the stats file URL from the remote config
      //@ts-ignore
      const statsFile = globalThis.__remote_scope__._config[remote]
        .replace(remoteName, 'federated-stats.json')
        .replace('ssr', 'chunks');

      let stats = {};
      try {
        // Fetch the remote config and stats file
        stats = await fetch(statsFile).then((res) => res.json());
      } catch (e) {
        console.error('flush error', e);
      }

      // Add the main chunk to the chunks set
      //TODO: ensure host doesnt embed its own remote in ssr, this causes crash
      // chunks.add(
      //   global.__remote_scope__._config[remote].replace('ssr', 'chunks')
      // );

      // Extract the prefix from the remote config
      const [prefix] =
        //@ts-ignore
        globalThis.__remote_scope__._config[remote].split('static/');

      // Process federated modules from the stats object
      // @ts-ignore
      if (stats.federatedModules) {
        // @ts-ignore
        stats.federatedModules.forEach((modules) => {
          // Process exposed modules
          if (modules.exposes?.[request]) {
            // @ts-ignore
            modules.exposes[request].forEach((chunk) => {
              chunks.add([prefix, chunk].join(''));

              //TODO: reimplement this
              Object.values(chunk).forEach((chunk) => {
                // Add files to the chunks set
                // @ts-ignore
                if (chunk.files) {
                  // @ts-ignore
                  chunk.files.forEach((file) => {
                    chunks.add(prefix + file);
                  });
                }
                // Process required modules
                // @ts-ignore
                if (chunk.requiredModules) {
                  // @ts-ignore
                  chunk.requiredModules.forEach((module) => {
                    // Check if the module is in the shareMap
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

      // Return the array of chunks
      return Array.from(chunks);
    } catch (e) {
      console.error('flush error:', e);
    }
  } catch (e) {
    // catch just in case
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
