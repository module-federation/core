/* eslint-disable no-undef */

// @ts-ignore
let usedChunks;
if (!globalThis.usedChunks) {
  // @ts-ignore
  usedChunks = new Set();
  //@ts-ignore
  globalThis.usedChunks = usedChunks;
}
/**
 * Initialize usedChunks and share it globally.
 * @type {Set}
 */
// @ts-ignore
export const getUsedChunks = () => usedChunks;
/**
 * Load hostStats from the JSON file.
 * @returns {object} hostStats - An object containing host stats data.
 */
export const loadHostStats = (requireFunc = __non_webpack_require__) => {
  try {
    return requireFunc('../federated-stats.json');
  } catch (e) {
    return {};
  }
};

/**
 * Create a shareMap based on the loaded modules.
 * @returns {object} shareMap - An object containing the shareMap data.
 */
export const createShareMap = (webpackShareScopes = __webpack_share_scopes__) => {
  // Check if webpackShareScopes is defined and has a default property
  // @ts-ignore
  if (webpackShareScopes?.default) {
    // Reduce the keys of the default property to create the share map
    // @ts-ignore
    return Object.keys(webpackShareScopes.default).reduce((acc, key) => {
      // Get the loaded modules for the current key
      // @ts-ignore
      const loadedModules = Object.values(webpackShareScopes.default[key])
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
  // If webpackShareScopes is not defined or doesn't have a default property, return an empty object
  return {};
};

/**
 * Process a single chunk and return an array of updated chunks.
 * @param {string} chunk - A chunk string containing remote and request data.
 * @param {object} shareMap - An object containing the shareMap data.
 * @param {object} hostStats - An object containing host stats data.
 * @returns {Promise<Array>} A promise that resolves to an array of updated chunks.
 */
//@ts-ignore
export const processChunk = async (chunk, shareMap, hostStats, fetchFunc = fetch, remoteScopeConfig = globalThis.__remote_scope__._config) => {
  // Create a set to store the chunks
  const chunks = new Set();

  // Split the chunk string into remote and request
  const [remote, request] = chunk.split('->');

  // If the remote is not defined in the global config, return
  if (!remoteScopeConfig[remote]) {
    console.error(
      `flush chunks:`,
      `Remote ${remote} is not defined in the global config`
    );
    return;
  }

  try {
    // Extract the remote name from the URL
    //@ts-ignore
    const remoteName = new URL(
      remoteScopeConfig[remote]
    ).pathname
      .split('/')
      .pop();

    // Construct the stats file URL from the remote config
    const statsFile = remoteScopeConfig[remote]
      .replace(remoteName, 'federated-stats.json')
      .replace('ssr', 'chunks');

    let stats = {};
    try {
      // Fetch the remote config and stats file
      stats = await fetchFunc(statsFile).then((res) => res.json());
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
      remoteScopeConfig[remote].split('static/');

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
};

/**
 * Flush the chunks and return a deduplicated array of chunks.
 * @returns {Promise<Array>} A promise that resolves to an array of deduplicated chunks.
 */
export const flushChunks = async (loadHostStatsFunc = loadHostStats, createShareMapFunc = createShareMap, processChunkFunc = processChunk) => {
  const hostStats = loadHostStatsFunc();
  const shareMap = createShareMapFunc();

  const allFlushed = await Promise.all(
    Array.from(getUsedChunks()).map(async (chunk) =>
      processChunkFunc(chunk, shareMap, hostStats)
    )
  );

  // Deduplicate the chunks array
  const dedupe = Array.from(new Set([...allFlushed.flat()]));

  // Clear usedChunks
  getUsedChunks().clear();
  // Filter out any undefined or null values
  return dedupe.filter(Boolean);
};

