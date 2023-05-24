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
      if (sharedModule.moduleType !== 'consume-shared-module') return false;
      return sharedModule.issuerId === mod.id;
    })
    .map((sharedModule) => {
      return sharedModule.identifier.split('|')[2];
    });

  const flatChunks = flatMap(chunks, (chunk) => ({
    [chunk.id]: {
      files: chunk.files.map(
        (f) =>
          `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`
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
  if (foundIssuer) return foundIssuer;
  return searchReason(mod, (reason) =>
    reason.some((r) => check(r?.moduleIdentifier))
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
      reason.some((r) => check(r?.moduleIdentifier))
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
        (id) => chunk.id === id
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
                (c) => c === p
              )
            ) &&
            c.modules.some((m) =>
              searchIssuer(m, (issuer) =>
                issuer?.startsWith('consume-shared-module')
              )
            )
        )
      )
  )
    .map((chunk) => ({
      chunks: chunk.files.map(
        (f) =>
          `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`
      ),
      provides: flatMap(
        chunk.modules.filter((m) =>
          searchIssuer(m, (issuer) =>
            issuer?.startsWith('consume-shared-module')
          )
        ),
        (m) =>
          getIssuers(m, (issuer) => issuer?.startsWith('consume-shared-module'))
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
        stats.chunks.filter((chunk) => chunk.id === c)
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
              check?.startsWith('consume-shared-module')
            );
          })
        );
      })
    )
  )
    .map((chunk) => {
      return {
        chunks: chunk.files.map(
          (f) =>
            `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`
        ),
        provides: flatMap(
          chunk.modules.filter((m) =>
            searchIssuerAndReason(m, (check) =>
              check?.startsWith('consume-shared-module')
            )
          ),
          (m) =>
            getIssuersAndReasons(m, (issuer) =>
              issuer?.startsWith('consume-shared-module')
            )
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
    {}
  );

  /** @type {{ [key: string]: Exposed }} */
  const exposes = Object.entries(exposedModules).reduce(
    (exposedChunks, [exposedAs, exposedModules]) =>
      Object.assign(exposedChunks, {
        [exposedAs]: flatMap(exposedModules, (mod) => getExposed(stats, mod)),
      }),
    {}
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
 * @property {string} filename The filename in the `output.path` directory to write stats to.
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
        ].includes(plugin.constructor.name) && plugin?._options?.exposes
    );

    if (!federationPlugins || federationPlugins.length === 0) {
      console.error('No ModuleFederationPlugin(s) found.');
      return;
    }
    let alreadyRun = false;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        // PLUGIN_NAME,
        async () => {
          const [federationOpts] = federationPlugins.map((federationPlugin) => {
            return federationPlugin?._options;
          });
          let container;
          for (const [name, entry] of compilation.entrypoints) {
            if (container) break;
            federationOpts.name.includes(name) && (container = entry);
          }
          if (!container) return;

          container = container?.getEntrypointChunk();

          const [containerEntryModule] = Array.from(
            compilation.chunkGraph.getChunkEntryModulesIterable(container)
          );
          const exposedObj = Object.fromEntries(containerEntryModule._exposes);
          const moduleMap = {};
          for (let mod of compilation.modules) {
            if (mod.rawRequest) moduleMap[mod.rawRequest] = mod;
          }
          const exposedResolved = {};

          for (let exposed in exposedObj) {
            exposedResolved[exposed] = moduleMap[exposedObj[exposed].import];
          }

          const builtExposes = {};

          container.getAllAsyncChunks().forEach((chunk) => {
            for (let expose in exposedResolved) {
              const rootModulesInChunk =
                compilation.chunkGraph.getChunkRootModules(chunk);

              if (rootModulesInChunk.includes(exposedResolved[expose])) {
                const referencedChunks = chunk.getAllReferencedChunks();
                const sharedModulesInChunk =
                  compilation.chunkGraph.getChunkModulesIterableBySourceType(
                    chunk,
                    'consume-shared'
                  );

                const currentModule = exposedResolved[expose];

                if (!builtExposes[expose])
                  builtExposes[expose] = { files: [], requires: [] };
                if (sharedModulesInChunk) {
                  builtExposes[expose].requires = [
                    ...builtExposes[expose].requires,
                    ...Array.from(sharedModulesInChunk)
                      .map((m) => m?.options?.shareKey)
                      .filter((i) => i),
                  ];
                }
                referencedChunks.forEach((chunk) => {
                  const rootReferencesInChunk =
                    compilation.chunkGraph.getChunkRootModules(chunk);
                  const isNodeModule = rootReferencesInChunk.some((mod) => {
                    if (mod.rootModule) mod = mod.rootModule;
                    return mod?.resource?.includes('node_modules');
                  });

                  if (isNodeModule) {
                    return;
                  }
                  builtExposes[expose].files = [
                    ...builtExposes[expose].files,
                    ...Array.from(chunk.files),
                  ];
                });
              }
            }
          });

          const sharedModulesInContainer =
            compilation.chunkGraph.getChunkModulesIterableBySourceType(
              container,
              'consume-shared'
            );

          const arrayOfShare = Array.from(sharedModulesInContainer);
          debugger;

          if (sharedModulesInContainer) {
            sharedModulesInContainer.forEach((mod) => {
              const sharedModuleDepModule = mod.dependencies.map((dep) => {
                return compilation.moduleGraph.getModule(dep);
              });
              // debugger;
            });
          }

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

          const federatedModules = getFederationStats(stats, federationOpts);

          federatedModules.exposes = builtExposes;

          const sharedModules = getMainSharedModules(stats);
          const vendorChunks = new Set();
          sharedModules.forEach((share) => {
            share?.chunks?.forEach((file) => {
              vendorChunks.add(file);
            });
          });
          const statsResult = {
            sharedModules,
            federatedModules: [federatedModules],
          };

          const statsJson = JSON.stringify(statsResult);
          const statsBuffer = Buffer.from(statsJson, 'utf-8');
          const statsSource = {
            source: () => statsBuffer,
            size: () => statsBuffer.length,
          };

          const { filename } = this._options;
          const asset = compilation.getAsset(filename);
          if (asset) {
            compilation.updateAsset(filename, statsSource);
          } else {
            compilation.emitAsset(filename, statsSource);
          }
        }
      );
    });
  }
}

module.exports = FederationStatsPlugin;
