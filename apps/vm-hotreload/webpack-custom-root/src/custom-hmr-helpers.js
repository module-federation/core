const vm = require('vm');

// Webpack runtime code for in-memory HMR - only executed when webpack is available
function injectInMemoryHMRRuntime(__webpack_require__) {
  if (typeof __webpack_require__ === 'undefined') {
    console.warn(
      '[Custom HMR Helper] __webpack_require__ not available, skipping runtime injection',
    );
    return;
  }

  // we need to patch the runtime module for chunk loading hot update chunks to support in memory
  /* webpack/runtime/readFile chunk loading */
  (() => {
    // no baseURI

    // object to store loaded chunks
    // "0" means "already loaded", Promise means loading
    var installedChunks = (__webpack_require__.hmrS_readFileVm =
      __webpack_require__.hmrS_readFileVm || {
        index: 0,
      });

    // Global storage for in-memory chunk content
    var inMemoryChunks = {};

    // no on chunks loaded

    // no chunk install function needed

    // no chunk loading

    // no external install chunk

    function loadUpdateChunk(chunkId, updatedModulesList) {
      return new Promise(function (resolve, reject) {
        // Check if we have in-memory content for this chunk
        if (inMemoryChunks[chunkId]) {
          var content = inMemoryChunks[chunkId];
          var update = {};
          var filename = 'in-memory-' + chunkId + '.js';
          require('vm').runInThisContext(
            '(function(exports, require, __dirname, __filename) {' +
              content +
              '\n})',
            filename,
          )(update, require, __dirname, filename);
          var updatedModules = update.modules;
          var runtime = update.runtime;

          for (var moduleId in updatedModules) {
            if (__webpack_require__.o(updatedModules, moduleId)) {
              // Check if a new module exists in the update chunk
              if (updatedModules[moduleId]) {
                // Use the new module from the update chunk
                currentUpdate[moduleId] = updatedModules[moduleId];
              } else if (
                __webpack_require__.m &&
                __webpack_require__.m[moduleId]
              ) {
                // Only restore from .m if no new module exists in the update
                currentUpdate[moduleId] = __webpack_require__.m[moduleId];
              } else {
                // This shouldn't happen, but handle gracefully
                currentUpdate[moduleId] = false;
              }
              if (updatedModulesList) updatedModulesList.push(moduleId);
            }
          }
          if (runtime) currentUpdateRuntime.push(runtime);
          resolve();
        } else {
          // Fallback to filesystem loading
          var filename = require('path').join(
            __dirname,
            '' + __webpack_require__.hu(chunkId),
          );
          require('fs').readFile(filename, 'utf-8', function (err, content) {
            if (err) return reject(err);
            var update = {};
            require('vm').runInThisContext(
              '(function(exports, require, __dirname, __filename) {' +
                content +
                '\n})',
              filename,
            )(update, require, require('path').dirname(filename), filename);
            var updatedModules = update.modules;
            var runtime = update.runtime;
            for (var moduleId in updatedModules) {
              if (__webpack_require__.o(updatedModules, moduleId)) {
                currentUpdate[moduleId] = updatedModules[moduleId];
                if (updatedModulesList) updatedModulesList.push(moduleId);
              }
            }
            if (runtime) currentUpdateRuntime.push(runtime);
            resolve();
          });
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
          console.log(
            '[HMR DEBUG] New module factory exists:',
            !!newModuleFactory,
          );

          var result = getAffectedModuleEffects(moduleId);

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
              console.log(
                '[HMR DEBUG] Module self-declined, aborting:',
                moduleId,
              );
              if (options.onDeclined) options.onDeclined(result);
              if (!options.ignoreDeclined)
                abortError = new Error(
                  'Aborted because of self decline: ' +
                    result.moduleId +
                    chainInfo,
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
                  'Aborted because ' +
                    moduleId +
                    ' is not accepted' +
                    chainInfo,
                );
              break;
            case 'accepted':
              console.log('[HMR DEBUG] Module accepted, will apply:', moduleId);
              if (options.onAccepted) options.onAccepted(result);
              doApply = true;
              break;
            case 'disposed':
              console.log(
                '[HMR DEBUG] Module disposed, will dispose:',
                moduleId,
              );
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
              if (
                __webpack_require__.o(result.outdatedDependencies, moduleId)
              ) {
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
            errorHandler:
              typeof module.hot._selfAccepted === 'function'
                ? null
                : module.hot._selfAccepted,
            callback:
              typeof module.hot._selfAccepted === 'function'
                ? module.hot._selfAccepted
                : null,
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
              __webpack_require__.m[updateModuleId] =
                appliedUpdate[updateModuleId];
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
                moduleOutdatedDependencies =
                  outdatedDependencies[outdatedModuleId];
                console.log(
                  '[HMR DEBUG] Module outdated dependencies:',
                  moduleOutdatedDependencies,
                );

                var callbacks = [];
                var errorHandlers = [];
                var dependenciesForCallbacks = [];
                for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
                  var dependency = moduleOutdatedDependencies[j];
                  var acceptCallback =
                    module.hot._acceptedDependencies[dependency];
                  var errorHandler =
                    module.hot._acceptedErrorHandlers[dependency];
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
            console.log(
              '[HMR DEBUG] Reloading self-accepted module:',
              moduleId,
            );
            try {
              item.require(moduleId);
              console.log(
                '[HMR DEBUG] Successfully reloaded self-accepted module:',
                moduleId,
              );

              // Then call the self-accept callback if it exists
              if (item.callback && typeof item.callback === 'function') {
                console.log(
                  '[HMR DEBUG] Calling self-accept callback for module:',
                  moduleId,
                );
                item.callback();
                console.log(
                  '[HMR DEBUG] Self-accept callback executed for module:',
                  moduleId,
                );
              } else {
                console.log(
                  '[HMR DEBUG] No self-accept callback found for module:',
                  moduleId,
                  'callback type:',
                  typeof item.callback,
                );
              }
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

    // Global storage for in-memory manifest content
    var inMemoryManifest = null;

    __webpack_require__.hmrM = function () {
      return new Promise(function (resolve, reject) {
        // Check if we have in-memory manifest content
        if (inMemoryManifest) {
          try {
            resolve(JSON.parse(inMemoryManifest));
          } catch (e) {
            reject(e);
          }
        } else {
          // Fallback to filesystem loading
          var filename = require('path').join(
            __dirname,
            '' + __webpack_require__.hmrF(),
          );
          require('fs').readFile(filename, 'utf-8', function (err, content) {
            if (err) {
              if (err.code === 'ENOENT') return resolve();
              return reject(err);
            }
            try {
              resolve(JSON.parse(content));
            } catch (e) {
              reject(e);
            }
          });
        }
      });
    };

    // Helper functions to set in-memory content
    __webpack_require__.setInMemoryManifest = function (manifestContent) {
      inMemoryManifest = manifestContent;
    };

    __webpack_require__.setInMemoryChunk = function (chunkId, chunkContent) {
      inMemoryChunks[chunkId] = chunkContent;
    };
  })();
}

/**
 * Applies a hot update from in-memory strings by patching webpack's runtime modules.
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
    '🔥 [Custom HMR Helper] Applying update using patched runtime modules',
  );

  return new Promise((resolve, reject) => {
    try {
      // Check if module.hot is available
      if (!moduleObj || !moduleObj.hot) {
        reject(new Error('[HMR] Hot Module Replacement is disabled.'));
        return;
      }

      if (!webpackRequire) {
        reject(new Error('[HMR] __webpack_require__ is not available.'));
        return;
      }

      // Inject the in-memory HMR runtime if not already injected
      if (!webpackRequire.setInMemoryManifest) {
        console.log('🔧 [Custom HMR Helper] Injecting in-memory HMR runtime');
        injectInMemoryHMRRuntime(webpackRequire);
      }

      console.log('🚀 [Custom HMR Helper] Setting in-memory content for HMR');

      // Set the in-memory manifest content
      if (webpackRequire.setInMemoryManifest) {
        webpackRequire.setInMemoryManifest(manifestJsonString);
        console.log('📄 [Custom HMR Helper] Set in-memory manifest');
      } else {
        console.warn(
          '⚠️ [Custom HMR Helper] setInMemoryManifest not available',
        );
      }

      // Set the in-memory chunk content for each chunk
      if (webpackRequire.setInMemoryChunk) {
        for (const chunkId in chunkJsStringsMap) {
          webpackRequire.setInMemoryChunk(chunkId, chunkJsStringsMap[chunkId]);
          console.log(`📦 [Custom HMR Helper] Set in-memory chunk: ${chunkId}`);
        }
      } else {
        console.warn('⚠️ [Custom HMR Helper] setInMemoryChunk not available');
      }

      console.log(
        '📊 [Custom HMR Helper] Current HMR status:',
        moduleObj.hot.status(),
      );

      if (moduleObj.hot.status() === 'idle') {
        moduleObj.hot
          .check(true) // true means auto-apply
          .then((updatedModules) => {
            if (!updatedModules) {
              console.log(
                'ℹ️ [Custom HMR Helper] No updates detected by webpack',
              );
              resolve([]);
              return;
            }
            console.log(
              '✅ [Custom HMR Helper] Update applied. Updated modules:',
              updatedModules,
            );
            resolve(updatedModules || []);
          })
          .catch((error) => {
            const status = moduleObj.hot.status();
            if (['abort', 'fail'].indexOf(status) >= 0) {
              console.error('[Custom HMR Helper] Cannot apply update:', error);
              console.error(
                '[Custom HMR Helper] You need to restart the application!',
              );
            } else {
              console.error('[Custom HMR Helper] Update failed:', error);
            }
            reject(error);
          });
      } else {
        console.warn(
          `⚠️ [Custom HMR Helper] HMR not in idle state (${moduleObj.hot.status()}), cannot check for updates`,
        );
        resolve([]);
      }
    } catch (error) {
      console.error('[Custom HMR Helper] Error processing update:', error);
      reject(error);
    }
  });
}

module.exports = {
  applyHotUpdateFromStringsByPatching,
};
