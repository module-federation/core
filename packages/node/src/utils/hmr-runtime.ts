import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import type {
  HMRWebpackRequire,
  ModuleHot,
  HMRState,
  HMRManifest,
  ApplyOptions,
  ModuleEffectResult,
  ApplyResult,
  OutdatedSelfAcceptedModule,
  HMRModule,
  InstalledChunks,
  InMemoryChunks,
  ManifestRef,
  UpdateChunk,
  HMRHandlers,
  HMRRuntime,
} from '../types/hmr';

/**
 * Creates the loadUpdateChunk function for HMR
 * @param __webpack_require__ - The webpack require function
 * @param inMemoryChunks - Storage for in-memory chunks
 * @param state - Shared state object
 * @returns The loadUpdateChunk function
 */
function createLoadUpdateChunk(
  __webpack_require__: HMRWebpackRequire,
  inMemoryChunks: InMemoryChunks,
  state: HMRState,
): (chunkId: string, updatedModulesList?: string[]) => Promise<void> {
  return function loadUpdateChunk(
    chunkId: string,
    updatedModulesList?: string[],
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Initialize currentUpdate if not already done
      if (!state.currentUpdate) {
        state.currentUpdate = {};
      }

      // Check if we have in-memory content for this chunk
      if (inMemoryChunks[chunkId]) {
        var content = inMemoryChunks[chunkId];
        var update: UpdateChunk = {};
        var filename = 'in-memory-' + chunkId + '.js';
        vm.runInThisContext(
          '(function(exports, require, __dirname, __filename) {' +
            content +
            '\n})',
          filename,
        )(update, require, __dirname, filename);
        var updatedModules = update.modules;
        var runtime = update.runtime;

        for (var moduleId in updatedModules) {
          if (__webpack_require__.o(updatedModules, moduleId)) {
            state.currentUpdate![moduleId] = updatedModules[moduleId];
            if (updatedModulesList) updatedModulesList.push(moduleId);
          }
        }

        if (runtime) state.currentUpdateRuntime.push(runtime);
        resolve();
      } else {
        // Fallback to filesystem loading
        var filename: string = require('path').join(
          __dirname,
          '' + __webpack_require__.hu!(chunkId),
        );
        require('fs').readFile(
          filename,
          'utf-8',
          function (err: any, content: string) {
            if (err) return reject(err);
            var update: UpdateChunk = {};
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
                state.currentUpdate![moduleId] = updatedModules[moduleId];
                if (updatedModulesList) updatedModulesList.push(moduleId);
              }
            }
            if (runtime) state.currentUpdateRuntime.push(runtime);
            resolve();
          },
        );
      }
    });
  };
}

/**
 * Creates the applyHandler function for HMR
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param state - Shared state object
 * @returns The applyHandler function
 */
function createApplyHandler(
  __webpack_require__: HMRWebpackRequire,
  installedChunks: InstalledChunks,
  state: HMRState,
): (options: ApplyOptions) => ApplyResult {
  return function applyHandler(options: ApplyOptions): ApplyResult {
    if ((__webpack_require__ as any).f)
      delete (__webpack_require__ as any).f.readFileVmHmr;
    state.currentUpdateChunks = undefined;

    function getAffectedModuleEffects(
      updateModuleId: string,
    ): ModuleEffectResult {
      const outdatedModules = [updateModuleId];
      const outdatedDependencies: { [moduleId: string]: string[] } = {};

      const queue = outdatedModules.map((id) => ({
        chain: [id],
        id: id,
      }));

      while (queue.length > 0) {
        const queueItem = queue.pop()!;
        const moduleId = queueItem.id;
        const chain = queueItem.chain;
        const module = (__webpack_require__ as any).c[moduleId] as
          | HMRModule
          | undefined;
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
        for (let i = 0; i < module.parents.length; i++) {
          const parentId = module.parents[i];
          const parent = (__webpack_require__ as any).c[parentId] as
            | HMRModule
            | undefined;
          if (!parent) continue;
          if (parent.hot._declinedDependencies?.[moduleId]) {
            return {
              type: 'declined',
              chain: chain.concat([parentId]),
              moduleId: moduleId,
              parentId: parentId,
            };
          }
          if (outdatedModules.indexOf(parentId) !== -1) continue;
          if (parent.hot._acceptedDependencies?.[moduleId]) {
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

    function addAllToSet(a: string[], b: string[]): void {
      for (let i = 0; i < b.length; i++) {
        const item = b[i];
        if (a.indexOf(item) === -1) a.push(item);
      }
    }

    // at begin all updates modules are outdated
    // the "outdated" status can propagate to parents if they don't accept the children
    const outdatedDependencies: { [moduleId: string]: string[] } = {};
    const outdatedModules: string[] = [];
    const appliedUpdate: { [moduleId: string]: any } = {};

    const warnUnexpectedRequire = function warnUnexpectedRequire(
      module: any,
    ): void {
      console.warn(
        '[HMR] unexpected require(' + module.id + ') to disposed module',
      );
    };

    for (const moduleId in state.currentUpdate) {
      if (__webpack_require__.o(state.currentUpdate, moduleId)) {
        const newModuleFactory = state.currentUpdate[moduleId];
        /** @type {TODO} */
        // eslint-disable-next-line no-constant-condition
        const result: ModuleEffectResult = true
          ? getAffectedModuleEffects(moduleId)
          : {
              type: 'disposed',
              moduleId: moduleId,
            };
        let abortError: Error | false = false;
        let doApply = false;
        let doDispose = false;
        let chainInfo = '';
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
            throw new Error('Unexception type ' + (result as any).type);
        }
        if (abortError) {
          return {
            error: abortError,
          };
        }
        if (doApply) {
          //if no new module factory, use the existing one
          appliedUpdate[moduleId] =
            newModuleFactory || (__webpack_require__ as any).m[moduleId];
          // Propagate outdated modules and dependencies
          addAllToSet(outdatedModules, result.outdatedModules || []);
          for (const outModuleId in result.outdatedDependencies) {
            if (
              __webpack_require__.o(result.outdatedDependencies, outModuleId)
            ) {
              if (!outdatedDependencies[outModuleId])
                outdatedDependencies[outModuleId] = [];
              addAllToSet(
                outdatedDependencies[outModuleId],
                result.outdatedDependencies[outModuleId],
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
    state.currentUpdate = undefined;

    // Store self accepted outdated modules to require them later by the module system
    const outdatedSelfAcceptedModules: OutdatedSelfAcceptedModule[] = [];
    for (let j = 0; j < outdatedModules.length; j++) {
      const outdatedModuleId = outdatedModules[j];
      const module = (__webpack_require__ as any).c[outdatedModuleId] as
        | HMRModule
        | undefined;
      if (
        module &&
        (module.hot._selfAccepted || module.hot._main) &&
        // removed self-accepted modules should not be required
        appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
        // when called invalidate self-accepting is not possible
        !module.hot._selfInvalidated
      ) {
        outdatedSelfAcceptedModules.push({
          module: outdatedModuleId,
          require: module.hot._requireSelf,
          errorHandler:
            typeof module.hot._selfAccepted === 'function'
              ? (module.hot._selfAccepted as (
                  error: Error,
                  context: any,
                ) => void)
              : undefined,
        });
      }
    }

    let moduleOutdatedDependencies: string[];

    return {
      dispose: function (): void {
        state.currentUpdateRemovedChunks!.forEach((chunkId) => {
          delete installedChunks[chunkId];
        });
        state.currentUpdateRemovedChunks = undefined;

        let idx: number;
        const queue = outdatedModules.slice();
        while (queue.length > 0) {
          const moduleId = queue.pop()!;
          const module = (__webpack_require__ as any).c[moduleId] as
            | HMRModule
            | undefined;
          if (!module) continue;

          const data: any = {};

          // Call dispose handlers
          const disposeHandlers = module.hot._disposeHandlers;
          for (let j = 0; j < disposeHandlers!.length; j++) {
            disposeHandlers![j].call(null, data);
          }
          ((__webpack_require__ as any).hmrD as any)[moduleId] = data;

          // disable module (this disables requires from this module)
          module.hot.active = false;

          // remove module from cache
          delete (__webpack_require__ as any).c[moduleId];

          // when disposing there is no need to call dispose handler
          delete outdatedDependencies[moduleId];

          // remove "parents" references from all children
          for (let j = 0; j < module.children.length; j++) {
            const child = (__webpack_require__ as any).c[module.children[j]] as
              | HMRModule
              | undefined;
            if (!child) continue;
            idx = child.parents.indexOf(moduleId);
            if (idx >= 0) {
              child.parents.splice(idx, 1);
            }
          }
        }

        // remove outdated dependency from module children
        let dependency: string;
        for (const outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            const module = (__webpack_require__ as any).c[outdatedModuleId] as
              | HMRModule
              | undefined;
            if (module) {
              moduleOutdatedDependencies =
                outdatedDependencies[outdatedModuleId];
              for (let j = 0; j < moduleOutdatedDependencies.length; j++) {
                dependency = moduleOutdatedDependencies[j];
                idx = module.children.indexOf(dependency);
                if (idx >= 0) module.children.splice(idx, 1);
              }
            }
          }
        }
      },
      apply: function (reportError: (error: Error) => void): string[] {
        // insert new code
        for (const updateModuleId in appliedUpdate) {
          if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
            (__webpack_require__ as any).m[updateModuleId] =
              appliedUpdate[updateModuleId];
          }
        }

        // run new runtime modules
        for (let i = 0; i < state.currentUpdateRuntime.length; i++) {
          state.currentUpdateRuntime[i](__webpack_require__);
        }

        // call accept handlers
        for (const outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            const module = (__webpack_require__ as any).c[outdatedModuleId] as
              | HMRModule
              | undefined;
            if (module) {
              moduleOutdatedDependencies =
                outdatedDependencies[outdatedModuleId];
              const callbacks: ((...args: any[]) => void)[] = [];
              const errorHandlers: ((
                error: Error,
                context: any,
              ) => void | undefined)[] = [];
              const dependenciesForCallbacks: string[] = [];
              for (let j = 0; j < moduleOutdatedDependencies.length; j++) {
                const dependency = moduleOutdatedDependencies[j];
                const acceptCallback =
                  module.hot._acceptedDependencies?.[dependency];
                const errorHandler =
                  module.hot._acceptedErrorHandlers?.[dependency];
                if (acceptCallback) {
                  if (callbacks.indexOf(acceptCallback as any) !== -1) continue;
                  callbacks.push(acceptCallback as any);
                  errorHandlers.push(errorHandler as any);
                  dependenciesForCallbacks.push(dependency);
                }
              }
              for (let k = 0; k < callbacks.length; k++) {
                try {
                  callbacks[k].call(null, moduleOutdatedDependencies);
                } catch (err) {
                  if (typeof errorHandlers[k] === 'function') {
                    try {
                      errorHandlers[k]!(err as Error, {
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k],
                      });
                    } catch (err2) {
                      if (options.onErrored) {
                        options.onErrored({
                          type: 'accept-error-handler-errored',
                          moduleId: outdatedModuleId,
                          dependencyId: dependenciesForCallbacks[k],
                          error: err2 as Error,
                          originalError: err as Error,
                        });
                      }
                      if (!options.ignoreErrored) {
                        reportError(err2 as Error);
                        reportError(err as Error);
                      }
                    }
                  } else {
                    if (options.onErrored) {
                      options.onErrored({
                        type: 'accept-errored',
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k],
                        error: err as Error,
                      });
                    }
                    if (!options.ignoreErrored) {
                      reportError(err as Error);
                    }
                  }
                }
              }
            }
          }
        }

        // Load self accepted modules
        for (let o = 0; o < outdatedSelfAcceptedModules.length; o++) {
          const item = outdatedSelfAcceptedModules[o];
          const moduleId = item.module;
          try {
            item.require!(moduleId);
          } catch (err) {
            if (item.errorHandler && typeof item.errorHandler === 'function') {
              try {
                item.errorHandler(err as Error, {
                  moduleId: moduleId,
                  module: (__webpack_require__ as any).c[moduleId],
                });
              } catch (err1) {
                if (options.onErrored) {
                  options.onErrored({
                    type: 'self-accept-error-handler-errored',
                    moduleId: moduleId,
                    error: err1 as Error,
                    originalError: err as Error,
                  });
                }
                if (!options.ignoreErrored) {
                  reportError(err1 as Error);
                  reportError(err as Error);
                }
              }
            } else {
              if (options.onErrored) {
                options.onErrored({
                  type: 'self-accept-errored',
                  moduleId: moduleId,
                  error: err as Error,
                });
              }
              if (!options.ignoreErrored) {
                reportError(err as Error);
              }
            }
          }
        }

        return outdatedModules;
      },
    };
  };
}

/**
 * Creates the HMR manifest loader function
 * @param __webpack_require__ - The webpack require function
 * @param manifestRef - Reference object containing inMemoryManifest
 * @returns The HMR manifest loader function
 */
function createHMRManifestLoader(
  __webpack_require__: HMRWebpackRequire,
  manifestRef: ManifestRef,
): () => Promise<HMRManifest | undefined> {
  return function (): Promise<HMRManifest | undefined> {
    return new Promise<HMRManifest | undefined>((resolve, reject) => {
      // Check if we have in-memory manifest content
      if (manifestRef.value) {
        try {
          resolve(JSON.parse(manifestRef.value) as HMRManifest);
        } catch (e) {
          reject(e);
        }
      } else {
        // Fallback to filesystem loading
        const filename = path.join(
          __dirname,
          '' + (__webpack_require__ as any).hmrF(),
        );
        fs.readFile(filename, 'utf-8', (err, content) => {
          if (err) {
            if ((err as any).code === 'ENOENT') return resolve(undefined);
            return reject(err);
          }
          try {
            resolve(JSON.parse(content) as HMRManifest);
          } catch (e) {
            reject(e);
          }
        });
      }
    });
  };
}

/**
 * Creates the HMR chunk loading handlers
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param loadUpdateChunk - The loadUpdateChunk function
 * @param applyHandler - The applyHandler function
 * @param state - Shared state object
 * @returns Object containing hmrI and hmrC handlers
 */
function createHMRHandlers(
  __webpack_require__: HMRWebpackRequire,
  installedChunks: InstalledChunks,
  loadUpdateChunk: (
    chunkId: string,
    updatedModulesList?: string[],
  ) => Promise<void>,
  applyHandler: (options: ApplyOptions) => ApplyResult,
  state: HMRState,
): HMRHandlers {
  return {
    hmrI: function (
      moduleId: string,
      applyHandlers: ((options: ApplyOptions) => ApplyResult)[],
    ): void {
      // hmrI.readFileVm called for module

      if (!state.currentUpdate) {
        // Initializing currentUpdate
        state.currentUpdate = {};
        state.currentUpdateRuntime = [];
        state.currentUpdateRemovedChunks = [];
        applyHandlers.push(applyHandler);
      }

      if (!__webpack_require__.o(state.currentUpdate, moduleId)) {
        // Adding module to currentUpdate
        state.currentUpdate[moduleId] = (__webpack_require__ as any).m[
          moduleId
        ];
      } else {
        // Module already in currentUpdate
      }

      // Current update modules
    },
    hmrC: function (
      chunkIds: string[],
      removedChunks: string[],
      removedModules: string[],
      promises: Promise<any>[],
      applyHandlers: ((options: ApplyOptions) => ApplyResult)[],
      updatedModulesList: string[],
    ): void {
      applyHandlers.push(applyHandler);
      state.currentUpdateChunks = {};
      state.currentUpdateRemovedChunks = removedChunks;
      state.currentUpdate = removedModules.reduce(
        (obj: { [key: string]: any }, key: string) => {
          obj[key] = false;
          return obj;
        },
        {},
      );

      // Initial currentUpdate from removedModules

      state.currentUpdateRuntime = [];
      chunkIds.forEach((chunkId) => {
        // Processing chunkId

        if (
          __webpack_require__.o(installedChunks, chunkId) &&
          installedChunks[chunkId] !== undefined
        ) {
          // Loading update chunk
          promises.push(loadUpdateChunk(chunkId, updatedModulesList));
          state.currentUpdateChunks![chunkId] = true;
        } else {
          // Skipping chunk (not installed)
          state.currentUpdateChunks![chunkId] = false;
        }
      });
      if ((__webpack_require__ as any).f) {
        (__webpack_require__ as any).f.readFileVmHmr = function (
          chunkId: string,
          promises: Promise<any>[],
        ): void {
          if (
            state.currentUpdateChunks &&
            __webpack_require__.o(state.currentUpdateChunks, chunkId) &&
            !state.currentUpdateChunks[chunkId]
          ) {
            promises.push(loadUpdateChunk(chunkId));
            state.currentUpdateChunks[chunkId] = true;
          }
        };
      }
    },
  };
}

/**
 * Creates a complete HMR runtime with shared state
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param inMemoryChunks - Storage for in-memory chunks
 * @param manifestRef - Reference object for in-memory manifest storage
 * @returns Object containing all HMR functions
 */
function createHMRRuntime(
  __webpack_require__: HMRWebpackRequire,
  installedChunks: InstalledChunks,
  inMemoryChunks: InMemoryChunks,
  manifestRef: ManifestRef,
): HMRRuntime {
  // Shared state object
  const state: HMRState = {
    currentUpdateChunks: undefined,
    currentUpdate: {},
    currentUpdateRemovedChunks: [],
    currentUpdateRuntime: [],
  };

  const loadUpdateChunk = createLoadUpdateChunk(
    __webpack_require__,
    inMemoryChunks,
    state,
  );
  const applyHandler = createApplyHandler(
    __webpack_require__,
    installedChunks,
    state,
  );
  const hmrHandlers = createHMRHandlers(
    __webpack_require__,
    installedChunks,
    loadUpdateChunk,
    applyHandler,
    state,
  );
  const hmrManifestLoader = createHMRManifestLoader(
    __webpack_require__,
    manifestRef,
  );

  return {
    loadUpdateChunk: loadUpdateChunk,
    applyHandler: applyHandler,
    hmrHandlers: hmrHandlers,
    hmrManifestLoader: hmrManifestLoader,
  };
}

export {
  createLoadUpdateChunk,
  createApplyHandler,
  createHMRManifestLoader,
  createHMRHandlers,
  createHMRRuntime,
  type HMRState,
  type HMRManifest,
  type ApplyOptions,
  type ApplyResult,
  type HMRHandlers,
  type HMRRuntime,
  type InstalledChunks,
  type InMemoryChunks,
  type ManifestRef,
};
