const PLUGIN_NAME = 'FederationStatsPlugin';

/** @typedef {import("./webpack-stats-types").WebpackStats} WebpackStats */
/** @typedef {import(  "./webpack-stats-types").WebpackStatsChunk} WebpackStatsChunk */
/** @typedef {import("./webpack-stats-types").WebpackStatsModule} WebpackStatsModule */

/**
 * @typedef {object} SharedDependency
 * @property {string} shareScope
 * @property {string} shareKey
 * @property {string} requiredVersion
 * @property {boolean} strictVersion
 * @property {boolean} singleton
 * @property {boolean} eager
 */

/**
 * @typedef {object} SharedModule
 * @property {string[]} chunks
 * @property {SharedDependency[]} provides
 */

/**
 * @typedef {object} Exposed
 * @property {string[]} chunks
 * @property {SharedModule[]} sharedModules
 */

/**
 * @typedef {object} FederatedContainer
 * @property {string} remote
 * @property {string} entry
 * @property {SharedModule[]} sharedModules
 * @property {{ [key: string]: Exposed }} exposes
 */

/**
 * @typedef {object} FederatedStats
 * @property {SharedModule[]} sharedModules
 * @property {FederatedContainer[]} federatedModules
 */

const concat = (x, y) => x.concat(y);

const flatMap = (xs, f) => xs.map(f).reduce(concat, []);

/**
 *
 * @param {WebpackStats} stats
 * @returns {}
 */
function getRemoteModules(stats) {
  return stats.modules
    .filter((mod) => mod.moduleType === 'remote-module')
    .reduce((acc, remoteModule) => {
      acc[remoteModule.nameForCondition] = remoteModule.id;
      return acc;
    }, {});
}

/**
 *
 * @param {WebpackStats} stats
 * @param {string} exposedFile
 * @returns {WebpackStatsModule[]}
 */
function getExposedModules(stats, exposedFile) {
  return stats.modules.filter((mod) => mod.name?.startsWith(exposedFile));
}
//eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDependenciesOfChunk(stats, chunk) {
  return stats.chunks
    .filter((c) => c.children.includes(chunk.id))
    .reduce((acc, c) => {
      return acc.concat(c.modules);
    }, []);
}

/**
 *
 * @param {WebpackStats} stats
 * @param {WebpackStatsModule} mod
 * @returns {Exposed}
 */
function getExposed(stats, mod) {
  const chunks = stats.chunks.filter((chunk) => {
    return chunk.modules.find((modsInChunk) => {
      return modsInChunk.id === mod.id && !modsInChunk.dependent;
    });
  });
  const dependencies = stats.modules
    .filter((sharedModule) => {
      if (sharedModule.moduleType !== 'consume-shared-module') {
        return false;
      }
      return sharedModule.issuerId === mod.id;
    })
    .map((sharedModule) => {
      return sharedModule.identifier.split('|')[2];
    });

  const flatChunks = flatMap(chunks, (chunk) => ({
    [chunk.id]: {
      files: chunk.files.map(
        (f) =>
          `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`,
      ),
      requiredModules: dependencies,
    },
  }));

  return flatChunks.reduce((acc, chunk) => {
    Object.assign(acc, chunk);
    return acc;
  }, {});
}

/**
 *
 * @param {import("webpack").Module} mod
 * @param {(issuer: string) => boolean} check
 * @returns {boolean}
 */
function searchIssuer(mod, check) {
  if (mod.issuer && check(mod.issuer)) {
    return true;
  }

  return !!mod.modules && mod.modules.some((m) => searchIssuer(m, check));
}

function searchReason(mod, check) {
  if (mod.reasons && check(mod.reasons)) {
    return true;
  }

  return !!mod.reasons && mod.reasons.some((m) => searchReason(m, check));
}

function searchIssuerAndReason(mod, check) {
  const foundIssuer = searchIssuer(mod, (issuer) => check(issuer));
  if (foundIssuer) {
    return foundIssuer;
  }
  return searchReason(mod, (reason) =>
    reason.some((r) => check(r?.moduleIdentifier)),
  );
}

/**
 * @param {import("webpack").Module} mod
 * @param {(issuer: string) => boolean} check
 * @returns {string[]}
 */
function getIssuers(mod, check) {
  if (mod.issuer && check(mod.issuer)) {
    return [mod.issuer];
  }

  return (
    (mod.modules &&
      mod.modules.filter((m) => searchIssuer(m, check)).map((m) => m.issuer)) ||
    []
  );
}

function getIssuersAndReasons(mod, check) {
  if (mod.issuer && check(mod.issuer)) {
    return [mod.issuer];
  }
  if (
    mod.reasons &&
    searchReason(mod, (reason) =>
      reason.some((r) => check(r?.moduleIdentifier)),
    )
  ) {
    return mod.reasons
      .filter((r) => {
        return r.moduleIdentifier && check(r.moduleIdentifier);
      })
      .map((r) => r.moduleIdentifier);
  }

  return (
    (mod.modules &&
      mod.modules
        .filter((m) => searchIssuerAndReason(m, check))
        .map((m) => {
          return (
            m.issuer ||
            m.reasons.find((r) => check(r?.moduleIdentifier)).moduleIdentifier
          );
        })) ||
    []
  );
}

/**
 * @param {string} issuer
 * @returns {SharedDependency}
 */
function parseFederatedIssuer(issuer) {
  const split = issuer?.split('|') || [];
  if (split.length !== 8 || split[0] !== 'consume-shared-module') {
    return null;
  }
  const [
    ,
    shareScope,
    shareKey,
    requiredVersion,
    strictVersion,
    ,
    singleton,
    eager,
  ] = split;

  return {
    shareScope,
    shareKey,
    requiredVersion,
    strictVersion: JSON.parse(strictVersion),
    singleton: JSON.parse(singleton),
    eager: JSON.parse(eager),
  };
}

/**
 *
 * @param {WebpackStats} stats
 * @param {import("webpack").container.ModuleFederationPlugin} federationPlugin
 * @returns {SharedModule[]}
 */
function getSharedModules(stats, federationPlugin) {
  return flatMap(
    stats.chunks.filter((chunk) => {
      if (!stats.entrypoints[federationPlugin.name]) {
        return false;
      }
      return stats.entrypoints[federationPlugin.name].chunks.some(
        (id) => chunk.id === id,
      );
    }),
    (chunk) =>
      flatMap(chunk.children, (id) =>
        stats.chunks.filter(
          (c) =>
            c.id === id &&
            c.files.length > 0 &&
            c.parents.some((p) =>
              stats.entrypoints[federationPlugin.name].chunks.some(
                (c) => c === p,
              ),
            ) &&
            c.modules.some((m) =>
              searchIssuer(m, (issuer) =>
                issuer?.startsWith('consume-shared-module'),
              ),
            ),
        ),
      ),
  )
    .map((chunk) => ({
      chunks: chunk.files.map(
        (f) =>
          `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`,
      ),
      provides: flatMap(
        chunk.modules.filter((m) =>
          searchIssuer(m, (issuer) =>
            issuer?.startsWith('consume-shared-module'),
          ),
        ),
        (m) =>
          getIssuers(m, (issuer) =>
            issuer?.startsWith('consume-shared-module'),
          ),
      )
        .map(parseFederatedIssuer)
        .filter((f) => !!f),
    }))
    .filter((c) => c.provides.length > 0);
}

/**
 * @param {WebpackStats} stats
 * @returns {SharedModule[]}
 */
function getMainSharedModules(stats) {
  const chunks = stats.namedChunkGroups['main']
    ? flatMap(stats.namedChunkGroups['main'].chunks, (c) =>
        stats.chunks.filter((chunk) => chunk.id === c),
      )
    : [];

  return flatMap(chunks, (chunk) =>
    flatMap(chunk.children, (id) =>
      stats.chunks.filter((c) => {
        return (
          c.id === id &&
          c.files.length > 0 &&
          c.modules.some((m) => {
            return searchIssuerAndReason(m, (check) =>
              check?.startsWith('consume-shared-module'),
            );
          })
        );
      }),
    ),
  )
    .map((chunk) => {
      return {
        chunks: chunk.files.map(
          (f) =>
            `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`,
        ),
        provides: flatMap(
          chunk.modules.filter((m) =>
            searchIssuerAndReason(m, (check) =>
              check?.startsWith('consume-shared-module'),
            ),
          ),
          (m) =>
            getIssuersAndReasons(m, (issuer) =>
              issuer?.startsWith('consume-shared-module'),
            ),
        )
          .map(parseFederatedIssuer)
          .filter((f) => !!f),
      };
    })
    .filter((c) => c.provides.length > 0);
}

/**
 *
 * @param {WebpackStats} stats
 * @param {import("webpack").container.ModuleFederationPlugin} federationPlugin
 * @returns {FederatedStats}
 */
function getFederationStats(stats, federationPluginOptions) {
  const exposedModules = Object.entries(federationPluginOptions.exposes).reduce(
    (exposedModules, [exposedAs, exposedFile]) =>
      Object.assign(exposedModules, {
        [exposedAs]: getExposedModules(stats, exposedFile),
      }),
    {},
  );

  /** @type {{ [key: string]: Exposed }} */
  const exposes = Object.entries(exposedModules).reduce(
    (exposedChunks, [exposedAs, exposedModules]) =>
      Object.assign(exposedChunks, {
        [exposedAs]: flatMap(exposedModules, (mod) => getExposed(stats, mod)),
      }),
    {},
  );

  /** @type {string} */
  const remote =
    federationPluginOptions.library?.name || federationPluginOptions.name;

  const sharedModules = getSharedModules(stats, federationPluginOptions);
  const remoteModules = getRemoteModules(stats);
  return {
    remote,
    entry: `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${
      stats.assetsByChunkName[remote] &&
      stats.assetsByChunkName[remote].length === 1
        ? stats.assetsByChunkName[remote][0]
        : federationPluginOptions.filename
    }`,
    sharedModules,
    exposes,
    remoteModules,
  };
}

/**
 * @typedef {object} FederationStatsPluginOptions
 * @property {string | string[]} filename The filename or an array of filenames in the `output.path` directory to write stats to.
 */

/**
 * Writes relevant federation stats to a file for further consumption.
 */
class FederationStatsPlugin {
  /**
   *
   * @param {FederationStatsPluginOptions} options
   */
  constructor(options) {
    if (!options || !options.filename) {
      throw new Error('filename option is required.');
    }

    this._options = options;
  }

  /**
   *
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const federationPlugins = compiler.options.plugins?.filter(
      (plugin) =>
        [
          'NextFederationPlugin',
          'UniversalFederationPlugin',
          'NodeFederationPlugin',
          'ModuleFederationPlugin',
        ].includes(plugin.constructor.name) && plugin?._options?.exposes,
    );

    if (!federationPlugins || federationPlugins.length === 0) {
      return;
    }

    // This is where the plugin is tapping into the Webpack compilation lifecycle.
    // It's listening to the 'thisCompilation' event, which is triggered once for each new compilation.
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      // 'processAssets' is a hook that gets triggered when Webpack has finished the compilation
      // and is about to generate the final assets. It allows plugins to do additional processing on the assets.
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          // Extract the options from the federation plugins.
          const [federationOpts] = federationPlugins.map(
            (federationPlugin) => federationPlugin?._options,
          );

          let container;
          // Loop through all entry points and if one matches the name of a federation plugin,
          // store the entry point in the 'container' variable.
          for (const [name, entry] of compilation.entrypoints) {
            if (container) {
              break;
            }
            federationOpts.name.includes(name) && (container = entry);
          }

          // If no matching entry point was found, exit the function early.
          if (!container) {
            return;
          }

          // Get the chunk associated with the entry point.
          container = container?.getEntrypointChunk();

          // Get the module associated with the chunk.
          const [containerEntryModule] = Array.from(
            compilation.chunkGraph.getChunkEntryModulesIterable(container),
          );

          const { blocks } = containerEntryModule;

          const exposedResolved = {};
          const builtExposes = {};

          // Iterate over each dependency block associated with the entry module.
          for (let block of blocks) {
            const blockmodule = block;

            // Iterate over each dependency within the block.
            for (const dep of blockmodule.dependencies) {
              // Get the module that corresponds to the dependency.
              const connection = compilation.moduleGraph.getConnection(dep);
              if (!connection) {
                continue;
              }
              const { module } = connection;

              const moduleChunks =
                compilation.chunkGraph.getModuleChunksIterable(module);
              // Iterate over each chunk associated with the module.
              for (let exposedChunk of moduleChunks) {
                // Determine the runtime for the chunk.
                const runtime =
                  typeof exposedChunk.runtime === 'string'
                    ? new Set([exposedChunk.runtime])
                    : exposedChunk.runtime;

                // Check if the chunk is meant for the same runtime as the entry module.
                const isForThisRuntime = runtime.has(
                  containerEntryModule._name,
                );

                // Get the root modules for the chunk.
                const rootModules =
                  compilation.chunkGraph.getChunkRootModules(exposedChunk);

                // Check if the module associated with the dependency is one of the root modules for the chunk.
                const moduleActuallyNeedsChunk = rootModules.includes(module);

                // If the chunk is not meant for this runtime or the module doesn't need the chunk, skip the rest of this iteration.
                if (!isForThisRuntime || !moduleActuallyNeedsChunk) {
                  continue;
                }

                // Add the files associated with the chunk to the 'builtExposes' object under the name of the exposed module.
                builtExposes[dep.exposedName] = [
                  ...(builtExposes[dep.exposedName] || []),
                  ...(exposedChunk.files || []),
                ];
              }

              // Add the module to the 'exposedResolved' object under the name of the exposed module.
              exposedResolved[dep.exposedName] = module;
            }
          }

          // Generate a JSON object that contains detailed information about the compilation.
          const stats = compilation.getStats().toJson({
            all: false,
            assets: true,
            reasons: true,
            modules: true,
            children: true,
            chunkGroups: true,
            chunkModules: true,
            chunkOrigins: false,
            entrypoints: true,
            namedChunkGroups: false,
            chunkRelations: true,
            chunks: true,
            ids: true,
            nestedModules: false,
            outputPath: true,
            publicPath: true,
          });

          // Apply a function 'getFederationStats' on the stats with the federation plugin options as the second argument.
          const federatedModules = getFederationStats(stats, federationOpts);

          // Assign the 'builtExposes' object to the 'exposes' property of the 'federatedModules' object.
          federatedModules.exposes = builtExposes;

          // Apply a function 'getMainSharedModules' on the stats.
          const sharedModules = getMainSharedModules(stats);

          // Create a Set to hold the vendor chunks.
          const vendorChunks = new Set();

          // Iterate over the shared modules.
          for (const share of sharedModules) {
            if (share?.chunks) {
              // If a shared module has chunks, add them to the 'vendorChunks' Set.
              for (const file of share.chunks) {
                vendorChunks.add(file);
              }
            }
          }

          // Construct an object that contains the shared and federated modules.
          const statsResult = {
            sharedModules,
            federatedModules: [federatedModules],
          };

          // Convert the 'statsResult' object to a JSON string.
          const statsJson = JSON.stringify(statsResult);

          // Convert the JSON string to a buffer.
          const statsBuffer = Buffer.from(statsJson, 'utf-8');

          // Construct an object that represents the source of the final asset.
          const statsSource = {
            source: () => statsBuffer,
            size: () => statsBuffer.length,
          };

          // Get the filename of the final asset from the plugin options.
          const { filename } = this._options;

          // If filename is an array, loop over it to emit or update assets.
          if (Array.isArray(filename)) {
            for (const file of filename) {
              // Check if an asset with the same filename already exists.
              const asset = compilation.getAsset(file);

              // If an asset with the same filename already exists, update it. Otherwise, create a new asset.
              if (asset) {
                compilation.updateAsset(file, statsSource);
              } else {
                compilation.emitAsset(file, statsSource);
              }
            }
          } else {
            // Check if an asset with the same filename already exists.
            const asset = compilation.getAsset(filename);

            // If an asset with the same filename already exists, update it. Otherwise, create a new asset.
            if (asset) {
              compilation.updateAsset(filename, statsSource);
            } else {
              compilation.emitAsset(filename, statsSource);
            }
          }
        },
      );
    });
  }
}

module.exports = FederationStatsPlugin;
