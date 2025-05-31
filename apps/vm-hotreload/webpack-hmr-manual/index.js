/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ './node_modules/webpack/hot/log-apply-result.js':
      /*!******************************************************!*\
  !*** ./node_modules/webpack/hot/log-apply-result.js ***!
  \******************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

        /**
         * @param {(string | number)[]} updatedModules updated modules
         * @param {(string | number)[] | null} renewedModules renewed modules
         */
        module.exports = function (updatedModules, renewedModules) {
          var unacceptedModules = updatedModules.filter(function (moduleId) {
            return renewedModules && renewedModules.indexOf(moduleId) < 0;
          });
          var log = __webpack_require__(
            /*! ./log */ './node_modules/webpack/hot/log.js',
          );

          if (unacceptedModules.length > 0) {
            log(
              'warning',
              "[HMR] The following modules couldn't be hot updated: (They would need a full reload!)",
            );
            unacceptedModules.forEach(function (moduleId) {
              log('warning', '[HMR]  - ' + moduleId);
            });
          }

          if (!renewedModules || renewedModules.length === 0) {
            log('info', '[HMR] Nothing hot updated.');
          } else {
            log('info', '[HMR] Updated modules:');
            renewedModules.forEach(function (moduleId) {
              if (
                typeof moduleId === 'string' &&
                moduleId.indexOf('!') !== -1
              ) {
                var parts = moduleId.split('!');
                log.groupCollapsed('info', '[HMR]  - ' + parts.pop());
                log('info', '[HMR]  - ' + moduleId);
                log.groupEnd('info');
              } else {
                log('info', '[HMR]  - ' + moduleId);
              }
            });
            var numberIds = renewedModules.every(function (moduleId) {
              return typeof moduleId === 'number';
            });
            if (numberIds)
              log(
                'info',
                '[HMR] Consider using the optimization.moduleIds: "named" for module names.',
              );
          }
        };

        /***/
      },

    /***/ './node_modules/webpack/hot/log.js':
      /*!*****************************************!*\
  !*** ./node_modules/webpack/hot/log.js ***!
  \*****************************************/
      /***/ (module) => {
        /** @typedef {"info" | "warning" | "error"} LogLevel */

        /** @type {LogLevel} */
        var logLevel = 'info';

        function dummy() {}

        /**
         * @param {LogLevel} level log level
         * @returns {boolean} true, if should log
         */
        function shouldLog(level) {
          var shouldLog =
            (logLevel === 'info' && level === 'info') ||
            (['info', 'warning'].indexOf(logLevel) >= 0 &&
              level === 'warning') ||
            (['info', 'warning', 'error'].indexOf(logLevel) >= 0 &&
              level === 'error');
          return shouldLog;
        }

        /**
         * @param {(msg?: string) => void} logFn log function
         * @returns {(level: LogLevel, msg?: string) => void} function that logs when log level is sufficient
         */
        function logGroup(logFn) {
          return function (level, msg) {
            if (shouldLog(level)) {
              logFn(msg);
            }
          };
        }

        /**
         * @param {LogLevel} level log level
         * @param {string|Error} msg message
         */
        module.exports = function (level, msg) {
          if (shouldLog(level)) {
            if (level === 'info') {
              console.log(msg);
            } else if (level === 'warning') {
              console.warn(msg);
            } else if (level === 'error') {
              console.error(msg);
            }
          }
        };

        var group = console.group || dummy;
        var groupCollapsed = console.groupCollapsed || dummy;
        var groupEnd = console.groupEnd || dummy;

        module.exports.group = logGroup(group);

        module.exports.groupCollapsed = logGroup(groupCollapsed);

        module.exports.groupEnd = logGroup(groupEnd);

        /**
         * @param {LogLevel} level log level
         */
        module.exports.setLogLevel = function (level) {
          logLevel = level;
        };

        /**
         * @param {Error} err error
         * @returns {string} formatted error
         */
        module.exports.formatError = function (err) {
          var message = err.message;
          var stack = err.stack;
          if (!stack) {
            return message;
          } else if (stack.indexOf(message) < 0) {
            return message + '\n' + stack;
          }
          return stack;
        };

        /***/
      },

    /***/ './node_modules/webpack/hot/poll.js?1000':
      /*!***********************************************!*\
  !*** ./node_modules/webpack/hot/poll.js?1000 ***!
  \***********************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        var __resourceQuery = '?1000';
        /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
        /* globals __resourceQuery */
        if (true) {
          var hotPollInterval = +__resourceQuery.slice(1) || 0;
          var log = __webpack_require__(
            /*! ./log */ './node_modules/webpack/hot/log.js',
          );

          /**
           * @param {boolean=} fromUpdate true when called from update
           */
          var checkForUpdate = function checkForUpdate(fromUpdate) {
            if (module.hot.status() === 'idle') {
              module.hot
                .check(true)
                .then(function (updatedModules) {
                  if (!updatedModules) {
                    if (fromUpdate) log('info', '[HMR] Update applied.');
                    return;
                  }
                  __webpack_require__(
                    /*! ./log-apply-result */ './node_modules/webpack/hot/log-apply-result.js',
                  )(updatedModules, updatedModules);
                  checkForUpdate(true);
                })
                .catch(function (err) {
                  var status = module.hot.status();
                  if (['abort', 'fail'].indexOf(status) >= 0) {
                    log('warning', '[HMR] Cannot apply update.');
                    log('warning', '[HMR] ' + log.formatError(err));
                    log(
                      'warning',
                      '[HMR] You need to restart the application!',
                    );
                  } else {
                    log(
                      'warning',
                      '[HMR] Update failed: ' + log.formatError(err),
                    );
                  }
                });
            }
          };
          setInterval(checkForUpdate, hotPollInterval);
        } // removed by dead control flow
        else {
        }

        /***/
      },

    /***/ './src/entrypoint1.js':
      /*!****************************!*\
  !*** ./src/entrypoint1.js ***!
  \****************************/
      /***/ (module) => {
        const state = {
          name: 'Entrypoint 1',
          counter: 0,
          createdAt: new Date().toISOString(),
        };

        function getName() {
          return state.name;
        }

        function increment() {
          return ++state.counter;
        }
        function getCounter() {
          return state.counter;
        }
        function getCreatedAt() {
          return state.createdAt;
        }
        function greet(name = 'World') {
          return `✨ FINAL: Greetings ${name}! Count is ${state.counter}`;
        }
        function reset() {
          state.counter = 0;
          return 'Counter reset';
        }

        console.log('entrypoint1.js just did something i edited entrypoitn1');
        module.exports = {
          getName,
          increment,
          getCounter,
          getCreatedAt,
          greet,
          reset,
        };

        if (true) {
          console.log('entrypoint1.js hot reload has module.hot');
          // --- HMR self-accept pattern (commented out) ---
          // If you want this module to handle its own hot updates (and NOT notify the parent),
          // uncomment the following line. This is useful for modules with only side effects or
          // when you want to handle HMR logic locally. If self-accept is enabled, the parent
          // will NOT be notified of updates to this module, and parent HMR handlers will not run.
          // module.hot.accept();
          //
          // In this demo, we want the parent to be notified so it can re-require and refresh state.
          // -----------------------------------------------
          // If you want to preserve state, use dispose/data:
          // module.hot.dispose(data => { data.counter = state.counter; });
          // if (module.hot.data) { state.counter = module.hot.data.counter || 0; }
        }

        // Simulated edit at 2025-05-31T00:46:55.547Z
        // Simulated edit at 2025-05-31T00:52:43.278Z

        /***/
      },

    /***/ './src/entrypoint2.js':
      /*!****************************!*\
  !*** ./src/entrypoint2.js ***!
  \****************************/
      /***/ (module) => {
        const state = {
          name: 'Entrypoint 2',
          counter: 100,
          createdAt: new Date().toISOString(),
        };

        function getName() {
          return state.name;
        }
        function increment() {
          return ++state.counter;
        }
        function getCounter() {
          return state.counter;
        }
        function getCreatedAt() {
          return state.createdAt;
        }
        function greet(name = 'Universe') {
          return `Greetings ${name} from ${state.name}! Counter: ${state.counter}`;
        }
        function reset() {
          state.counter = 100;
          return 'Counter reset to 100';
        }

        module.exports = {
          getName,
          increment,
          getCounter,
          getCreatedAt,
          greet,
          reset,
        };

        if (true) {
          console.log('entrypoint2.js hot reload has module.hot');
          // --- HMR self-accept pattern (commented out) ---
          // If you want this module to handle its own hot updates (and NOT notify the parent),
          // uncomment the following line. This is useful for modules with only side effects or
          // when you want to handle HMR logic locally. If self-accept is enabled, the parent
          // will NOT be notified of updates to this module, and parent HMR handlers will not run.
          // module.hot.accept();
          //
          // In this demo, we want the parent to be notified so it can re-require and refresh state.
          // -----------------------------------------------
          // If you want to preserve state, use dispose/data:
          // module.hot.dispose(data => { data.counter = state.counter; });
          // if (module.hot.data) { state.counter = module.hot.data.counter || 100; }
        }

        /***/
      },

    /***/ './src/index.js':
      /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        console.log('index.js evaluated');

        let entrypoint1 = __webpack_require__(
          /*! ./entrypoint1.js */ './src/entrypoint1.js',
        );
        let entrypoint2 = __webpack_require__(
          /*! ./entrypoint2.js */ './src/entrypoint2.js',
        );

        let iteration = 0;
        const maxIterations = 3;

        // Only run the first demo at startup
        function runDemo() {
          iteration++;
          console.log(
            `\n🎭 Running Demo (Iteration ${iteration}/${maxIterations})...\n`,
          );

          try {
            console.log('=== Entrypoint 1 Demo ===');
            console.log('Name:', entrypoint1.getName());
            console.log('Counter:', entrypoint1.getCounter());
            console.log('Increment:', entrypoint1.increment());
            console.log('Greet:', entrypoint1.greet('Developer'));
            console.log('Created at:', entrypoint1.getCreatedAt());

            console.log('\n=== Entrypoint 2 Demo ===');
            console.log('Name:', entrypoint2.getName());
            console.log('Counter:', entrypoint2.getCounter());
            console.log('Increment:', entrypoint2.increment());
            console.log('Greet:', entrypoint2.greet('Universe'));
            console.log('Created at:', entrypoint2.getCreatedAt());
          } catch (error) {
            console.error('❌ Demo error:', error);
            process.exit(1);
          }
        }

        // Only run the first demo at startup
        runDemo();

        // HMR accept handler: just re-require modules and run demo again
        if (module.hot) {
          module.hot.accept(
            ['./src/entrypoint1.js', './src/entrypoint2.js'],
            () => {
              console.log('HMR accept handler called');
              entrypoint1 = __webpack_require__(
                /*! ./entrypoint1.js */ './src/entrypoint1.js',
              );
              entrypoint2 = __webpack_require__(
                /*! ./entrypoint2.js */ './src/entrypoint2.js',
              );
              runDemo();
            },
          );
        }
        /***/
      },

    /***/ fs:
      /*!*********************!*\
  !*** external "fs" ***!
  \*********************/
      /***/ (module) => {
        'use strict';
        module.exports = require('fs');

        /***/
      },

    /***/ path:
      /*!***********************!*\
  !*** external "path" ***!
  \***********************/
      /***/ (module) => {
        'use strict';
        module.exports = require('path');

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ if (cachedModule.error !== undefined) throw cachedModule.error;
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ try {
      /******/ var execOptions = {
        id: moduleId,
        module: module,
        factory: __webpack_modules__[moduleId],
        require: __webpack_require__,
      };
      /******/ __webpack_require__.i.forEach(function (handler) {
        handler(execOptions);
      });
      /******/ module = execOptions.module;
      /******/ execOptions.factory.call(
        module.exports,
        module,
        module.exports,
        execOptions.require,
      );
      /******/
    } catch (e) {
      /******/ module.error = e;
      /******/ throw e;
      /******/
    }
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = __webpack_modules__;
  /******/
  /******/ // expose the module cache
  /******/ __webpack_require__.c = __webpack_module_cache__;
  /******/
  /******/ // expose the module execution interceptor
  /******/ __webpack_require__.i = [];
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/get javascript update chunk filename */
  /******/ (() => {
    /******/ // This function allow to reference all chunks
    /******/ __webpack_require__.hu = (chunkId) => {
      /******/ // return url for filenames based on template
      /******/ return (
        '' + chunkId + '.' + __webpack_require__.h() + '.hot-update.js'
      );
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/get update manifest filename */
  /******/ (() => {
    /******/ __webpack_require__.hmrF = () =>
      'index.' + __webpack_require__.h() + '.hot-update.json';
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => '9d3d559c9ff6978a12fd';
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hot module replacement */
  /******/ (() => {
    /******/ var currentModuleData = {};
    /******/ var installedModules = __webpack_require__.c;
    /******/
    /******/ // module and require creation
    /******/ var currentChildModule;
    /******/ var currentParents = [];
    /******/
    /******/ // status
    /******/ var registeredStatusHandlers = [];
    /******/ var currentStatus = 'idle';
    /******/
    /******/ // while downloading
    /******/ var blockingPromises = 0;
    /******/ var blockingPromisesWaiting = [];
    /******/
    /******/ // The update info
    /******/ var currentUpdateApplyHandlers;
    /******/ var queuedInvalidatedModules;
    /******/
    /******/ __webpack_require__.hmrD = currentModuleData;
    /******/
    /******/ __webpack_require__.i.push(function (options) {
      /******/ var module = options.module;
      /******/ var require = createRequire(options.require, options.id);
      /******/ module.hot = createModuleHotObject(options.id, module);
      /******/ module.parents = currentParents;
      /******/ module.children = [];
      /******/ currentParents = [];
      /******/ options.require = require;
      /******/
    });
    /******/
    /******/ __webpack_require__.hmrC = {};
    /******/ __webpack_require__.hmrI = {};
    /******/
    /******/ function createRequire(require, moduleId) {
      /******/ var me = installedModules[moduleId];
      /******/ if (!me) return require;
      /******/ var fn = function (request) {
        /******/ if (me.hot.active) {
          /******/ if (installedModules[request]) {
            /******/ var parents = installedModules[request].parents;
            /******/ if (parents.indexOf(moduleId) === -1) {
              /******/ parents.push(moduleId);
              /******/
            }
            /******/
          } else {
            /******/ currentParents = [moduleId];
            /******/ currentChildModule = request;
            /******/
          }
          /******/ if (me.children.indexOf(request) === -1) {
            /******/ me.children.push(request);
            /******/
          }
          /******/
        } else {
          /******/ console.warn(
            /******/ '[HMR] unexpected require(' +
              /******/ request +
              /******/ ') from disposed module ' +
              /******/ moduleId,
            /******/
          );
          /******/ currentParents = [];
          /******/
        }
        /******/ return require(request);
        /******/
      };
      /******/ var createPropertyDescriptor = function (name) {
        /******/ return {
          /******/ configurable: true,
          /******/ enumerable: true,
          /******/ get: function () {
            /******/ return require[name];
            /******/
          },
          /******/ set: function (value) {
            /******/ require[name] = value;
            /******/
          },
          /******/
        };
        /******/
      };
      /******/ for (var name in require) {
        /******/ if (
          Object.prototype.hasOwnProperty.call(require, name) &&
          name !== 'e'
        ) {
          /******/ Object.defineProperty(
            fn,
            name,
            createPropertyDescriptor(name),
          );
          /******/
        }
        /******/
      }
      /******/ fn.e = function (chunkId, fetchPriority) {
        /******/ return trackBlockingPromise(require.e(chunkId, fetchPriority));
        /******/
      };
      /******/ return fn;
      /******/
    }
    /******/
    /******/ function createModuleHotObject(moduleId, me) {
      /******/ var _main = currentChildModule !== moduleId;
      /******/ var hot = {
        /******/ // private stuff
        /******/ _acceptedDependencies: {},
        /******/ _acceptedErrorHandlers: {},
        /******/ _declinedDependencies: {},
        /******/ _selfAccepted: false,
        /******/ _selfDeclined: false,
        /******/ _selfInvalidated: false,
        /******/ _disposeHandlers: [],
        /******/ _main: _main,
        /******/ _requireSelf: function () {
          /******/ currentParents = me.parents.slice();
          /******/ currentChildModule = _main ? undefined : moduleId;
          /******/ __webpack_require__(moduleId);
          /******/
        },
        /******/
        /******/ // Module API
        /******/ active: true,
        /******/ accept: function (dep, callback, errorHandler) {
          /******/ if (dep === undefined) hot._selfAccepted = true;
          /******/ else if (typeof dep === 'function') hot._selfAccepted = dep;
          /******/ else if (typeof dep === 'object' && dep !== null) {
            /******/ for (var i = 0; i < dep.length; i++) {
              /******/ hot._acceptedDependencies[dep[i]] =
                callback || function () {};
              /******/ hot._acceptedErrorHandlers[dep[i]] = errorHandler;
              /******/
            }
            /******/
          } else {
            /******/ hot._acceptedDependencies[dep] =
              callback || function () {};
            /******/ hot._acceptedErrorHandlers[dep] = errorHandler;
            /******/
          }
          /******/
        },
        /******/ decline: function (dep) {
          /******/ if (dep === undefined) hot._selfDeclined = true;
          /******/ else if (typeof dep === 'object' && dep !== null)
            /******/ for (var i = 0; i < dep.length; i++)
              /******/ hot._declinedDependencies[dep[i]] = true;
          /******/ else hot._declinedDependencies[dep] = true;
          /******/
        },
        /******/ dispose: function (callback) {
          /******/ hot._disposeHandlers.push(callback);
          /******/
        },
        /******/ addDisposeHandler: function (callback) {
          /******/ hot._disposeHandlers.push(callback);
          /******/
        },
        /******/ removeDisposeHandler: function (callback) {
          /******/ var idx = hot._disposeHandlers.indexOf(callback);
          /******/ if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
          /******/
        },
        /******/ invalidate: function () {
          /******/ this._selfInvalidated = true;
          /******/ switch (currentStatus) {
            /******/ case 'idle':
              /******/ currentUpdateApplyHandlers = [];
              /******/ Object.keys(__webpack_require__.hmrI).forEach(
                function (key) {
                  /******/ __webpack_require__.hmrI[key](
                    /******/ moduleId,
                    /******/ currentUpdateApplyHandlers,
                    /******/
                  );
                  /******/
                },
              );
              /******/ setStatus('ready');
              /******/ break;
            /******/ case 'ready':
              /******/ Object.keys(__webpack_require__.hmrI).forEach(
                function (key) {
                  /******/ __webpack_require__.hmrI[key](
                    /******/ moduleId,
                    /******/ currentUpdateApplyHandlers,
                    /******/
                  );
                  /******/
                },
              );
              /******/ break;
            /******/ case 'prepare':
            /******/ case 'check':
            /******/ case 'dispose':
            /******/ case 'apply':
              /******/ (queuedInvalidatedModules =
                queuedInvalidatedModules || []).push(
                /******/ moduleId,
                /******/
              );
              /******/ break;
            /******/ default: // ignore requests in error states
              /******/ /******/ break;
            /******/
          }
          /******/
        },
        /******/
        /******/ // Management API
        /******/ check: hotCheck,
        /******/ apply: hotApply,
        /******/ status: function (l) {
          /******/ if (!l) return currentStatus;
          /******/ registeredStatusHandlers.push(l);
          /******/
        },
        /******/ addStatusHandler: function (l) {
          /******/ registeredStatusHandlers.push(l);
          /******/
        },
        /******/ removeStatusHandler: function (l) {
          /******/ var idx = registeredStatusHandlers.indexOf(l);
          /******/ if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
          /******/
        },
        /******/
        /******/ // inherit from previous dispose call
        /******/ data: currentModuleData[moduleId],
        /******/
      };
      /******/ currentChildModule = undefined;
      /******/ return hot;
      /******/
    }
    /******/
    /******/ function setStatus(newStatus) {
      /******/ currentStatus = newStatus;
      /******/ var results = [];
      /******/
      /******/ for (var i = 0; i < registeredStatusHandlers.length; i++)
        /******/ results[i] = registeredStatusHandlers[i].call(null, newStatus);
      /******/
      /******/ return Promise.all(results).then(function () {});
      /******/
    }
    /******/
    /******/ function unblock() {
      /******/ if (--blockingPromises === 0) {
        /******/ setStatus('ready').then(function () {
          /******/ if (blockingPromises === 0) {
            /******/ var list = blockingPromisesWaiting;
            /******/ blockingPromisesWaiting = [];
            /******/ for (var i = 0; i < list.length; i++) {
              /******/ list[i]();
              /******/
            }
            /******/
          }
          /******/
        });
        /******/
      }
      /******/
    }
    /******/
    /******/ function trackBlockingPromise(promise) {
      /******/ switch (currentStatus) {
        /******/ case 'ready':
          /******/ setStatus('prepare');
        /******/ /* fallthrough */
        /******/ case 'prepare':
          /******/ blockingPromises++;
          /******/ promise.then(unblock, unblock);
          /******/ return promise;
        /******/ default:
          /******/ return promise;
        /******/
      }
      /******/
    }
    /******/
    /******/ function waitForBlockingPromises(fn) {
      /******/ if (blockingPromises === 0) return fn();
      /******/ return new Promise(function (resolve) {
        /******/ blockingPromisesWaiting.push(function () {
          /******/ resolve(fn());
          /******/
        });
        /******/
      });
      /******/
    }
    /******/
    /******/ function hotCheck(applyOnUpdate) {
      /******/ if (currentStatus !== 'idle') {
        /******/ throw new Error('check() is only allowed in idle status');
        /******/
      }
      /******/ return setStatus('check')
        /******/ .then(__webpack_require__.hmrM)
        /******/ .then(function (update) {
          /******/ if (!update) {
            /******/ return setStatus(
              applyInvalidatedModules() ? 'ready' : 'idle',
            ).then(
              /******/ function () {
                /******/ return null;
                /******/
              },
              /******/
            );
            /******/
          }
          /******/
          /******/ return setStatus('prepare').then(function () {
            /******/ var updatedModules = [];
            /******/ currentUpdateApplyHandlers = [];
            /******/
            /******/ return Promise.all(
              /******/ Object.keys(__webpack_require__.hmrC).reduce(function (
                /******/ promises,
                /******/ key,
                /******/
              ) {
                /******/ __webpack_require__.hmrC[key](
                  /******/ update.c,
                  /******/ update.r,
                  /******/ update.m,
                  /******/ promises,
                  /******/ currentUpdateApplyHandlers,
                  /******/ updatedModules,
                  /******/
                );
                /******/ return promises;
                /******/
              }, []),
              /******/
            ).then(function () {
              /******/ return waitForBlockingPromises(function () {
                /******/ if (applyOnUpdate) {
                  /******/ return internalApply(applyOnUpdate);
                  /******/
                }
                /******/ return setStatus('ready').then(function () {
                  /******/ return updatedModules;
                  /******/
                });
                /******/
              });
              /******/
            });
            /******/
          });
          /******/
        });
      /******/
    }
    /******/
    /******/ function hotApply(options) {
      /******/ if (currentStatus !== 'ready') {
        /******/ return Promise.resolve().then(function () {
          /******/ throw new Error(
            /******/ 'apply() is only allowed in ready status (state: ' +
              /******/ currentStatus +
              /******/ ')',
            /******/
          );
          /******/
        });
        /******/
      }
      /******/ return internalApply(options);
      /******/
    }
    /******/
    /******/ function internalApply(options) {
      /******/ options = options || {};
      /******/
      /******/ applyInvalidatedModules();
      /******/
      /******/ var results = currentUpdateApplyHandlers.map(function (handler) {
        /******/ return handler(options);
        /******/
      });
      /******/ currentUpdateApplyHandlers = undefined;
      /******/
      /******/ var errors = results
        /******/ .map(function (r) {
          /******/ return r.error;
          /******/
        })
        /******/ .filter(Boolean);
      /******/
      /******/ if (errors.length > 0) {
        /******/ return setStatus('abort').then(function () {
          /******/ throw errors[0];
          /******/
        });
        /******/
      }
      /******/
      /******/ // Now in "dispose" phase
      /******/ var disposePromise = setStatus('dispose');
      /******/
      /******/ results.forEach(function (result) {
        /******/ if (result.dispose) result.dispose();
        /******/
      });
      /******/
      /******/ // Now in "apply" phase
      /******/ var applyPromise = setStatus('apply');
      /******/
      /******/ var error;
      /******/ var reportError = function (err) {
        /******/ if (!error) error = err;
        /******/
      };
      /******/
      /******/ var outdatedModules = [];
      /******/ results.forEach(function (result) {
        /******/ if (result.apply) {
          /******/ var modules = result.apply(reportError);
          /******/ if (modules) {
            /******/ for (var i = 0; i < modules.length; i++) {
              /******/ outdatedModules.push(modules[i]);
              /******/
            }
            /******/
          }
          /******/
        }
        /******/
      });
      /******/
      /******/ return Promise.all([disposePromise, applyPromise]).then(
        function () {
          /******/ // handle errors in accept handlers and self accepted module load
          /******/ if (error) {
            /******/ return setStatus('fail').then(function () {
              /******/ throw error;
              /******/
            });
            /******/
          }
          /******/
          /******/ if (queuedInvalidatedModules) {
            /******/ return internalApply(options).then(function (list) {
              /******/ outdatedModules.forEach(function (moduleId) {
                /******/ if (list.indexOf(moduleId) < 0) list.push(moduleId);
                /******/
              });
              /******/ return list;
              /******/
            });
            /******/
          }
          /******/
          /******/ return setStatus('idle').then(function () {
            /******/ return outdatedModules;
            /******/
          });
          /******/
        },
      );
      /******/
    }
    /******/
    /******/ function applyInvalidatedModules() {
      /******/ if (queuedInvalidatedModules) {
        /******/ if (!currentUpdateApplyHandlers)
          currentUpdateApplyHandlers = [];
        /******/ Object.keys(__webpack_require__.hmrI).forEach(function (key) {
          /******/ queuedInvalidatedModules.forEach(function (moduleId) {
            /******/ __webpack_require__.hmrI[key](
              /******/ moduleId,
              /******/ currentUpdateApplyHandlers,
              /******/
            );
            /******/
          });
          /******/
        });
        /******/ queuedInvalidatedModules = undefined;
        /******/ return true;
        /******/
      }
      /******/
    }
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/require chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded chunks
    /******/ // "1" means "loaded", otherwise not loaded yet
    /******/ var installedChunks = (__webpack_require__.hmrS_require =
      __webpack_require__.hmrS_require || {
        /******/ index: 1,
        /******/
      });
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ // no chunk install function needed
    /******/
    /******/ // no chunk loading
    /******/
    /******/ // no external install chunk
    /******/
    /******/ function loadUpdateChunk(chunkId, updatedModulesList) {
      /******/ var update = require('./' + __webpack_require__.hu(chunkId));
      /******/ var updatedModules = update.modules;
      /******/ var runtime = update.runtime;
      /******/ for (var moduleId in updatedModules) {
        /******/ if (__webpack_require__.o(updatedModules, moduleId)) {
          /******/ currentUpdate[moduleId] = updatedModules[moduleId];
          /******/ if (updatedModulesList) updatedModulesList.push(moduleId);
          /******/
        }
        /******/
      }
      /******/ if (runtime) currentUpdateRuntime.push(runtime);
      /******/
    }
    /******/
    /******/ var currentUpdateChunks;
    /******/ var currentUpdate;
    /******/ var currentUpdateRemovedChunks;
    /******/ var currentUpdateRuntime;
    /******/ function applyHandler(options) {
      /******/ if (__webpack_require__.f)
        delete __webpack_require__.f.requireHmr;
      /******/ currentUpdateChunks = undefined;
      /******/ function getAffectedModuleEffects(updateModuleId) {
        /******/ var outdatedModules = [updateModuleId];
        /******/ var outdatedDependencies = {};
        /******/
        /******/ var queue = outdatedModules.map(function (id) {
          /******/ return {
            /******/ chain: [id],
            /******/ id: id,
            /******/
          };
          /******/
        });
        /******/ while (queue.length > 0) {
          /******/ var queueItem = queue.pop();
          /******/ var moduleId = queueItem.id;
          /******/ var chain = queueItem.chain;
          /******/ var module = __webpack_require__.c[moduleId];
          /******/ if (
            /******/ !module ||
            /******/ (module.hot._selfAccepted && !module.hot._selfInvalidated)
            /******/
          )
            /******/ continue;
          /******/ if (module.hot._selfDeclined) {
            /******/ return {
              /******/ type: 'self-declined',
              /******/ chain: chain,
              /******/ moduleId: moduleId,
              /******/
            };
            /******/
          }
          /******/ if (module.hot._main) {
            /******/ return {
              /******/ type: 'unaccepted',
              /******/ chain: chain,
              /******/ moduleId: moduleId,
              /******/
            };
            /******/
          }
          /******/ for (var i = 0; i < module.parents.length; i++) {
            /******/ var parentId = module.parents[i];
            /******/ var parent = __webpack_require__.c[parentId];
            /******/ if (!parent) continue;
            /******/ if (parent.hot._declinedDependencies[moduleId]) {
              /******/ return {
                /******/ type: 'declined',
                /******/ chain: chain.concat([parentId]),
                /******/ moduleId: moduleId,
                /******/ parentId: parentId,
                /******/
              };
              /******/
            }
            /******/ if (outdatedModules.indexOf(parentId) !== -1) continue;
            /******/ if (parent.hot._acceptedDependencies[moduleId]) {
              /******/ if (!outdatedDependencies[parentId])
                /******/ outdatedDependencies[parentId] = [];
              /******/ addAllToSet(outdatedDependencies[parentId], [moduleId]);
              /******/ continue;
              /******/
            }
            /******/ delete outdatedDependencies[parentId];
            /******/ outdatedModules.push(parentId);
            /******/ queue.push({
              /******/ chain: chain.concat([parentId]),
              /******/ id: parentId,
              /******/
            });
            /******/
          }
          /******/
        }
        /******/
        /******/ return {
          /******/ type: 'accepted',
          /******/ moduleId: updateModuleId,
          /******/ outdatedModules: outdatedModules,
          /******/ outdatedDependencies: outdatedDependencies,
          /******/
        };
        /******/
      }
      /******/
      /******/ function addAllToSet(a, b) {
        /******/ for (var i = 0; i < b.length; i++) {
          /******/ var item = b[i];
          /******/ if (a.indexOf(item) === -1) a.push(item);
          /******/
        }
        /******/
      }
      /******/
      /******/ // at begin all updates modules are outdated
      /******/ // the "outdated" status can propagate to parents if they don't accept the children
      /******/ var outdatedDependencies = {};
      /******/ var outdatedModules = [];
      /******/ var appliedUpdate = {};
      /******/
      /******/ var warnUnexpectedRequire = function warnUnexpectedRequire(
        module,
      ) {
        /******/ console.warn(
          /******/ '[HMR] unexpected require(' +
            module.id +
            ') to disposed module',
          /******/
        );
        /******/
      };
      /******/
      /******/ for (var moduleId in currentUpdate) {
        /******/ if (__webpack_require__.o(currentUpdate, moduleId)) {
          /******/ var newModuleFactory = currentUpdate[moduleId];
          /******/ var result = newModuleFactory
            ? /******/ getAffectedModuleEffects(moduleId)
            : /******/ {
                /******/ type: 'disposed',
                /******/ moduleId: moduleId,
                /******/
              };
          /******/ /** @type {Error|false} */
          /******/ var abortError = false;
          /******/ var doApply = false;
          /******/ var doDispose = false;
          /******/ var chainInfo = '';
          /******/ if (result.chain) {
            /******/ chainInfo =
              '\nUpdate propagation: ' + result.chain.join(' -> ');
            /******/
          }
          /******/ switch (result.type) {
            /******/ case 'self-declined':
              /******/ if (options.onDeclined) options.onDeclined(result);
              /******/ if (!options.ignoreDeclined)
                /******/ abortError = new Error(
                  /******/ 'Aborted because of self decline: ' +
                    /******/ result.moduleId +
                    /******/ chainInfo,
                  /******/
                );
              /******/ break;
            /******/ case 'declined':
              /******/ if (options.onDeclined) options.onDeclined(result);
              /******/ if (!options.ignoreDeclined)
                /******/ abortError = new Error(
                  /******/ 'Aborted because of declined dependency: ' +
                    /******/ result.moduleId +
                    /******/ ' in ' +
                    /******/ result.parentId +
                    /******/ chainInfo,
                  /******/
                );
              /******/ break;
            /******/ case 'unaccepted':
              /******/ if (options.onUnaccepted) options.onUnaccepted(result);
              /******/ if (!options.ignoreUnaccepted)
                /******/ abortError = new Error(
                  /******/ 'Aborted because ' +
                    moduleId +
                    ' is not accepted' +
                    chainInfo,
                  /******/
                );
              /******/ break;
            /******/ case 'accepted':
              /******/ if (options.onAccepted) options.onAccepted(result);
              /******/ doApply = true;
              /******/ break;
            /******/ case 'disposed':
              /******/ if (options.onDisposed) options.onDisposed(result);
              /******/ doDispose = true;
              /******/ break;
            /******/ default:
              /******/ throw new Error('Unexception type ' + result.type);
            /******/
          }
          /******/ if (abortError) {
            /******/ return {
              /******/ error: abortError,
              /******/
            };
            /******/
          }
          /******/ if (doApply) {
            /******/ appliedUpdate[moduleId] = newModuleFactory;
            /******/ addAllToSet(outdatedModules, result.outdatedModules);
            /******/ for (moduleId in result.outdatedDependencies) {
              /******/ if (
                __webpack_require__.o(result.outdatedDependencies, moduleId)
              ) {
                /******/ if (!outdatedDependencies[moduleId])
                  /******/ outdatedDependencies[moduleId] = [];
                /******/ addAllToSet(
                  /******/ outdatedDependencies[moduleId],
                  /******/ result.outdatedDependencies[moduleId],
                  /******/
                );
                /******/
              }
              /******/
            }
            /******/
          }
          /******/ if (doDispose) {
            /******/ addAllToSet(outdatedModules, [result.moduleId]);
            /******/ appliedUpdate[moduleId] = warnUnexpectedRequire;
            /******/
          }
          /******/
        }
        /******/
      }
      /******/ currentUpdate = undefined;
      /******/
      /******/ // Store self accepted outdated modules to require them later by the module system
      /******/ var outdatedSelfAcceptedModules = [];
      /******/ for (var j = 0; j < outdatedModules.length; j++) {
        /******/ var outdatedModuleId = outdatedModules[j];
        /******/ var module = __webpack_require__.c[outdatedModuleId];
        /******/ if (
          /******/ module &&
          /******/ (module.hot._selfAccepted || module.hot._main) &&
          /******/ // removed self-accepted modules should not be required
          /******/ appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
          /******/ // when called invalidate self-accepting is not possible
          /******/ !module.hot._selfInvalidated
          /******/
        ) {
          /******/ outdatedSelfAcceptedModules.push({
            /******/ module: outdatedModuleId,
            /******/ require: module.hot._requireSelf,
            /******/ errorHandler: module.hot._selfAccepted,
            /******/
          });
          /******/
        }
        /******/
      }
      /******/
      /******/ var moduleOutdatedDependencies;
      /******/
      /******/ return {
        /******/ dispose: function () {
          /******/ currentUpdateRemovedChunks.forEach(function (chunkId) {
            /******/ delete installedChunks[chunkId];
            /******/
          });
          /******/ currentUpdateRemovedChunks = undefined;
          /******/
          /******/ var idx;
          /******/ var queue = outdatedModules.slice();
          /******/ while (queue.length > 0) {
            /******/ var moduleId = queue.pop();
            /******/ var module = __webpack_require__.c[moduleId];
            /******/ if (!module) continue;
            /******/
            /******/ var data = {};
            /******/
            /******/ // Call dispose handlers
            /******/ var disposeHandlers = module.hot._disposeHandlers;
            /******/ for (j = 0; j < disposeHandlers.length; j++) {
              /******/ disposeHandlers[j].call(null, data);
              /******/
            }
            /******/ __webpack_require__.hmrD[moduleId] = data;
            /******/
            /******/ // disable module (this disables requires from this module)
            /******/ module.hot.active = false;
            /******/
            /******/ // remove module from cache
            /******/ delete __webpack_require__.c[moduleId];
            /******/
            /******/ // when disposing there is no need to call dispose handler
            /******/ delete outdatedDependencies[moduleId];
            /******/
            /******/ // remove "parents" references from all children
            /******/ for (j = 0; j < module.children.length; j++) {
              /******/ var child = __webpack_require__.c[module.children[j]];
              /******/ if (!child) continue;
              /******/ idx = child.parents.indexOf(moduleId);
              /******/ if (idx >= 0) {
                /******/ child.parents.splice(idx, 1);
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ // remove outdated dependency from module children
          /******/ var dependency;
          /******/ for (var outdatedModuleId in outdatedDependencies) {
            /******/ if (
              __webpack_require__.o(outdatedDependencies, outdatedModuleId)
            ) {
              /******/ module = __webpack_require__.c[outdatedModuleId];
              /******/ if (module) {
                /******/ moduleOutdatedDependencies =
                  /******/ outdatedDependencies[outdatedModuleId];
                /******/ for (
                  j = 0;
                  j < moduleOutdatedDependencies.length;
                  j++
                ) {
                  /******/ dependency = moduleOutdatedDependencies[j];
                  /******/ idx = module.children.indexOf(dependency);
                  /******/ if (idx >= 0) module.children.splice(idx, 1);
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
        },
        /******/ apply: function (reportError) {
          /******/ // insert new code
          /******/ for (var updateModuleId in appliedUpdate) {
            /******/ if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
              /******/ __webpack_require__.m[updateModuleId] =
                appliedUpdate[updateModuleId];
              /******/
            }
            /******/
          }
          /******/
          /******/ // run new runtime modules
          /******/ for (var i = 0; i < currentUpdateRuntime.length; i++) {
            /******/ currentUpdateRuntime[i](__webpack_require__);
            /******/
          }
          /******/
          /******/ // call accept handlers
          /******/ for (var outdatedModuleId in outdatedDependencies) {
            /******/ if (
              __webpack_require__.o(outdatedDependencies, outdatedModuleId)
            ) {
              /******/ var module = __webpack_require__.c[outdatedModuleId];
              /******/ if (module) {
                /******/ moduleOutdatedDependencies =
                  /******/ outdatedDependencies[outdatedModuleId];
                /******/ var callbacks = [];
                /******/ var errorHandlers = [];
                /******/ var dependenciesForCallbacks = [];
                /******/ for (
                  var j = 0;
                  j < moduleOutdatedDependencies.length;
                  j++
                ) {
                  /******/ var dependency = moduleOutdatedDependencies[j];
                  /******/ var acceptCallback =
                    /******/ module.hot._acceptedDependencies[dependency];
                  /******/ var errorHandler =
                    /******/ module.hot._acceptedErrorHandlers[dependency];
                  /******/ if (acceptCallback) {
                    /******/ if (callbacks.indexOf(acceptCallback) !== -1)
                      continue;
                    /******/ callbacks.push(acceptCallback);
                    /******/ errorHandlers.push(errorHandler);
                    /******/ dependenciesForCallbacks.push(dependency);
                    /******/
                  }
                  /******/
                }
                /******/ for (var k = 0; k < callbacks.length; k++) {
                  /******/ try {
                    /******/ callbacks[k].call(
                      null,
                      moduleOutdatedDependencies,
                    );
                    /******/
                  } catch (err) {
                    /******/ if (typeof errorHandlers[k] === 'function') {
                      /******/ try {
                        /******/ errorHandlers[k](err, {
                          /******/ moduleId: outdatedModuleId,
                          /******/ dependencyId: dependenciesForCallbacks[k],
                          /******/
                        });
                        /******/
                      } catch (err2) {
                        /******/ if (options.onErrored) {
                          /******/ options.onErrored({
                            /******/ type: 'accept-error-handler-errored',
                            /******/ moduleId: outdatedModuleId,
                            /******/ dependencyId: dependenciesForCallbacks[k],
                            /******/ error: err2,
                            /******/ originalError: err,
                            /******/
                          });
                          /******/
                        }
                        /******/ if (!options.ignoreErrored) {
                          /******/ reportError(err2);
                          /******/ reportError(err);
                          /******/
                        }
                        /******/
                      }
                      /******/
                    } else {
                      /******/ if (options.onErrored) {
                        /******/ options.onErrored({
                          /******/ type: 'accept-errored',
                          /******/ moduleId: outdatedModuleId,
                          /******/ dependencyId: dependenciesForCallbacks[k],
                          /******/ error: err,
                          /******/
                        });
                        /******/
                      }
                      /******/ if (!options.ignoreErrored) {
                        /******/ reportError(err);
                        /******/
                      }
                      /******/
                    }
                    /******/
                  }
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ // Load self accepted modules
          /******/ for (
            var o = 0;
            o < outdatedSelfAcceptedModules.length;
            o++
          ) {
            /******/ var item = outdatedSelfAcceptedModules[o];
            /******/ var moduleId = item.module;
            /******/ try {
              /******/ item.require(moduleId);
              /******/
            } catch (err) {
              /******/ if (typeof item.errorHandler === 'function') {
                /******/ try {
                  /******/ item.errorHandler(err, {
                    /******/ moduleId: moduleId,
                    /******/ module: __webpack_require__.c[moduleId],
                    /******/
                  });
                  /******/
                } catch (err1) {
                  /******/ if (options.onErrored) {
                    /******/ options.onErrored({
                      /******/ type: 'self-accept-error-handler-errored',
                      /******/ moduleId: moduleId,
                      /******/ error: err1,
                      /******/ originalError: err,
                      /******/
                    });
                    /******/
                  }
                  /******/ if (!options.ignoreErrored) {
                    /******/ reportError(err1);
                    /******/ reportError(err);
                    /******/
                  }
                  /******/
                }
                /******/
              } else {
                /******/ if (options.onErrored) {
                  /******/ options.onErrored({
                    /******/ type: 'self-accept-errored',
                    /******/ moduleId: moduleId,
                    /******/ error: err,
                    /******/
                  });
                  /******/
                }
                /******/ if (!options.ignoreErrored) {
                  /******/ reportError(err);
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ return outdatedModules;
          /******/
        },
        /******/
      };
      /******/
    }
    /******/ __webpack_require__.hmrI.require = function (
      moduleId,
      applyHandlers,
    ) {
      /******/ if (!currentUpdate) {
        /******/ currentUpdate = {};
        /******/ currentUpdateRuntime = [];
        /******/ currentUpdateRemovedChunks = [];
        /******/ applyHandlers.push(applyHandler);
        /******/
      }
      /******/ if (!__webpack_require__.o(currentUpdate, moduleId)) {
        /******/ currentUpdate[moduleId] = __webpack_require__.m[moduleId];
        /******/
      }
      /******/
    };
    /******/ __webpack_require__.hmrC.require = function (
      /******/ chunkIds,
      /******/ removedChunks,
      /******/ removedModules,
      /******/ promises,
      /******/ applyHandlers,
      /******/ updatedModulesList,
      /******/
    ) {
      /******/ applyHandlers.push(applyHandler);
      /******/ currentUpdateChunks = {};
      /******/ currentUpdateRemovedChunks = removedChunks;
      /******/ currentUpdate = removedModules.reduce(function (obj, key) {
        /******/ obj[key] = false;
        /******/ return obj;
        /******/
      }, {});
      /******/ currentUpdateRuntime = [];
      /******/ chunkIds.forEach(function (chunkId) {
        /******/ if (
          /******/ __webpack_require__.o(installedChunks, chunkId) &&
          /******/ installedChunks[chunkId] !== undefined
          /******/
        ) {
          /******/ promises.push(loadUpdateChunk(chunkId, updatedModulesList));
          /******/ currentUpdateChunks[chunkId] = true;
          /******/
        } else {
          /******/ currentUpdateChunks[chunkId] = false;
          /******/
        }
        /******/
      });
      /******/ if (__webpack_require__.f) {
        /******/ __webpack_require__.f.requireHmr = function (
          chunkId,
          promises,
        ) {
          /******/ if (
            /******/ currentUpdateChunks &&
            /******/ __webpack_require__.o(currentUpdateChunks, chunkId) &&
            /******/ !currentUpdateChunks[chunkId]
            /******/
          ) {
            /******/ promises.push(loadUpdateChunk(chunkId));
            /******/ currentUpdateChunks[chunkId] = true;
            /******/
          }
          /******/
        };
        /******/
      }
      /******/
    };
    /******/
    /******/ __webpack_require__.hmrM = function () {
      /******/ return Promise.resolve()
        .then(function () {
          /******/ return require('./' + __webpack_require__.hmrF());
          /******/
        })
        ['catch'](function (err) {
          if (err.code !== 'MODULE_NOT_FOUND') throw err;
        });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // module cache are used so entry inlining is disabled
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ __webpack_require__('./node_modules/webpack/hot/poll.js?1000');
  /******/ var __webpack_exports__ = __webpack_require__('./src/index.js');
  /******/ module.exports = __webpack_exports__;
  /******/
  /******/
})();
