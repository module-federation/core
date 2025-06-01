// Custom HMR helpers for API-based hot module replacement
const vm = require('vm');
const path = require('path');

// Simple module cache for tracking loaded modules
const moduleCache = new Map();
const appliedUpdates = new Set();

// Inject in-memory HMR runtime for API-based updates
function injectInMemoryHMRRuntime(__webpack_require__) {
  console.log('[Custom HMR Helper] Injecting in-memory HMR runtime');

  if (!__webpack_require__) {
    console.warn('[Custom HMR Helper] __webpack_require__ not available');
    return false;
  }

  // Add in-memory manifest storage
  let inMemoryManifest = null;
  __webpack_require__.setInMemoryManifest = function (manifestString) {
    inMemoryManifest = manifestString;
    console.log('[HMR Runtime] Set in-memory manifest');
  };

  // Add in-memory chunk storage
  const inMemoryChunks = new Map();
  __webpack_require__.setInMemoryChunk = function (chunkId, chunkContent) {
    inMemoryChunks.set(chunkId, chunkContent);
    console.log(`[HMR Runtime] Set in-memory chunk: ${chunkId}`);
  };

  // Initialize HMR runtime variables
  let currentUpdate = null;
  let currentUpdateRuntime = [];
  let currentUpdateRemovedChunks = [];
  let currentUpdateChunks = {};
  let installedChunks = __webpack_require__.cache || {};

  // Helper function to load update chunk from memory
  function loadUpdateChunk(chunkId, updatedModulesList) {
    return new Promise((resolve, reject) => {
      const chunkContent = inMemoryChunks.get(chunkId);
      if (chunkContent) {
        try {
          console.log(`[HMR Runtime] Loading chunk ${chunkId} from memory`);
          // Execute the chunk content to update modules
          eval(chunkContent);
          if (updatedModulesList) {
            updatedModulesList.push(chunkId);
          }
          resolve();
        } catch (error) {
          console.error(`[HMR Runtime] Error loading chunk ${chunkId}:`, error);
          reject(error);
        }
      } else {
        console.warn(
          `[HMR Runtime] No in-memory content for chunk: ${chunkId}`,
        );
        resolve(); // Don't reject, just continue
      }
    });
  }

  // Apply handler for processing HMR updates
  function applyHandler(options) {
    if (options && options.ignoreUnaccepted) options.ignoreUnaccepted = true;
    if (options && options.ignoreDeclined) options.ignoreDeclined = true;
    if (options && options.ignoreErrored) options.ignoreErrored = true;
    if (options && options.onDeclined) options.onDeclined = function () {};
    if (options && options.onUnaccepted) options.onUnaccepted = function () {};
    if (options && options.onAccepted) options.onAccepted = function () {};
    if (options && options.onDisposed) options.onDisposed = function () {};
    if (options && options.onErrored) options.onErrored = function () {};

    function getAffectedModuleEffects(updateModuleId) {
      var outdatedModules = [updateModuleId];
      var outdatedDependencies = {};

      var queue = outdatedModules.map(function (id) {
        return {
          chain: [id],
          id: id,
        };
      });
      while (queue.length > 0) {
        var queueItem = queue.pop();
        var moduleId = queueItem.id;
        var chain = queueItem.chain;
        var module = __webpack_require__.c[moduleId];
        if (
          !module ||
          (module.hot._selfAccepted && !module.hot._selfInvalidated)
        )
          continue;
        if (module.hot._selfDeclined) {
          return {
            type: 'self-declined',
            chain: chain,
            moduleId: moduleId,
          };
        }
        if (module.hot._main) {
          return {
            type: 'unaccepted',
            chain: chain,
            moduleId: moduleId,
          };
        }
        for (var i = 0; i < module.parents.length; i++) {
          var parentId = module.parents[i];
          var parent = __webpack_require__.c[parentId];
          if (!parent) continue;
          if (parent.hot._declinedDependencies[moduleId]) {
            return {
              type: 'declined',
              chain: chain.concat([parentId]),
              moduleId: moduleId,
              parentId: parentId,
            };
          }
          if (outdatedModules.indexOf(parentId) !== -1) continue;
          if (parent.hot._acceptedDependencies[moduleId]) {
            if (!outdatedDependencies[parentId])
              outdatedDependencies[parentId] = [];
            addAllToSet(outdatedDependencies[parentId], [moduleId]);
            continue;
          }
          delete outdatedDependencies[parentId];
          outdatedModules.push(parentId);
          queue.push({
            chain: chain.concat([parentId]),
            id: parentId,
          });
        }
      }

      return {
        type: 'accepted',
        moduleId: updateModuleId,
        outdatedModules: outdatedModules,
        outdatedDependencies: outdatedDependencies,
      };
    }

    function addAllToSet(a, b) {
      for (var i = 0; i < b.length; i++) {
        var item = b[i];
        if (a.indexOf(item) === -1) a.push(item);
      }
    }

    // Process current update
    var outdatedDependencies = {};
    var outdatedModules = [];
    var appliedUpdate = {};

    for (var moduleId in currentUpdate) {
      if (__webpack_require__.o(currentUpdate, moduleId)) {
        var newModuleFactory = currentUpdate[moduleId];
        var result = newModuleFactory
          ? getAffectedModuleEffects(moduleId)
          : {
              type: 'disposed',
              moduleId: moduleId,
            };

        var abortError = false;
        var doApply = false;
        var doDispose = false;
        var chainInfo = '';
        if (result.chain) {
          chainInfo = '\nUpdate propagation: ' + result.chain.join(' -> ');
        }

        switch (result.type) {
          case 'self-declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined)
              abortError = new Error(
                'Aborted because of self decline: ' +
                  result.moduleId +
                  chainInfo,
              );
            break;
          case 'declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined)
              abortError = new Error(
                'Aborted because of declined dependency: ' +
                  result.moduleId +
                  ' in ' +
                  result.parentId +
                  chainInfo,
              );
            break;
          case 'unaccepted':
            if (options.onUnaccepted) options.onUnaccepted(result);
            if (!options.ignoreUnaccepted)
              abortError = new Error(
                'Aborted because ' + moduleId + ' is not accepted' + chainInfo,
              );
            break;
          case 'accepted':
            if (options.onAccepted) options.onAccepted(result);
            doApply = true;
            break;
          case 'disposed':
            if (options.onDisposed) options.onDisposed(result);
            doDispose = true;
            break;
          default:
            throw new Error('Unexception type ' + result.type);
        }
        if (abortError) {
          return {
            error: abortError,
          };
        }
        if (doApply) {
          appliedUpdate[moduleId] = newModuleFactory;
          addAllToSet(outdatedModules, result.outdatedModules);
          for (moduleId in result.outdatedDependencies) {
            if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
              if (!outdatedDependencies[moduleId])
                outdatedDependencies[moduleId] = [];
              addAllToSet(
                outdatedDependencies[moduleId],
                result.outdatedDependencies[moduleId],
              );
            }
          }
        }
        if (doDispose) {
          addAllToSet(outdatedModules, [result.moduleId]);
          appliedUpdate[moduleId] = false;
        }
      }
    }

    currentUpdate = undefined;
    var outdatedSelfAcceptedModules = [];
    for (var j = 0; j < outdatedModules.length; j++) {
      var outdatedModuleId = outdatedModules[j];
      var module = __webpack_require__.c[outdatedModuleId];
      if (
        module &&
        (module.hot._selfAccepted || module.hot._main) &&
        appliedUpdate[outdatedModuleId] !== false &&
        !module.hot._selfInvalidated
      ) {
        outdatedSelfAcceptedModules.push({
          module: outdatedModuleId,
          require: module.hot._requireSelf,
          errorHandler: module.hot._selfAccepted,
        });
      }
    }

    var moduleOutdatedDependencies;

    return {
      dispose: function () {
        currentUpdateRemovedChunks.forEach(function (chunkId) {
          delete installedChunks[chunkId];
        });
        currentUpdateRemovedChunks = undefined;

        var idx;
        var queue = outdatedModules.slice();
        while (queue.length > 0) {
          var moduleId = queue.pop();
          var module = __webpack_require__.c[moduleId];
          if (!module) continue;

          var data = {};

          // Call dispose handlers
          var disposeHandlers = module.hot._disposeHandlers;
          for (j = 0; j < disposeHandlers.length; j++) {
            disposeHandlers[j].call(null, data);
          }
          __webpack_require__.hmrD[moduleId] = data;

          // disable module (this disables requires from this module)
          module.hot.active = false;

          // remove module from cache
          delete __webpack_require__.c[moduleId];

          // when disposing there is no need to call dispose handler
          delete outdatedDependencies[moduleId];

          // remove "parents" references from all children
          for (j = 0; j < module.children.length; j++) {
            var child = __webpack_require__.c[module.children[j]];
            if (!child) continue;
            idx = child.parents.indexOf(moduleId);
            if (idx >= 0) {
              child.parents.splice(idx, 1);
            }
          }
        }

        // remove outdated dependency from module children
        var dependency;
        for (var outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            module = __webpack_require__.c[outdatedModuleId];
            if (module) {
              moduleOutdatedDependencies =
                outdatedDependencies[outdatedModuleId];
              for (j = 0; j < moduleOutdatedDependencies.length; j++) {
                dependency = moduleOutdatedDependencies[j];
                idx = module.children.indexOf(dependency);
                if (idx >= 0) module.children.splice(idx, 1);
              }
            }
          }
        }
      },
      apply: function (reportError) {
        // insert new code
        for (var updateModuleId in appliedUpdate) {
          if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
            __webpack_require__.m[updateModuleId] =
              appliedUpdate[updateModuleId];
          }
        }

        // run new runtime modules
        for (var i = 0; i < currentUpdateRuntime.length; i++) {
          currentUpdateRuntime[i](__webpack_require__);
        }

        // call accept handlers
        for (var outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            var module = __webpack_require__.c[outdatedModuleId];
            if (module) {
              moduleOutdatedDependencies =
                outdatedDependencies[outdatedModuleId];
              var callbacks = [];
              var errorHandlers = [];
              var dependenciesForCallbacks = [];
              for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
                var dependency = moduleOutdatedDependencies[j];
                var acceptCallback =
                  module.hot._acceptedDependencies[dependency];
                var errorHandler =
                  module.hot._acceptedErrorHandlers[dependency];
                if (acceptCallback) {
                  if (callbacks.indexOf(acceptCallback) !== -1) continue;
                  callbacks.push(acceptCallback);
                  errorHandlers.push(errorHandler);
                  dependenciesForCallbacks.push(dependency);
                }
              }
              for (var k = 0; k < callbacks.length; k++) {
                try {
                  callbacks[k].call(null, moduleOutdatedDependencies);
                } catch (err) {
                  if (typeof errorHandlers[k] === 'function') {
                    try {
                      errorHandlers[k](err, {
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k],
                      });
                    } catch (err2) {
                      if (options.onErrored) {
                        options.onErrored({
                          type: 'accept-error-handler-errored',
                          moduleId: outdatedModuleId,
                          dependencyId: dependenciesForCallbacks[k],
                          error: err2,
                          originalError: err,
                        });
                      }
                      if (!options.ignoreErrored) {
                        reportError(err2);
                        reportError(err);
                      }
                    }
                  } else {
                    if (options.onErrored) {
                      options.onErrored({
                        type: 'accept-errored',
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k],
                        error: err,
                      });
                    }
                    if (!options.ignoreErrored) {
                      reportError(err);
                    }
                  }
                }
              }
            }
          }
        }

        // Load self accepted modules
        for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
          var item = outdatedSelfAcceptedModules[o];
          var moduleId = item.module;
          try {
            item.require(moduleId);
          } catch (err) {
            if (typeof item.errorHandler === 'function') {
              try {
                item.errorHandler(err, {
                  moduleId: moduleId,
                  module: __webpack_require__.c[moduleId],
                });
              } catch (err1) {
                if (options.onErrored) {
                  options.onErrored({
                    type: 'self-accept-error-handler-errored',
                    moduleId: moduleId,
                    error: err1,
                    originalError: err,
                  });
                }
                if (!options.ignoreErrored) {
                  reportError(err1);
                  reportError(err);
                }
              }
            } else {
              if (options.onErrored) {
                options.onErrored({
                  type: 'self-accept-errored',
                  moduleId: moduleId,
                  error: err,
                });
              }
              if (!options.ignoreErrored) {
                reportError(err);
              }
            }
          }
        }

        return outdatedModules;
      },
    };
  }

  // Override the HMR manifest loader with correct signature
  if (!__webpack_require__.hmrI) __webpack_require__.hmrI = {};
  __webpack_require__.hmrI.readFileVm = function (moduleId, applyHandlers) {
    console.log('[HMR DEBUG] hmrI.readFileVm called for module:', moduleId);

    if (!currentUpdate) {
      console.log('[HMR DEBUG] Initializing currentUpdate');
      currentUpdate = {};
      currentUpdateRuntime = [];
      currentUpdateRemovedChunks = [];
      applyHandlers.push(applyHandler);
    }

    if (!__webpack_require__.o(currentUpdate, moduleId)) {
      console.log('[HMR DEBUG] Adding module to currentUpdate:', moduleId);
      currentUpdate[moduleId] = __webpack_require__.m[moduleId];
    } else {
      console.log('[HMR DEBUG] Module already in currentUpdate:', moduleId);
    }

    console.log(
      '[HMR DEBUG] Current update modules:',
      Object.keys(currentUpdate),
    );
  };

  // Override the HMR chunk loader with correct signature
  if (!__webpack_require__.hmrC) __webpack_require__.hmrC = {};
  __webpack_require__.hmrC.readFileVm = function (
    chunkIds,
    removedChunks,
    removedModules,
    promises,
    applyHandlers,
    updatedModulesList,
  ) {
    console.log('[HMR DEBUG] hmrC.readFileVm called with:');
    console.log('[HMR DEBUG] - chunkIds:', chunkIds);
    console.log('[HMR DEBUG] - removedChunks:', removedChunks);
    console.log('[HMR DEBUG] - removedModules:', removedModules);
    console.log('[HMR DEBUG] - installedChunks:', installedChunks);

    applyHandlers.push(applyHandler);
    currentUpdateChunks = {};
    currentUpdateRemovedChunks = removedChunks;
    currentUpdate = removedModules.reduce(function (obj, key) {
      obj[key] = false;
      return obj;
    }, {});

    console.log(
      '[HMR DEBUG] Initial currentUpdate from removedModules:',
      currentUpdate,
    );

    currentUpdateRuntime = [];
    chunkIds.forEach(function (chunkId) {
      console.log('[HMR DEBUG] Processing chunkId:', chunkId);
      console.log(
        '[HMR DEBUG] Chunk in installedChunks:',
        __webpack_require__.o(installedChunks, chunkId),
      );
      console.log('[HMR DEBUG] Chunk value:', installedChunks[chunkId]);

      if (
        __webpack_require__.o(installedChunks, chunkId) &&
        installedChunks[chunkId] !== undefined
      ) {
        console.log('[HMR DEBUG] Loading update chunk:', chunkId);
        promises.push(loadUpdateChunk(chunkId, updatedModulesList));
        currentUpdateChunks[chunkId] = true;
      } else {
        console.log('[HMR DEBUG] Skipping chunk (not installed):', chunkId);
        currentUpdateChunks[chunkId] = false;
      }
    });
    if (__webpack_require__.f) {
      __webpack_require__.f.readFileVmHmr = function (chunkId, promises) {
        if (
          currentUpdateChunks &&
          __webpack_require__.o(currentUpdateChunks, chunkId) &&
          !currentUpdateChunks[chunkId]
        ) {
          promises.push(loadUpdateChunk(chunkId));
          currentUpdateChunks[chunkId] = true;
        }
      };
    }
  };

  console.log('[Custom HMR Helper] In-memory HMR runtime injection complete');
  return true;
}

/**
 * Applies a hot update from API-received content using webpack HMR system
 * @param {string} filename - The filename of the module to update
 * @param {string} content - The new content for the module
 * @param {object} options - Optional configuration
 * @returns {Promise<string[]>} Promise that resolves to array of updated module IDs
 */
function applyHotUpdateFromApi(filename, content, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🔥 [API HMR] Applying update for: ${filename}`);

      // Inject the in-memory HMR runtime if not already available
      if (
        typeof __webpack_require__ !== 'undefined' &&
        !__webpack_require__.setInMemoryChunk
      ) {
        console.log('🔧 [API HMR] Injecting in-memory HMR runtime');
        injectInMemoryHMRRuntime(__webpack_require__);
      }

      // Create a mock manifest for this update
      const manifestContent = JSON.stringify({
        h: Date.now().toString(), // hash
        c: [filename], // chunks
        r: [], // removed chunks
        m: [filename], // modules
      });

      // Create chunk content in webpack format
      const chunkContent = `(self["webpackHotUpdate"] = self["webpackHotUpdate"] || []).push([[
"${filename}"],{
"${filename}":
${content}
}]);`;

      // Set in-memory content
      if (__webpack_require__.setInMemoryManifest) {
        __webpack_require__.setInMemoryManifest(manifestContent);
        console.log('📄 [API HMR] Set in-memory manifest');
      }

      if (__webpack_require__.setInMemoryChunk) {
        __webpack_require__.setInMemoryChunk(filename, chunkContent);
        console.log(`📦 [API HMR] Set in-memory chunk: ${filename}`);
      }

      // Use webpack's HMR check mechanism
      if (module.hot.status() === 'idle') {
        module.hot
          .check(true)
          .then((updatedModules) => {
            if (!updatedModules) {
              console.log('ℹ️ [API HMR] No updates detected by webpack');
              resolve([]);
              return;
            }
            console.log(
              '✅ [API HMR] Update applied via webpack HMR. Updated modules:',
              updatedModules,
            );
            resolve(updatedModules || [filename]);
          })
          .catch((error) => {
            const status = module.hot.status();
            if (['abort', 'fail'].indexOf(status) >= 0) {
              console.error('[API HMR] Cannot apply update:', error);
              console.error('[API HMR] You need to restart the application!');
            } else {
              console.error('[API HMR] Update failed:', error);
            }
            reject(error);
          });
      } else {
        console.warn(
          `⚠️ [API HMR] HMR not in idle state (${module.hot.status()}), cannot check for updates`,
        );
        resolve([]);
      }
    } catch (error) {
      console.error(
        `❌ [API HMR] Error applying update for ${filename}:`,
        error,
      );
      reject(error);
    }
  });
}

var currentUpdateChunks;
var currentUpdate;
var currentUpdateRemovedChunks;
var currentUpdateRuntime;
function applyHandler(options) {
  if (__webpack_require__.f) delete __webpack_require__.f.readFileVmHmr;
  currentUpdateChunks = undefined;
  function getAffectedModuleEffects(updateModuleId) {
    var outdatedModules = [updateModuleId];
    var outdatedDependencies = {};

    var queue = outdatedModules.map(function (id) {
      return {
        chain: [id],
        id: id,
      };
    });
    while (queue.length > 0) {
      var queueItem = queue.pop();
      var moduleId = queueItem.id;
      var chain = queueItem.chain;
      var module = __webpack_require__.c[moduleId];
      if (!module || (module.hot._selfAccepted && !module.hot._selfInvalidated))
        continue;
      if (module.hot._selfDeclined) {
        return {
          type: 'self-declined',
          chain: chain,
          moduleId: moduleId,
        };
      }
      if (module.hot._main) {
        return {
          type: 'unaccepted',
          chain: chain,
          moduleId: moduleId,
        };
      }
      for (var i = 0; i < module.parents.length; i++) {
        var parentId = module.parents[i];
        var parent = __webpack_require__.c[parentId];
        if (!parent) continue;
        if (parent.hot._declinedDependencies[moduleId]) {
          return {
            type: 'declined',
            chain: chain.concat([parentId]),
            moduleId: moduleId,
            parentId: parentId,
          };
        }
        if (outdatedModules.indexOf(parentId) !== -1) continue;
        if (parent.hot._acceptedDependencies[moduleId]) {
          if (!outdatedDependencies[parentId])
            outdatedDependencies[parentId] = [];
          addAllToSet(outdatedDependencies[parentId], [moduleId]);
          continue;
        }
        delete outdatedDependencies[parentId];
        outdatedModules.push(parentId);
        queue.push({
          chain: chain.concat([parentId]),
          id: parentId,
        });
      }
    }

    return {
      type: 'accepted',
      moduleId: updateModuleId,
      outdatedModules: outdatedModules,
      outdatedDependencies: outdatedDependencies,
    };
  }

  function addAllToSet(a, b) {
    for (var i = 0; i < b.length; i++) {
      var item = b[i];
      if (a.indexOf(item) === -1) a.push(item);
    }
  }

  // at begin all updates modules are outdated
  // the "outdated" status can propagate to parents if they don't accept the children
  var outdatedDependencies = {};
  var outdatedModules = [];
  var appliedUpdate = {};

  var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
    console.warn(
      '[HMR] unexpected require(' + module.id + ') to disposed module',
    );
  };
  for (var moduleId in currentUpdate) {
    if (__webpack_require__.o(currentUpdate, moduleId)) {
      var newModuleFactory = currentUpdate[moduleId];
      console.log(
        '[HMR DEBUG] Processing module:',
        moduleId,
        'factory exists:',
        !!newModuleFactory,
      );
      console.log('[HMR DEBUG] New module factory exists:', !!newModuleFactory);

      var result = newModuleFactory
        ? getAffectedModuleEffects(moduleId)
        : {
            type: 'disposed',
            moduleId: moduleId,
          };

      console.log('[HMR DEBUG] Module effect result:', result);

      /** @type {Error|false} */
      var abortError = false;
      var doApply = false;
      var doDispose = false;
      var chainInfo = '';
      if (result.chain) {
        chainInfo = '\nUpdate propagation: ' + result.chain.join(' -> ');
      }
      console.log(
        '[HMR DEBUG] Handling result type:',
        result.type,
        'for module:',
        moduleId,
      );

      switch (result.type) {
        case 'self-declined':
          console.log('[HMR DEBUG] Module self-declined, aborting:', moduleId);
          if (options.onDeclined) options.onDeclined(result);
          if (!options.ignoreDeclined)
            abortError = new Error(
              'Aborted because of self decline: ' + result.moduleId + chainInfo,
            );
          break;
        case 'declined':
          console.log(
            '[HMR DEBUG] Module declined by parent, aborting:',
            moduleId,
          );
          if (options.onDeclined) options.onDeclined(result);
          if (!options.ignoreDeclined)
            abortError = new Error(
              'Aborted because of declined dependency: ' +
                result.moduleId +
                ' in ' +
                result.parentId +
                chainInfo,
            );
          break;
        case 'unaccepted':
          console.log('[HMR DEBUG] Module unaccepted, aborting:', moduleId);
          if (options.onUnaccepted) options.onUnaccepted(result);
          if (!options.ignoreUnaccepted)
            abortError = new Error(
              'Aborted because ' + moduleId + ' is not accepted' + chainInfo,
            );
          break;
        case 'accepted':
          console.log('[HMR DEBUG] Module accepted, will apply:', moduleId);
          if (options.onAccepted) options.onAccepted(result);
          doApply = true;
          break;
        case 'disposed':
          console.log('[HMR DEBUG] Module disposed, will dispose:', moduleId);
          if (options.onDisposed) options.onDisposed(result);
          doDispose = true;
          break;
        default:
          throw new Error('Unexception type ' + result.type);
      }
      if (abortError) {
        return {
          error: abortError,
        };
      }
      if (doApply) {
        //if no new module factory, use the existing one
        appliedUpdate[moduleId] =
          newModuleFactory || __webpack_require__.m[moduleId];
        console.log(
          '[HMR DEBUG] Applying update for module using factory:',
          __webpack_require__.c[moduleId],
          appliedUpdate[moduleId],
        );
        // Propagate outdated modules and dependencies inf
        addAllToSet(outdatedModules, result.outdatedModules);
        for (moduleId in result.outdatedDependencies) {
          if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
            if (!outdatedDependencies[moduleId])
              outdatedDependencies[moduleId] = [];
            addAllToSet(
              outdatedDependencies[moduleId],
              result.outdatedDependencies[moduleId],
            );
          }
        }
      }
      if (doDispose) {
        addAllToSet(outdatedModules, [result.moduleId]);
        appliedUpdate[moduleId] = warnUnexpectedRequire;
      }
    }
  }
  currentUpdate = undefined;

  // Store self accepted outdated modules to require them later by the module system
  var outdatedSelfAcceptedModules = [];
  for (var j = 0; j < outdatedModules.length; j++) {
    var outdatedModuleId = outdatedModules[j];
    var module = __webpack_require__.c[outdatedModuleId];
    if (
      module &&
      (module.hot._selfAccepted || module.hot._main) &&
      // removed self-accepted modules should not be required
      appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
      // when called invalidate self-accepting is not possible
      !module.hot._selfInvalidated
    ) {
      console.log(
        '[HMR DEBUG] Adding self-accepted module:',
        outdatedModuleId,
        'callback type:',
        typeof module.hot._selfAccepted,
      );
      outdatedSelfAcceptedModules.push({
        module: outdatedModuleId,
        require: module.hot._requireSelf,
        errorHandler: module.hot._selfAccepted,
      });
    }
  }

  var moduleOutdatedDependencies;

  return {
    dispose: function () {
      currentUpdateRemovedChunks.forEach(function (chunkId) {
        delete installedChunks[chunkId];
      });
      currentUpdateRemovedChunks = undefined;

      var idx;
      var queue = outdatedModules.slice();
      while (queue.length > 0) {
        var moduleId = queue.pop();
        var module = __webpack_require__.c[moduleId];
        if (!module) continue;

        var data = {};

        // Call dispose handlers
        var disposeHandlers = module.hot._disposeHandlers;
        for (j = 0; j < disposeHandlers.length; j++) {
          disposeHandlers[j].call(null, data);
        }
        __webpack_require__.hmrD[moduleId] = data;

        // disable module (this disables requires from this module)
        module.hot.active = false;

        // remove module from cache
        delete __webpack_require__.c[moduleId];

        // when disposing there is no need to call dispose handler
        delete outdatedDependencies[moduleId];

        // remove "parents" references from all children
        for (j = 0; j < module.children.length; j++) {
          var child = __webpack_require__.c[module.children[j]];
          if (!child) continue;
          idx = child.parents.indexOf(moduleId);
          if (idx >= 0) {
            child.parents.splice(idx, 1);
          }
        }
      }

      // remove outdated dependency from module children
      var dependency;
      for (var outdatedModuleId in outdatedDependencies) {
        if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
          module = __webpack_require__.c[outdatedModuleId];
          if (module) {
            moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
            for (j = 0; j < moduleOutdatedDependencies.length; j++) {
              dependency = moduleOutdatedDependencies[j];
              idx = module.children.indexOf(dependency);
              if (idx >= 0) module.children.splice(idx, 1);
            }
          }
        }
      }
    },
    apply: function (reportError) {
      console.log('[HMR DEBUG] Apply function called');
      console.log('[HMR DEBUG] appliedUpdate:', Object.keys(appliedUpdate));
      console.log(
        '[HMR DEBUG] outdatedDependencies:',
        Object.keys(outdatedDependencies),
      );
      console.log(
        '[HMR DEBUG] outdatedSelfAcceptedModules:',
        outdatedSelfAcceptedModules.map(function (m) {
          return m.module;
        }),
      );

      // insert new code
      for (var updateModuleId in appliedUpdate) {
        if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
          console.log(
            '[HMR DEBUG] Updating module factory for:',
            updateModuleId,
          );
          __webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
        }
      }

      // run new runtime modules
      console.log(
        '[HMR DEBUG] Running',
        currentUpdateRuntime.length,
        'runtime modules',
      );
      for (var i = 0; i < currentUpdateRuntime.length; i++) {
        currentUpdateRuntime[i](__webpack_require__);
      }

      // call accept handlers
      console.log(
        '[HMR DEBUG] Calling accept handlers for outdated dependencies',
      );
      for (var outdatedModuleId in outdatedDependencies) {
        if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
          var module = __webpack_require__.c[outdatedModuleId];
          console.log(
            '[HMR DEBUG] Processing outdated module:',
            outdatedModuleId,
            'exists:',
            !!module,
          );

          if (module) {
            moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
            console.log(
              '[HMR DEBUG] Module outdated dependencies:',
              moduleOutdatedDependencies,
            );

            var callbacks = [];
            var errorHandlers = [];
            var dependenciesForCallbacks = [];
            for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
              var dependency = moduleOutdatedDependencies[j];
              var acceptCallback = module.hot._acceptedDependencies[dependency];
              var errorHandler = module.hot._acceptedErrorHandlers[dependency];
              console.log(
                '[HMR DEBUG] Checking dependency:',
                dependency,
                'has callback:',
                !!acceptCallback,
              );

              if (acceptCallback) {
                if (callbacks.indexOf(acceptCallback) !== -1) continue;
                callbacks.push(acceptCallback);
                errorHandlers.push(errorHandler);
                dependenciesForCallbacks.push(dependency);
              }
            }

            console.log(
              '[HMR DEBUG] Found',
              callbacks.length,
              'accept callbacks for module:',
              outdatedModuleId,
            );

            for (var k = 0; k < callbacks.length; k++) {
              try {
                console.log(
                  '[HMR DEBUG] Calling accept callback',
                  k,
                  'for module:',
                  outdatedModuleId,
                );
                callbacks[k].call(null, moduleOutdatedDependencies);
              } catch (err) {
                if (typeof errorHandlers[k] === 'function') {
                  try {
                    errorHandlers[k](err, {
                      moduleId: outdatedModuleId,
                      dependencyId: dependenciesForCallbacks[k],
                    });
                  } catch (err2) {
                    if (options.onErrored) {
                      options.onErrored({
                        type: 'accept-error-handler-errored',
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k],
                        error: err2,
                        originalError: err,
                      });
                    }
                    if (!options.ignoreErrored) {
                      reportError(err2);
                      reportError(err);
                    }
                  }
                } else {
                  if (options.onErrored) {
                    options.onErrored({
                      type: 'accept-errored',
                      moduleId: outdatedModuleId,
                      dependencyId: dependenciesForCallbacks[k],
                      error: err,
                    });
                  }
                  if (!options.ignoreErrored) {
                    reportError(err);
                  }
                }
              }
            }
          }
        }
      }

      // Load self accepted modules
      console.log(
        '[HMR DEBUG] Loading',
        outdatedSelfAcceptedModules.length,
        'self-accepted modules',
      );
      for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
        var item = outdatedSelfAcceptedModules[o];
        var moduleId = item.module;
        console.log('[HMR DEBUG] Reloading self-accepted module:', moduleId);
        try {
          item.require(moduleId);
        } catch (err) {
          console.log(
            '[HMR DEBUG] Error reloading self-accepted module:',
            moduleId,
            err,
          );
          if (typeof item.errorHandler === 'function') {
            try {
              item.errorHandler(err, {
                moduleId: moduleId,
                module: __webpack_require__.c[moduleId],
              });
            } catch (err1) {
              if (options.onErrored) {
                options.onErrored({
                  type: 'self-accept-error-handler-errored',
                  moduleId: moduleId,
                  error: err1,
                  originalError: err,
                });
              }
              if (!options.ignoreErrored) {
                reportError(err1);
                reportError(err);
              }
            }
          } else {
            if (options.onErrored) {
              options.onErrored({
                type: 'self-accept-errored',
                moduleId: moduleId,
                error: err,
              });
            }
            if (!options.ignoreErrored) {
              reportError(err);
            }
          }
        }
      }

      return outdatedModules;
    },
  };
}
__webpack_require__.hmrI.readFileVm = function (moduleId, applyHandlers) {
  console.log('[HMR DEBUG] hmrI.readFileVm called for module:', moduleId);

  if (!currentUpdate) {
    console.log('[HMR DEBUG] Initializing currentUpdate');
    currentUpdate = {};
    currentUpdateRuntime = [];
    currentUpdateRemovedChunks = [];
    applyHandlers.push(applyHandler);
  }

  if (!__webpack_require__.o(currentUpdate, moduleId)) {
    console.log('[HMR DEBUG] Adding module to currentUpdate:', moduleId);
    currentUpdate[moduleId] = __webpack_require__.m[moduleId];
  } else {
    console.log('[HMR DEBUG] Module already in currentUpdate:', moduleId);
  }

  console.log(
    '[HMR DEBUG] Current update modules:',
    Object.keys(currentUpdate),
  );
};
__webpack_require__.hmrC.readFileVm = function (
  chunkIds,
  removedChunks,
  removedModules,
  promises,
  applyHandlers,
  updatedModulesList,
) {
  console.log('[HMR DEBUG] hmrC.readFileVm called with:');
  console.log('[HMR DEBUG] - chunkIds:', chunkIds);
  console.log('[HMR DEBUG] - removedChunks:', removedChunks);
  console.log('[HMR DEBUG] - removedModules:', removedModules);
  console.log('[HMR DEBUG] - installedChunks:', installedChunks);

  applyHandlers.push(applyHandler);
  currentUpdateChunks = {};
  currentUpdateRemovedChunks = removedChunks;
  currentUpdate = removedModules.reduce(function (obj, key) {
    obj[key] = false;
    return obj;
  }, {});

  console.log(
    '[HMR DEBUG] Initial currentUpdate from removedModules:',
    currentUpdate,
  );

  currentUpdateRuntime = [];
  chunkIds.forEach(function (chunkId) {
    console.log('[HMR DEBUG] Processing chunkId:', chunkId);
    console.log(
      '[HMR DEBUG] Chunk in installedChunks:',
      __webpack_require__.o(installedChunks, chunkId),
    );
    console.log('[HMR DEBUG] Chunk value:', installedChunks[chunkId]);

    if (
      __webpack_require__.o(installedChunks, chunkId) &&
      installedChunks[chunkId] !== undefined
    ) {
      console.log('[HMR DEBUG] Loading update chunk:', chunkId);
      promises.push(loadUpdateChunk(chunkId, updatedModulesList));
      currentUpdateChunks[chunkId] = true;
    } else {
      console.log('[HMR DEBUG] Skipping chunk (not installed):', chunkId);
      currentUpdateChunks[chunkId] = false;
    }
  });
  if (__webpack_require__.f) {
    __webpack_require__.f.readFileVmHmr = function (chunkId, promises) {
      if (
        currentUpdateChunks &&
        __webpack_require__.o(currentUpdateChunks, chunkId) &&
        !currentUpdateChunks[chunkId]
      ) {
        promises.push(loadUpdateChunk(chunkId));
        currentUpdateChunks[chunkId] = true;
      }
    };
  }
};

/**
 * Legacy function for backward compatibility with webpack-based HMR.
 * This is kept for compatibility but the new applyHotUpdateFromApi should be used instead.
 * @param {object} moduleObj - The module object (usually 'module')
 * @param {object} webpackRequire - The __webpack_require__ function
 * @param {string} manifestJsonString - The JSON string content of the HMR manifest
 * @param {object} chunkJsStringsMap - A map of chunkId to the JS string content of the HMR chunk
 * @returns {Promise<string[]>} A promise that resolves to an array of module IDs that were updated
 */
function applyHotUpdateFromStringsByPatching(
  moduleObj,
  webpackRequire,
  manifestJsonString,
  chunkJsStringsMap,
) {
  console.log(
    '🔥 [Custom HMR Helper] Legacy function called, using API-based HMR instead',
  );

  return new Promise((resolve, reject) => {
    try {
      // Extract the first chunk and apply it using the new API-based approach
      const chunkIds = Object.keys(chunkJsStringsMap);
      if (chunkIds.length === 0) {
        console.log('⚠️ [Custom HMR Helper] No chunks to apply');
        resolve([]);
        return;
      }

      // Apply the first chunk using the new API-based approach
      const firstChunkId = chunkIds[0];
      const content = chunkJsStringsMap[firstChunkId];
      const filename = `chunk-${firstChunkId}.js`;

      applyHotUpdateFromApi(filename, content)
        .then(() => {
          console.log(
            `✅ [Custom HMR Helper] Applied update for chunk: ${firstChunkId}`,
          );
          resolve([firstChunkId]);
        })
        .catch((error) => {
          console.error(
            `❌ [Custom HMR Helper] Failed to apply update for chunk: ${firstChunkId}`,
            error,
          );
          reject(error);
        });
    } catch (error) {
      console.error('[Custom HMR Helper] Error processing update:', error);
      reject(error);
    }
  });
}

/**
 * Get information about a module from the cache
 * @param {string} filename - The filename of the module
 * @returns {object|null} The module information or null if not found
 */
function getModuleInfo(filename) {
  return moduleCache.get(filename) || null;
}

/**
 * Clear the module cache
 * @returns {void}
 */
function clearModuleCache() {
  moduleCache.clear();
  appliedUpdates.clear();
  console.log('🧹 [API HMR] Module cache cleared');
}

module.exports = {
  injectInMemoryHMRRuntime,
  applyHotUpdateFromStringsByPatching,
  applyHotUpdateFromApi,
  getModuleInfo,
  clearModuleCache,
};
