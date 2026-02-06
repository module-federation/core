/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = {
    /***/ '../../../packages/error-codes/dist/index.cjs.js': /***/ (
      __unused_webpack_module,
      exports,
    ) => {
      const RUNTIME_001 = 'RUNTIME-001';
      const RUNTIME_002 = 'RUNTIME-002';
      const RUNTIME_003 = 'RUNTIME-003';
      const RUNTIME_004 = 'RUNTIME-004';
      const RUNTIME_005 = 'RUNTIME-005';
      const RUNTIME_006 = 'RUNTIME-006';
      const RUNTIME_007 = 'RUNTIME-007';
      const RUNTIME_008 = 'RUNTIME-008';
      const RUNTIME_009 = 'RUNTIME-009';
      const TYPE_001 = 'TYPE-001';
      const BUILD_001 = 'BUILD-001';
      const BUILD_002 = 'BUILD-002';
      const getDocsUrl = (errorCode) => {
        const type = errorCode.split('-')[0].toLowerCase();
        return `View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/${type}#${errorCode.toLowerCase()}`;
      };
      const getShortErrorMsg = (
        errorCode,
        errorDescMap,
        args,
        originalErrorMsg,
      ) => {
        const msg = [`${[errorDescMap[errorCode]]} #${errorCode}`];
        args && msg.push(`args: ${JSON.stringify(args)}`);
        msg.push(getDocsUrl(errorCode));
        originalErrorMsg &&
          msg.push(`Original Error Message:\n ${originalErrorMsg}`);
        return msg.join('\n');
      };
      const runtimeDescMap = {
        [RUNTIME_001]: 'Failed to get remoteEntry exports.',
        [RUNTIME_002]: 'The remote entry interface does not contain "init"',
        [RUNTIME_003]: 'Failed to get manifest.',
        [RUNTIME_004]: 'Failed to locate remote.',
        [RUNTIME_005]:
          'Invalid loadShareSync function call from bundler runtime',
        [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
        [RUNTIME_007]: 'Failed to get remote snapshot.',
        [RUNTIME_008]: 'Failed to load script resources.',
        [RUNTIME_009]: 'Please call createInstance first.',
      };
      const typeDescMap = {
        [TYPE_001]:
          'Failed to generate type declaration. Execute the below cmd to reproduce and fix the error.',
      };
      const buildDescMap = {
        [BUILD_001]: 'Failed to find expose module.',
        [BUILD_002]: 'PublicPath is required in prod mode.',
      };
      const errorDescMap = {
        ...runtimeDescMap,
        ...typeDescMap,
        ...buildDescMap,
      };
      exports.BUILD_001 = BUILD_001;
      exports.BUILD_002 = BUILD_002;
      exports.RUNTIME_001 = RUNTIME_001;
      exports.RUNTIME_002 = RUNTIME_002;
      exports.RUNTIME_003 = RUNTIME_003;
      exports.RUNTIME_004 = RUNTIME_004;
      exports.RUNTIME_005 = RUNTIME_005;
      exports.RUNTIME_006 = RUNTIME_006;
      exports.RUNTIME_007 = RUNTIME_007;
      exports.RUNTIME_008 = RUNTIME_008;
      exports.RUNTIME_009 = RUNTIME_009;
      exports.TYPE_001 = TYPE_001;
      exports.buildDescMap = buildDescMap;
      exports.errorDescMap = errorDescMap;
      exports.getShortErrorMsg = getShortErrorMsg;
      exports.runtimeDescMap = runtimeDescMap;
      exports.typeDescMap = typeDescMap;

      /***/
    },

    /***/ '../../../packages/react-server-dom-webpack/cjs/react-server-dom-webpack-server.node.production.js':
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        /**
         * @license React
         * react-server-dom-webpack-server.node.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var stream = __webpack_require__('stream'),
          util = __webpack_require__('util');
        __webpack_require__('crypto');
        var async_hooks = __webpack_require__('async_hooks'),
          ReactDOM = __webpack_require__(
            '../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/react-dom.react-server.js',
          ),
          React = __webpack_require__(
            '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
          ),
          REACT_LEGACY_ELEMENT_TYPE = Symbol.for('react.element'),
          REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_FRAGMENT_TYPE = Symbol.for('react.fragment'),
          REACT_CONTEXT_TYPE = Symbol.for('react.context'),
          REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref'),
          REACT_SUSPENSE_TYPE = Symbol.for('react.suspense'),
          REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list'),
          REACT_MEMO_TYPE = Symbol.for('react.memo'),
          REACT_LAZY_TYPE = Symbol.for('react.lazy'),
          REACT_MEMO_CACHE_SENTINEL = Symbol.for('react.memo_cache_sentinel');
        Symbol.for('react.postpone');
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        function getIteratorFn(maybeIterable) {
          if (null === maybeIterable || 'object' !== typeof maybeIterable)
            return null;
          maybeIterable =
            (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
            maybeIterable['@@iterator'];
          return 'function' === typeof maybeIterable ? maybeIterable : null;
        }
        var ASYNC_ITERATOR = Symbol.asyncIterator,
          scheduleMicrotask = queueMicrotask,
          currentView = null,
          writtenBytes = 0,
          destinationHasCapacity = !0;
        function writeToDestination(destination, view) {
          destination = destination.write(view);
          destinationHasCapacity = destinationHasCapacity && destination;
        }
        function writeChunkAndReturn(destination, chunk) {
          if ('string' === typeof chunk) {
            if (0 !== chunk.length)
              if (2048 < 3 * chunk.length)
                0 < writtenBytes &&
                  (writeToDestination(
                    destination,
                    currentView.subarray(0, writtenBytes),
                  ),
                  (currentView = new Uint8Array(2048)),
                  (writtenBytes = 0)),
                  writeToDestination(destination, chunk);
              else {
                var target = currentView;
                0 < writtenBytes &&
                  (target = currentView.subarray(writtenBytes));
                target = textEncoder.encodeInto(chunk, target);
                var read = target.read;
                writtenBytes += target.written;
                read < chunk.length &&
                  (writeToDestination(
                    destination,
                    currentView.subarray(0, writtenBytes),
                  ),
                  (currentView = new Uint8Array(2048)),
                  (writtenBytes = textEncoder.encodeInto(
                    chunk.slice(read),
                    currentView,
                  ).written));
                2048 === writtenBytes &&
                  (writeToDestination(destination, currentView),
                  (currentView = new Uint8Array(2048)),
                  (writtenBytes = 0));
              }
          } else
            0 !== chunk.byteLength &&
              (2048 < chunk.byteLength
                ? (0 < writtenBytes &&
                    (writeToDestination(
                      destination,
                      currentView.subarray(0, writtenBytes),
                    ),
                    (currentView = new Uint8Array(2048)),
                    (writtenBytes = 0)),
                  writeToDestination(destination, chunk))
                : ((target = currentView.length - writtenBytes),
                  target < chunk.byteLength &&
                    (0 === target
                      ? writeToDestination(destination, currentView)
                      : (currentView.set(
                          chunk.subarray(0, target),
                          writtenBytes,
                        ),
                        (writtenBytes += target),
                        writeToDestination(destination, currentView),
                        (chunk = chunk.subarray(target))),
                    (currentView = new Uint8Array(2048)),
                    (writtenBytes = 0)),
                  currentView.set(chunk, writtenBytes),
                  (writtenBytes += chunk.byteLength),
                  2048 === writtenBytes &&
                    (writeToDestination(destination, currentView),
                    (currentView = new Uint8Array(2048)),
                    (writtenBytes = 0))));
          return destinationHasCapacity;
        }
        var textEncoder = new util.TextEncoder();
        function byteLengthOfChunk(chunk) {
          return 'string' === typeof chunk
            ? Buffer.byteLength(chunk, 'utf8')
            : chunk.byteLength;
        }
        var CLIENT_REFERENCE_TAG$1 = Symbol.for('react.client.reference'),
          SERVER_REFERENCE_TAG = Symbol.for('react.server.reference');
        function registerClientReferenceImpl(proxyImplementation, id, async) {
          return Object.defineProperties(proxyImplementation, {
            $$typeof: {
              value: CLIENT_REFERENCE_TAG$1,
            },
            $$id: {
              value: id,
            },
            $$async: {
              value: async,
            },
          });
        }
        var FunctionBind = Function.prototype.bind,
          ArraySlice = Array.prototype.slice;
        function bind() {
          var newFn = FunctionBind.apply(this, arguments);
          if (this.$$typeof === SERVER_REFERENCE_TAG) {
            var args = ArraySlice.call(arguments, 1),
              $$typeof = {
                value: SERVER_REFERENCE_TAG,
              },
              $$id = {
                value: this.$$id,
              };
            args = {
              value: this.$$bound ? this.$$bound.concat(args) : args,
            };
            return Object.defineProperties(newFn, {
              $$typeof: $$typeof,
              $$id: $$id,
              $$bound: args,
              bind: {
                value: bind,
                configurable: !0,
              },
            });
          }
          return newFn;
        }
        var PROMISE_PROTOTYPE = Promise.prototype,
          deepProxyHandlers = {
            get: function (target, name) {
              switch (name) {
                case '$$typeof':
                  return target.$$typeof;
                case '$$id':
                  return target.$$id;
                case '$$async':
                  return target.$$async;
                case 'name':
                  return target.name;
                case 'displayName':
                  return;
                case 'defaultProps':
                  return;
                case '_debugInfo':
                  return;
                case 'toJSON':
                  return;
                case Symbol.toPrimitive:
                  return Object.prototype[Symbol.toPrimitive];
                case Symbol.toStringTag:
                  return Object.prototype[Symbol.toStringTag];
                case 'Provider':
                  throw Error(
                    'Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.',
                  );
                case 'then':
                  throw Error(
                    'Cannot await or return from a thenable. You cannot await a client module from a server component.',
                  );
              }
              throw Error(
                'Cannot access ' +
                  (String(target.name) + '.' + String(name)) +
                  ' on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.',
              );
            },
            set: function () {
              throw Error(
                'Cannot assign to a client module from a server module.',
              );
            },
          };
        function getReference(target, name) {
          switch (name) {
            case '$$typeof':
              return target.$$typeof;
            case '$$id':
              return target.$$id;
            case '$$async':
              return target.$$async;
            case 'name':
              return target.name;
            case 'defaultProps':
              return;
            case '_debugInfo':
              return;
            case 'toJSON':
              return;
            case Symbol.toPrimitive:
              return Object.prototype[Symbol.toPrimitive];
            case Symbol.toStringTag:
              return Object.prototype[Symbol.toStringTag];
            case '__esModule':
              var moduleId = target.$$id;
              target.default = registerClientReferenceImpl(
                function () {
                  throw Error(
                    'Attempted to call the default export of ' +
                      moduleId +
                      " from the server but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
                  );
                },
                target.$$id + '#',
                target.$$async,
              );
              return !0;
            case 'then':
              if (target.then) return target.then;
              if (target.$$async) return;
              var clientReference = registerClientReferenceImpl(
                  {},
                  target.$$id,
                  !0,
                ),
                proxy = new Proxy(clientReference, proxyHandlers$1);
              target.status = 'fulfilled';
              target.value = proxy;
              return (target.then = registerClientReferenceImpl(
                function (resolve) {
                  return Promise.resolve(resolve(proxy));
                },
                target.$$id + '#then',
                !1,
              ));
          }
          if ('symbol' === typeof name)
            throw Error(
              'Cannot read Symbol exports. Only named exports are supported on a client module imported on the server.',
            );
          clientReference = target[name];
          clientReference ||
            ((clientReference = registerClientReferenceImpl(
              function () {
                throw Error(
                  'Attempted to call ' +
                    String(name) +
                    '() from the server but ' +
                    String(name) +
                    " is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
                );
              },
              target.$$id + '#' + name,
              target.$$async,
            )),
            Object.defineProperty(clientReference, 'name', {
              value: name,
            }),
            (clientReference = target[name] =
              new Proxy(clientReference, deepProxyHandlers)));
          return clientReference;
        }
        var proxyHandlers$1 = {
            get: function (target, name) {
              return getReference(target, name);
            },
            getOwnPropertyDescriptor: function (target, name) {
              var descriptor = Object.getOwnPropertyDescriptor(target, name);
              descriptor ||
                ((descriptor = {
                  value: getReference(target, name),
                  writable: !1,
                  configurable: !1,
                  enumerable: !1,
                }),
                Object.defineProperty(target, name, descriptor));
              return descriptor;
            },
            getPrototypeOf: function () {
              return PROMISE_PROTOTYPE;
            },
            set: function () {
              throw Error(
                'Cannot assign to a client module from a server module.',
              );
            },
          },
          ReactDOMSharedInternals =
            ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
          previousDispatcher = ReactDOMSharedInternals.d;
        ReactDOMSharedInternals.d = {
          f: previousDispatcher.f,
          r: previousDispatcher.r,
          D: prefetchDNS,
          C: preconnect,
          L: preload,
          m: preloadModule$1,
          X: preinitScript,
          S: preinitStyle,
          M: preinitModuleScript,
        };
        function prefetchDNS(href) {
          if ('string' === typeof href && href) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'D|' + href;
              hints.has(key) || (hints.add(key), emitHint(request, 'D', href));
            } else previousDispatcher.D(href);
          }
        }
        function preconnect(href, crossOrigin) {
          if ('string' === typeof href) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key =
                  'C|' +
                  (null == crossOrigin ? 'null' : crossOrigin) +
                  '|' +
                  href;
              hints.has(key) ||
                (hints.add(key),
                'string' === typeof crossOrigin
                  ? emitHint(request, 'C', [href, crossOrigin])
                  : emitHint(request, 'C', href));
            } else previousDispatcher.C(href, crossOrigin);
          }
        }
        function preload(href, as, options) {
          if ('string' === typeof href) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'L';
              if ('image' === as && options) {
                var imageSrcSet = options.imageSrcSet,
                  imageSizes = options.imageSizes,
                  uniquePart = '';
                'string' === typeof imageSrcSet && '' !== imageSrcSet
                  ? ((uniquePart += '[' + imageSrcSet + ']'),
                    'string' === typeof imageSizes &&
                      (uniquePart += '[' + imageSizes + ']'))
                  : (uniquePart += '[][]' + href);
                key += '[image]' + uniquePart;
              } else key += '[' + as + ']' + href;
              hints.has(key) ||
                (hints.add(key),
                (options = trimOptions(options))
                  ? emitHint(request, 'L', [href, as, options])
                  : emitHint(request, 'L', [href, as]));
            } else previousDispatcher.L(href, as, options);
          }
        }
        function preloadModule$1(href, options) {
          if ('string' === typeof href) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'm|' + href;
              if (hints.has(key)) return;
              hints.add(key);
              return (options = trimOptions(options))
                ? emitHint(request, 'm', [href, options])
                : emitHint(request, 'm', href);
            }
            previousDispatcher.m(href, options);
          }
        }
        function preinitStyle(href, precedence, options) {
          if ('string' === typeof href) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'S|' + href;
              if (hints.has(key)) return;
              hints.add(key);
              return (options = trimOptions(options))
                ? emitHint(request, 'S', [
                    href,
                    'string' === typeof precedence ? precedence : 0,
                    options,
                  ])
                : 'string' === typeof precedence
                  ? emitHint(request, 'S', [href, precedence])
                  : emitHint(request, 'S', href);
            }
            previousDispatcher.S(href, precedence, options);
          }
        }
        function preinitScript(src, options) {
          if ('string' === typeof src) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'X|' + src;
              if (hints.has(key)) return;
              hints.add(key);
              return (options = trimOptions(options))
                ? emitHint(request, 'X', [src, options])
                : emitHint(request, 'X', src);
            }
            previousDispatcher.X(src, options);
          }
        }
        function preinitModuleScript(src, options) {
          if ('string' === typeof src) {
            var request = resolveRequest();
            if (request) {
              var hints = request.hints,
                key = 'M|' + src;
              if (hints.has(key)) return;
              hints.add(key);
              return (options = trimOptions(options))
                ? emitHint(request, 'M', [src, options])
                : emitHint(request, 'M', src);
            }
            previousDispatcher.M(src, options);
          }
        }
        function trimOptions(options) {
          if (null == options) return null;
          var hasProperties = !1,
            trimmed = {},
            key;
          for (key in options)
            null != options[key] &&
              ((hasProperties = !0), (trimmed[key] = options[key]));
          return hasProperties ? trimmed : null;
        }
        function getChildFormatContext(parentContext, type, props) {
          switch (type) {
            case 'img':
              type = props.src;
              var srcSet = props.srcSet;
              if (
                !(
                  'lazy' === props.loading ||
                  (!type && !srcSet) ||
                  ('string' !== typeof type && null != type) ||
                  ('string' !== typeof srcSet && null != srcSet) ||
                  'low' === props.fetchPriority ||
                  parentContext & 3
                ) &&
                ('string' !== typeof type ||
                  ':' !== type[4] ||
                  ('d' !== type[0] && 'D' !== type[0]) ||
                  ('a' !== type[1] && 'A' !== type[1]) ||
                  ('t' !== type[2] && 'T' !== type[2]) ||
                  ('a' !== type[3] && 'A' !== type[3])) &&
                ('string' !== typeof srcSet ||
                  ':' !== srcSet[4] ||
                  ('d' !== srcSet[0] && 'D' !== srcSet[0]) ||
                  ('a' !== srcSet[1] && 'A' !== srcSet[1]) ||
                  ('t' !== srcSet[2] && 'T' !== srcSet[2]) ||
                  ('a' !== srcSet[3] && 'A' !== srcSet[3]))
              ) {
                var sizes =
                  'string' === typeof props.sizes ? props.sizes : void 0;
                var input = props.crossOrigin;
                preload(type || '', 'image', {
                  imageSrcSet: srcSet,
                  imageSizes: sizes,
                  crossOrigin:
                    'string' === typeof input
                      ? 'use-credentials' === input
                        ? input
                        : ''
                      : void 0,
                  integrity: props.integrity,
                  type: props.type,
                  fetchPriority: props.fetchPriority,
                  referrerPolicy: props.referrerPolicy,
                });
              }
              return parentContext;
            case 'link':
              type = props.rel;
              srcSet = props.href;
              if (
                !(
                  parentContext & 1 ||
                  null != props.itemProp ||
                  'string' !== typeof type ||
                  'string' !== typeof srcSet ||
                  '' === srcSet
                )
              )
                switch (type) {
                  case 'preload':
                    preload(srcSet, props.as, {
                      crossOrigin: props.crossOrigin,
                      integrity: props.integrity,
                      nonce: props.nonce,
                      type: props.type,
                      fetchPriority: props.fetchPriority,
                      referrerPolicy: props.referrerPolicy,
                      imageSrcSet: props.imageSrcSet,
                      imageSizes: props.imageSizes,
                      media: props.media,
                    });
                    break;
                  case 'modulepreload':
                    preloadModule$1(srcSet, {
                      as: props.as,
                      crossOrigin: props.crossOrigin,
                      integrity: props.integrity,
                      nonce: props.nonce,
                    });
                    break;
                  case 'stylesheet':
                    preload(srcSet, 'stylesheet', {
                      crossOrigin: props.crossOrigin,
                      integrity: props.integrity,
                      nonce: props.nonce,
                      type: props.type,
                      fetchPriority: props.fetchPriority,
                      referrerPolicy: props.referrerPolicy,
                      media: props.media,
                    });
                }
              return parentContext;
            case 'picture':
              return parentContext | 2;
            case 'noscript':
              return parentContext | 1;
            default:
              return parentContext;
          }
        }
        var requestStorage = new async_hooks.AsyncLocalStorage(),
          TEMPORARY_REFERENCE_TAG = Symbol.for('react.temporary.reference'),
          proxyHandlers = {
            get: function (target, name) {
              switch (name) {
                case '$$typeof':
                  return target.$$typeof;
                case 'name':
                  return;
                case 'displayName':
                  return;
                case 'defaultProps':
                  return;
                case '_debugInfo':
                  return;
                case 'toJSON':
                  return;
                case Symbol.toPrimitive:
                  return Object.prototype[Symbol.toPrimitive];
                case Symbol.toStringTag:
                  return Object.prototype[Symbol.toStringTag];
                case 'Provider':
                  throw Error(
                    'Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.',
                  );
                case 'then':
                  return;
              }
              throw Error(
                'Cannot access ' +
                  String(name) +
                  ' on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.',
              );
            },
            set: function () {
              throw Error(
                'Cannot assign to a temporary client reference from a server module.',
              );
            },
          };
        function createTemporaryReference(temporaryReferences, id) {
          var reference = Object.defineProperties(
            function () {
              throw Error(
                "Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            {
              $$typeof: {
                value: TEMPORARY_REFERENCE_TAG,
              },
            },
          );
          reference = new Proxy(reference, proxyHandlers);
          temporaryReferences.set(reference, id);
          return reference;
        }
        function noop() {}
        var SuspenseException = Error(
          "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.",
        );
        function trackUsedThenable(thenableState, thenable, index) {
          index = thenableState[index];
          void 0 === index
            ? thenableState.push(thenable)
            : index !== thenable &&
              (thenable.then(noop, noop), (thenable = index));
          switch (thenable.status) {
            case 'fulfilled':
              return thenable.value;
            case 'rejected':
              throw thenable.reason;
            default:
              'string' === typeof thenable.status
                ? thenable.then(noop, noop)
                : ((thenableState = thenable),
                  (thenableState.status = 'pending'),
                  thenableState.then(
                    function (fulfilledValue) {
                      if ('pending' === thenable.status) {
                        var fulfilledThenable = thenable;
                        fulfilledThenable.status = 'fulfilled';
                        fulfilledThenable.value = fulfilledValue;
                      }
                    },
                    function (error) {
                      if ('pending' === thenable.status) {
                        var rejectedThenable = thenable;
                        rejectedThenable.status = 'rejected';
                        rejectedThenable.reason = error;
                      }
                    },
                  ));
              switch (thenable.status) {
                case 'fulfilled':
                  return thenable.value;
                case 'rejected':
                  throw thenable.reason;
              }
              suspendedThenable = thenable;
              throw SuspenseException;
          }
        }
        var suspendedThenable = null;
        function getSuspendedThenable() {
          if (null === suspendedThenable)
            throw Error(
              'Expected a suspended thenable. This is a bug in React. Please file an issue.',
            );
          var thenable = suspendedThenable;
          suspendedThenable = null;
          return thenable;
        }
        var currentRequest$1 = null,
          thenableIndexCounter = 0,
          thenableState = null;
        function getThenableStateAfterSuspending() {
          var state = thenableState || [];
          thenableState = null;
          return state;
        }
        var HooksDispatcher = {
          readContext: unsupportedContext,
          use: use,
          useCallback: function (callback) {
            return callback;
          },
          useContext: unsupportedContext,
          useEffect: unsupportedHook,
          useImperativeHandle: unsupportedHook,
          useLayoutEffect: unsupportedHook,
          useInsertionEffect: unsupportedHook,
          useMemo: function (nextCreate) {
            return nextCreate();
          },
          useReducer: unsupportedHook,
          useRef: unsupportedHook,
          useState: unsupportedHook,
          useDebugValue: function () {},
          useDeferredValue: unsupportedHook,
          useTransition: unsupportedHook,
          useSyncExternalStore: unsupportedHook,
          useId: useId,
          useHostTransitionStatus: unsupportedHook,
          useFormState: unsupportedHook,
          useActionState: unsupportedHook,
          useOptimistic: unsupportedHook,
          useMemoCache: function (size) {
            for (var data = Array(size), i = 0; i < size; i++)
              data[i] = REACT_MEMO_CACHE_SENTINEL;
            return data;
          },
          useCacheRefresh: function () {
            return unsupportedRefresh;
          },
        };
        HooksDispatcher.useEffectEvent = unsupportedHook;
        function unsupportedHook() {
          throw Error('This Hook is not supported in Server Components.');
        }
        function unsupportedRefresh() {
          throw Error(
            'Refreshing the cache is not supported in Server Components.',
          );
        }
        function unsupportedContext() {
          throw Error('Cannot read a Client Context from a Server Component.');
        }
        function useId() {
          if (null === currentRequest$1)
            throw Error('useId can only be used while React is rendering');
          var id = currentRequest$1.identifierCount++;
          return (
            '_' +
            currentRequest$1.identifierPrefix +
            'S_' +
            id.toString(32) +
            '_'
          );
        }
        function use(usable) {
          if (
            (null !== usable && 'object' === typeof usable) ||
            'function' === typeof usable
          ) {
            if ('function' === typeof usable.then) {
              var index = thenableIndexCounter;
              thenableIndexCounter += 1;
              null === thenableState && (thenableState = []);
              return trackUsedThenable(thenableState, usable, index);
            }
            usable.$$typeof === REACT_CONTEXT_TYPE && unsupportedContext();
          }
          if (usable.$$typeof === CLIENT_REFERENCE_TAG$1) {
            if (
              null != usable.value &&
              usable.value.$$typeof === REACT_CONTEXT_TYPE
            )
              throw Error(
                'Cannot read a Client Context from a Server Component.',
              );
            throw Error('Cannot use() an already resolved Client Reference.');
          }
          throw Error(
            'An unsupported type was passed to use(): ' + String(usable),
          );
        }
        var DefaultAsyncDispatcher = {
            getCacheForType: function (resourceType) {
              var JSCompiler_inline_result = (JSCompiler_inline_result =
                resolveRequest())
                ? JSCompiler_inline_result.cache
                : new Map();
              var entry = JSCompiler_inline_result.get(resourceType);
              void 0 === entry &&
                ((entry = resourceType()),
                JSCompiler_inline_result.set(resourceType, entry));
              return entry;
            },
            cacheSignal: function () {
              var request = resolveRequest();
              return request ? request.cacheController.signal : null;
            },
          },
          ReactSharedInternalsServer =
            React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
        if (!ReactSharedInternalsServer)
          throw Error(
            'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.',
          );
        var isArrayImpl = Array.isArray,
          getPrototypeOf = Object.getPrototypeOf;
        function objectName(object) {
          object = Object.prototype.toString.call(object);
          return object.slice(8, object.length - 1);
        }
        function describeValueForErrorMessage(value) {
          switch (typeof value) {
            case 'string':
              return JSON.stringify(
                10 >= value.length ? value : value.slice(0, 10) + '...',
              );
            case 'object':
              if (isArrayImpl(value)) return '[...]';
              if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG)
                return 'client';
              value = objectName(value);
              return 'Object' === value ? '{...}' : value;
            case 'function':
              return value.$$typeof === CLIENT_REFERENCE_TAG
                ? 'client'
                : (value = value.displayName || value.name)
                  ? 'function ' + value
                  : 'function';
            default:
              return String(value);
          }
        }
        function describeElementType(type) {
          if ('string' === typeof type) return type;
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return 'Suspense';
            case REACT_SUSPENSE_LIST_TYPE:
              return 'SuspenseList';
          }
          if ('object' === typeof type)
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeElementType(type.render);
              case REACT_MEMO_TYPE:
                return describeElementType(type.type);
              case REACT_LAZY_TYPE:
                var payload = type._payload;
                type = type._init;
                try {
                  return describeElementType(type(payload));
                } catch (x) {}
            }
          return '';
        }
        var CLIENT_REFERENCE_TAG = Symbol.for('react.client.reference');
        function describeObjectForErrorMessage(objectOrArray, expandedName) {
          var objKind = objectName(objectOrArray);
          if ('Object' !== objKind && 'Array' !== objKind) return objKind;
          objKind = -1;
          var length = 0;
          if (isArrayImpl(objectOrArray)) {
            var str = '[';
            for (var i = 0; i < objectOrArray.length; i++) {
              0 < i && (str += ', ');
              var value = objectOrArray[i];
              value =
                'object' === typeof value && null !== value
                  ? describeObjectForErrorMessage(value)
                  : describeValueForErrorMessage(value);
              '' + i === expandedName
                ? ((objKind = str.length),
                  (length = value.length),
                  (str += value))
                : (str =
                    10 > value.length && 40 > str.length + value.length
                      ? str + value
                      : str + '...');
            }
            str += ']';
          } else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE)
            str = '<' + describeElementType(objectOrArray.type) + '/>';
          else {
            if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG)
              return 'client';
            str = '{';
            i = Object.keys(objectOrArray);
            for (value = 0; value < i.length; value++) {
              0 < value && (str += ', ');
              var name = i[value],
                encodedKey = JSON.stringify(name);
              str +=
                ('"' + name + '"' === encodedKey ? name : encodedKey) + ': ';
              encodedKey = objectOrArray[name];
              encodedKey =
                'object' === typeof encodedKey && null !== encodedKey
                  ? describeObjectForErrorMessage(encodedKey)
                  : describeValueForErrorMessage(encodedKey);
              name === expandedName
                ? ((objKind = str.length),
                  (length = encodedKey.length),
                  (str += encodedKey))
                : (str =
                    10 > encodedKey.length &&
                    40 > str.length + encodedKey.length
                      ? str + encodedKey
                      : str + '...');
            }
            str += '}';
          }
          return void 0 === expandedName
            ? str
            : -1 < objKind && 0 < length
              ? ((objectOrArray = ' '.repeat(objKind) + '^'.repeat(length)),
                '\n  ' + str + '\n  ' + objectOrArray)
              : '\n  ' + str;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty,
          ObjectPrototype = Object.prototype,
          stringify = JSON.stringify;
        function defaultErrorHandler(error) {
          console.error(error);
        }
        function RequestInstance(
          type,
          model,
          bundlerConfig,
          onError,
          onPostpone,
          onAllReady,
          onFatalError,
          identifierPrefix,
          temporaryReferences,
        ) {
          if (
            null !== ReactSharedInternalsServer.A &&
            ReactSharedInternalsServer.A !== DefaultAsyncDispatcher
          )
            throw Error(
              'Currently React only supports one RSC renderer at a time.',
            );
          ReactSharedInternalsServer.A = DefaultAsyncDispatcher;
          var abortSet = new Set(),
            pingedTasks = [],
            hints = new Set();
          this.type = type;
          this.status = 10;
          this.flushScheduled = !1;
          this.destination = this.fatalError = null;
          this.bundlerConfig = bundlerConfig;
          this.cache = new Map();
          this.cacheController = new AbortController();
          this.pendingChunks = this.nextChunkId = 0;
          this.hints = hints;
          this.abortableTasks = abortSet;
          this.pingedTasks = pingedTasks;
          this.completedImportChunks = [];
          this.completedHintChunks = [];
          this.completedRegularChunks = [];
          this.completedErrorChunks = [];
          this.writtenSymbols = new Map();
          this.writtenClientReferences = new Map();
          this.writtenServerReferences = new Map();
          this.writtenObjects = new WeakMap();
          this.temporaryReferences = temporaryReferences;
          this.identifierPrefix = identifierPrefix || '';
          this.identifierCount = 1;
          this.taintCleanupQueue = [];
          this.onError = void 0 === onError ? defaultErrorHandler : onError;
          this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
          this.onAllReady = onAllReady;
          this.onFatalError = onFatalError;
          type = createTask(this, model, null, !1, 0, abortSet);
          pingedTasks.push(type);
        }
        var currentRequest = null;
        function resolveRequest() {
          if (currentRequest) return currentRequest;
          var store = requestStorage.getStore();
          return store ? store : null;
        }
        function serializeThenable(request, task, thenable) {
          var newTask = createTask(
            request,
            thenable,
            task.keyPath,
            task.implicitSlot,
            task.formatContext,
            request.abortableTasks,
          );
          switch (thenable.status) {
            case 'fulfilled':
              return (
                (newTask.model = thenable.value),
                pingTask(request, newTask),
                newTask.id
              );
            case 'rejected':
              return erroredTask(request, newTask, thenable.reason), newTask.id;
            default:
              if (12 === request.status)
                return (
                  request.abortableTasks.delete(newTask),
                  21 === request.type
                    ? (haltTask(newTask), finishHaltedTask(newTask, request))
                    : ((task = request.fatalError),
                      abortTask(newTask),
                      finishAbortedTask(newTask, request, task)),
                  newTask.id
                );
              'string' !== typeof thenable.status &&
                ((thenable.status = 'pending'),
                thenable.then(
                  function (fulfilledValue) {
                    'pending' === thenable.status &&
                      ((thenable.status = 'fulfilled'),
                      (thenable.value = fulfilledValue));
                  },
                  function (error) {
                    'pending' === thenable.status &&
                      ((thenable.status = 'rejected'),
                      (thenable.reason = error));
                  },
                ));
          }
          thenable.then(
            function (value) {
              newTask.model = value;
              pingTask(request, newTask);
            },
            function (reason) {
              0 === newTask.status &&
                (erroredTask(request, newTask, reason), enqueueFlush(request));
            },
          );
          return newTask.id;
        }
        function serializeReadableStream(request, task, stream) {
          function progress(entry) {
            if (0 === streamTask.status)
              if (entry.done)
                (streamTask.status = 1),
                  (entry = streamTask.id.toString(16) + ':C\n'),
                  request.completedRegularChunks.push(entry),
                  request.abortableTasks.delete(streamTask),
                  request.cacheController.signal.removeEventListener(
                    'abort',
                    abortStream,
                  ),
                  enqueueFlush(request),
                  callOnAllReadyIfReady(request);
              else
                try {
                  (streamTask.model = entry.value),
                    request.pendingChunks++,
                    tryStreamTask(request, streamTask),
                    enqueueFlush(request),
                    reader.read().then(progress, error);
                } catch (x$8) {
                  error(x$8);
                }
          }
          function error(reason) {
            0 === streamTask.status &&
              (request.cacheController.signal.removeEventListener(
                'abort',
                abortStream,
              ),
              erroredTask(request, streamTask, reason),
              enqueueFlush(request),
              reader.cancel(reason).then(error, error));
          }
          function abortStream() {
            if (0 === streamTask.status) {
              var signal = request.cacheController.signal;
              signal.removeEventListener('abort', abortStream);
              signal = signal.reason;
              21 === request.type
                ? (request.abortableTasks.delete(streamTask),
                  haltTask(streamTask),
                  finishHaltedTask(streamTask, request))
                : (erroredTask(request, streamTask, signal),
                  enqueueFlush(request));
              reader.cancel(signal).then(error, error);
            }
          }
          var supportsBYOB = stream.supportsBYOB;
          if (void 0 === supportsBYOB)
            try {
              stream
                .getReader({
                  mode: 'byob',
                })
                .releaseLock(),
                (supportsBYOB = !0);
            } catch (x) {
              supportsBYOB = !1;
            }
          var reader = stream.getReader(),
            streamTask = createTask(
              request,
              task.model,
              task.keyPath,
              task.implicitSlot,
              task.formatContext,
              request.abortableTasks,
            );
          request.pendingChunks++;
          task =
            streamTask.id.toString(16) +
            ':' +
            (supportsBYOB ? 'r' : 'R') +
            '\n';
          request.completedRegularChunks.push(task);
          request.cacheController.signal.addEventListener('abort', abortStream);
          reader.read().then(progress, error);
          return serializeByValueID(streamTask.id);
        }
        function serializeAsyncIterable(request, task, iterable, iterator) {
          function progress(entry) {
            if (0 === streamTask.status)
              if (entry.done) {
                streamTask.status = 1;
                if (void 0 === entry.value)
                  var endStreamRow = streamTask.id.toString(16) + ':C\n';
                else
                  try {
                    var chunkId = outlineModelWithFormatContext(
                      request,
                      entry.value,
                      0,
                    );
                    endStreamRow =
                      streamTask.id.toString(16) +
                      ':C' +
                      stringify(serializeByValueID(chunkId)) +
                      '\n';
                  } catch (x) {
                    error(x);
                    return;
                  }
                request.completedRegularChunks.push(endStreamRow);
                request.abortableTasks.delete(streamTask);
                request.cacheController.signal.removeEventListener(
                  'abort',
                  abortIterable,
                );
                enqueueFlush(request);
                callOnAllReadyIfReady(request);
              } else
                try {
                  (streamTask.model = entry.value),
                    request.pendingChunks++,
                    tryStreamTask(request, streamTask),
                    enqueueFlush(request),
                    iterator.next().then(progress, error);
                } catch (x$9) {
                  error(x$9);
                }
          }
          function error(reason) {
            0 === streamTask.status &&
              (request.cacheController.signal.removeEventListener(
                'abort',
                abortIterable,
              ),
              erroredTask(request, streamTask, reason),
              enqueueFlush(request),
              'function' === typeof iterator.throw &&
                iterator.throw(reason).then(error, error));
          }
          function abortIterable() {
            if (0 === streamTask.status) {
              var signal = request.cacheController.signal;
              signal.removeEventListener('abort', abortIterable);
              var reason = signal.reason;
              21 === request.type
                ? (request.abortableTasks.delete(streamTask),
                  haltTask(streamTask),
                  finishHaltedTask(streamTask, request))
                : (erroredTask(request, streamTask, signal.reason),
                  enqueueFlush(request));
              'function' === typeof iterator.throw &&
                iterator.throw(reason).then(error, error);
            }
          }
          iterable = iterable === iterator;
          var streamTask = createTask(
            request,
            task.model,
            task.keyPath,
            task.implicitSlot,
            task.formatContext,
            request.abortableTasks,
          );
          request.pendingChunks++;
          task =
            streamTask.id.toString(16) + ':' + (iterable ? 'x' : 'X') + '\n';
          request.completedRegularChunks.push(task);
          request.cacheController.signal.addEventListener(
            'abort',
            abortIterable,
          );
          iterator.next().then(progress, error);
          return serializeByValueID(streamTask.id);
        }
        function emitHint(request, code, model) {
          model = stringify(model);
          request.completedHintChunks.push(':H' + code + model + '\n');
          enqueueFlush(request);
        }
        function readThenable(thenable) {
          if ('fulfilled' === thenable.status) return thenable.value;
          if ('rejected' === thenable.status) throw thenable.reason;
          throw thenable;
        }
        function createLazyWrapperAroundWakeable(request, task, wakeable) {
          switch (wakeable.status) {
            case 'fulfilled':
              return wakeable.value;
            case 'rejected':
              break;
            default:
              'string' !== typeof wakeable.status &&
                ((wakeable.status = 'pending'),
                wakeable.then(
                  function (fulfilledValue) {
                    'pending' === wakeable.status &&
                      ((wakeable.status = 'fulfilled'),
                      (wakeable.value = fulfilledValue));
                  },
                  function (error) {
                    'pending' === wakeable.status &&
                      ((wakeable.status = 'rejected'),
                      (wakeable.reason = error));
                  },
                ));
          }
          return {
            $$typeof: REACT_LAZY_TYPE,
            _payload: wakeable,
            _init: readThenable,
          };
        }
        function voidHandler() {}
        function processServerComponentReturnValue(
          request,
          task,
          Component,
          result,
        ) {
          if (
            'object' !== typeof result ||
            null === result ||
            result.$$typeof === CLIENT_REFERENCE_TAG$1
          )
            return result;
          if ('function' === typeof result.then)
            return createLazyWrapperAroundWakeable(request, task, result);
          var iteratorFn = getIteratorFn(result);
          return iteratorFn
            ? ((request = {}),
              (request[Symbol.iterator] = function () {
                return iteratorFn.call(result);
              }),
              request)
            : 'function' !== typeof result[ASYNC_ITERATOR] ||
                ('function' === typeof ReadableStream &&
                  result instanceof ReadableStream)
              ? result
              : ((request = {}),
                (request[ASYNC_ITERATOR] = function () {
                  return result[ASYNC_ITERATOR]();
                }),
                request);
        }
        function renderFunctionComponent(request, task, key, Component, props) {
          var prevThenableState = task.thenableState;
          task.thenableState = null;
          thenableIndexCounter = 0;
          thenableState = prevThenableState;
          props = Component(props, void 0);
          if (12 === request.status)
            throw (
              ('object' === typeof props &&
                null !== props &&
                'function' === typeof props.then &&
                props.$$typeof !== CLIENT_REFERENCE_TAG$1 &&
                props.then(voidHandler, voidHandler),
              null)
            );
          props = processServerComponentReturnValue(
            request,
            task,
            Component,
            props,
          );
          Component = task.keyPath;
          prevThenableState = task.implicitSlot;
          null !== key
            ? (task.keyPath = null === Component ? key : Component + ',' + key)
            : null === Component && (task.implicitSlot = !0);
          request = renderModelDestructive(request, task, emptyRoot, '', props);
          task.keyPath = Component;
          task.implicitSlot = prevThenableState;
          return request;
        }
        function renderFragment(request, task, children) {
          return null !== task.keyPath
            ? ((request = [
                REACT_ELEMENT_TYPE,
                REACT_FRAGMENT_TYPE,
                task.keyPath,
                {
                  children: children,
                },
              ]),
              task.implicitSlot ? [request] : request)
            : children;
        }
        var serializedSize = 0;
        function deferTask(request, task) {
          task = createTask(
            request,
            task.model,
            task.keyPath,
            task.implicitSlot,
            task.formatContext,
            request.abortableTasks,
          );
          pingTask(request, task);
          return serializeLazyID(task.id);
        }
        function renderElement(request, task, type, key, ref, props) {
          if (null !== ref && void 0 !== ref)
            throw Error(
              'Refs cannot be used in Server Components, nor passed to Client Components.',
            );
          if (
            'function' === typeof type &&
            type.$$typeof !== CLIENT_REFERENCE_TAG$1 &&
            type.$$typeof !== TEMPORARY_REFERENCE_TAG
          )
            return renderFunctionComponent(request, task, key, type, props);
          if (type === REACT_FRAGMENT_TYPE && null === key)
            return (
              (type = task.implicitSlot),
              null === task.keyPath && (task.implicitSlot = !0),
              (props = renderModelDestructive(
                request,
                task,
                emptyRoot,
                '',
                props.children,
              )),
              (task.implicitSlot = type),
              props
            );
          if (
            null != type &&
            'object' === typeof type &&
            type.$$typeof !== CLIENT_REFERENCE_TAG$1
          )
            switch (type.$$typeof) {
              case REACT_LAZY_TYPE:
                var init = type._init;
                type = init(type._payload);
                if (12 === request.status) throw null;
                return renderElement(request, task, type, key, ref, props);
              case REACT_FORWARD_REF_TYPE:
                return renderFunctionComponent(
                  request,
                  task,
                  key,
                  type.render,
                  props,
                );
              case REACT_MEMO_TYPE:
                return renderElement(request, task, type.type, key, ref, props);
            }
          else
            'string' === typeof type &&
              ((ref = task.formatContext),
              (init = getChildFormatContext(ref, type, props)),
              ref !== init &&
                null != props.children &&
                outlineModelWithFormatContext(request, props.children, init));
          request = key;
          key = task.keyPath;
          null === request
            ? (request = key)
            : null !== key && (request = key + ',' + request);
          props = [REACT_ELEMENT_TYPE, type, request, props];
          task = task.implicitSlot && null !== request ? [props] : props;
          return task;
        }
        function pingTask(request, task) {
          var pingedTasks = request.pingedTasks;
          pingedTasks.push(task);
          1 === pingedTasks.length &&
            ((request.flushScheduled = null !== request.destination),
            21 === request.type || 10 === request.status
              ? scheduleMicrotask(function () {
                  return performWork(request);
                })
              : setImmediate(function () {
                  return performWork(request);
                }));
        }
        function createTask(
          request,
          model,
          keyPath,
          implicitSlot,
          formatContext,
          abortSet,
        ) {
          request.pendingChunks++;
          var id = request.nextChunkId++;
          'object' !== typeof model ||
            null === model ||
            null !== keyPath ||
            implicitSlot ||
            request.writtenObjects.set(model, serializeByValueID(id));
          var task = {
            id: id,
            status: 0,
            model: model,
            keyPath: keyPath,
            implicitSlot: implicitSlot,
            formatContext: formatContext,
            ping: function () {
              return pingTask(request, task);
            },
            toJSON: function (parentPropertyName, value) {
              serializedSize += parentPropertyName.length;
              var prevKeyPath = task.keyPath,
                prevImplicitSlot = task.implicitSlot;
              try {
                var JSCompiler_inline_result = renderModelDestructive(
                  request,
                  task,
                  this,
                  parentPropertyName,
                  value,
                );
              } catch (thrownValue) {
                if (
                  ((parentPropertyName = task.model),
                  (parentPropertyName =
                    'object' === typeof parentPropertyName &&
                    null !== parentPropertyName &&
                    (parentPropertyName.$$typeof === REACT_ELEMENT_TYPE ||
                      parentPropertyName.$$typeof === REACT_LAZY_TYPE)),
                  12 === request.status)
                )
                  (task.status = 3),
                    21 === request.type
                      ? ((prevKeyPath = request.nextChunkId++),
                        (prevKeyPath = parentPropertyName
                          ? serializeLazyID(prevKeyPath)
                          : serializeByValueID(prevKeyPath)),
                        (JSCompiler_inline_result = prevKeyPath))
                      : ((prevKeyPath = request.fatalError),
                        (JSCompiler_inline_result = parentPropertyName
                          ? serializeLazyID(prevKeyPath)
                          : serializeByValueID(prevKeyPath)));
                else if (
                  ((value =
                    thrownValue === SuspenseException
                      ? getSuspendedThenable()
                      : thrownValue),
                  'object' === typeof value &&
                    null !== value &&
                    'function' === typeof value.then)
                ) {
                  JSCompiler_inline_result = createTask(
                    request,
                    task.model,
                    task.keyPath,
                    task.implicitSlot,
                    task.formatContext,
                    request.abortableTasks,
                  );
                  var ping = JSCompiler_inline_result.ping;
                  value.then(ping, ping);
                  JSCompiler_inline_result.thenableState =
                    getThenableStateAfterSuspending();
                  task.keyPath = prevKeyPath;
                  task.implicitSlot = prevImplicitSlot;
                  JSCompiler_inline_result = parentPropertyName
                    ? serializeLazyID(JSCompiler_inline_result.id)
                    : serializeByValueID(JSCompiler_inline_result.id);
                } else
                  (task.keyPath = prevKeyPath),
                    (task.implicitSlot = prevImplicitSlot),
                    request.pendingChunks++,
                    (prevKeyPath = request.nextChunkId++),
                    (prevImplicitSlot = logRecoverableError(
                      request,
                      value,
                      task,
                    )),
                    emitErrorChunk(request, prevKeyPath, prevImplicitSlot),
                    (JSCompiler_inline_result = parentPropertyName
                      ? serializeLazyID(prevKeyPath)
                      : serializeByValueID(prevKeyPath));
              }
              return JSCompiler_inline_result;
            },
            thenableState: null,
          };
          abortSet.add(task);
          return task;
        }
        function serializeByValueID(id) {
          return '$' + id.toString(16);
        }
        function serializeLazyID(id) {
          return '$L' + id.toString(16);
        }
        function encodeReferenceChunk(request, id, reference) {
          request = stringify(reference);
          return id.toString(16) + ':' + request + '\n';
        }
        function serializeClientReference(
          request,
          parent,
          parentPropertyName,
          clientReference,
        ) {
          var clientReferenceKey = clientReference.$$async
              ? clientReference.$$id + '#async'
              : clientReference.$$id,
            writtenClientReferences = request.writtenClientReferences,
            existingId = writtenClientReferences.get(clientReferenceKey);
          if (void 0 !== existingId)
            return parent[0] === REACT_ELEMENT_TYPE &&
              '1' === parentPropertyName
              ? serializeLazyID(existingId)
              : serializeByValueID(existingId);
          try {
            var config = request.bundlerConfig,
              modulePath = clientReference.$$id;
            existingId = '';
            var resolvedModuleData = config[modulePath];
            if (resolvedModuleData) existingId = resolvedModuleData.name;
            else {
              var idx = modulePath.lastIndexOf('#');
              -1 !== idx &&
                ((existingId = modulePath.slice(idx + 1)),
                (resolvedModuleData = config[modulePath.slice(0, idx)]));
              if (!resolvedModuleData)
                throw Error(
                  'Could not find the module "' +
                    modulePath +
                    '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.',
                );
            }
            if (
              !0 === resolvedModuleData.async &&
              !0 === clientReference.$$async
            )
              throw Error(
                'The module "' +
                  modulePath +
                  '" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.',
              );
            var JSCompiler_inline_result =
              !0 === resolvedModuleData.async || !0 === clientReference.$$async
                ? [
                    resolvedModuleData.id,
                    resolvedModuleData.chunks,
                    existingId,
                    1,
                  ]
                : [
                    resolvedModuleData.id,
                    resolvedModuleData.chunks,
                    existingId,
                  ];
            request.pendingChunks++;
            var importId = request.nextChunkId++,
              json = stringify(JSCompiler_inline_result),
              processedChunk = importId.toString(16) + ':I' + json + '\n';
            request.completedImportChunks.push(processedChunk);
            writtenClientReferences.set(clientReferenceKey, importId);
            return parent[0] === REACT_ELEMENT_TYPE &&
              '1' === parentPropertyName
              ? serializeLazyID(importId)
              : serializeByValueID(importId);
          } catch (x) {
            return (
              request.pendingChunks++,
              (parent = request.nextChunkId++),
              (parentPropertyName = logRecoverableError(request, x, null)),
              emitErrorChunk(request, parent, parentPropertyName),
              serializeByValueID(parent)
            );
          }
        }
        function outlineModelWithFormatContext(request, value, formatContext) {
          value = createTask(
            request,
            value,
            null,
            !1,
            formatContext,
            request.abortableTasks,
          );
          retryTask(request, value);
          return value.id;
        }
        function serializeTypedArray(request, tag, typedArray) {
          request.pendingChunks++;
          var bufferId = request.nextChunkId++;
          emitTypedArrayChunk(request, bufferId, tag, typedArray, !1);
          return serializeByValueID(bufferId);
        }
        function serializeBlob(request, blob) {
          function progress(entry) {
            if (0 === newTask.status)
              if (entry.done)
                request.cacheController.signal.removeEventListener(
                  'abort',
                  abortBlob,
                ),
                  pingTask(request, newTask);
              else
                return (
                  model.push(entry.value),
                  reader.read().then(progress).catch(error)
                );
          }
          function error(reason) {
            0 === newTask.status &&
              (request.cacheController.signal.removeEventListener(
                'abort',
                abortBlob,
              ),
              erroredTask(request, newTask, reason),
              enqueueFlush(request),
              reader.cancel(reason).then(error, error));
          }
          function abortBlob() {
            if (0 === newTask.status) {
              var signal = request.cacheController.signal;
              signal.removeEventListener('abort', abortBlob);
              signal = signal.reason;
              21 === request.type
                ? (request.abortableTasks.delete(newTask),
                  haltTask(newTask),
                  finishHaltedTask(newTask, request))
                : (erroredTask(request, newTask, signal),
                  enqueueFlush(request));
              reader.cancel(signal).then(error, error);
            }
          }
          var model = [blob.type],
            newTask = createTask(
              request,
              model,
              null,
              !1,
              0,
              request.abortableTasks,
            ),
            reader = blob.stream().getReader();
          request.cacheController.signal.addEventListener('abort', abortBlob);
          reader.read().then(progress).catch(error);
          return '$B' + newTask.id.toString(16);
        }
        var modelRoot = !1;
        function renderModelDestructive(
          request,
          task,
          parent,
          parentPropertyName,
          value,
        ) {
          task.model = value;
          if (value === REACT_ELEMENT_TYPE) return '$';
          if (null === value) return null;
          if ('object' === typeof value) {
            switch (value.$$typeof) {
              case REACT_ELEMENT_TYPE:
                var elementReference = null,
                  writtenObjects = request.writtenObjects;
                if (null === task.keyPath && !task.implicitSlot) {
                  var existingReference = writtenObjects.get(value);
                  if (void 0 !== existingReference) {
                    if (modelRoot === value) modelRoot = null;
                    else return existingReference;
                  } else
                    -1 === parentPropertyName.indexOf(':') &&
                      ((parent = writtenObjects.get(parent)),
                      void 0 !== parent &&
                        ((elementReference = parent + ':' + parentPropertyName),
                        writtenObjects.set(value, elementReference)));
                }
                if (3200 < serializedSize) return deferTask(request, task);
                parentPropertyName = value.props;
                parent = parentPropertyName.ref;
                request = renderElement(
                  request,
                  task,
                  value.type,
                  value.key,
                  void 0 !== parent ? parent : null,
                  parentPropertyName,
                );
                'object' === typeof request &&
                  null !== request &&
                  null !== elementReference &&
                  (writtenObjects.has(request) ||
                    writtenObjects.set(request, elementReference));
                return request;
              case REACT_LAZY_TYPE:
                if (3200 < serializedSize) return deferTask(request, task);
                task.thenableState = null;
                parentPropertyName = value._init;
                value = parentPropertyName(value._payload);
                if (12 === request.status) throw null;
                return renderModelDestructive(
                  request,
                  task,
                  emptyRoot,
                  '',
                  value,
                );
              case REACT_LEGACY_ELEMENT_TYPE:
                throw Error(
                  'A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the "react" package is used.\n- A library pre-bundled an old copy of "react" or "react/jsx-runtime".\n- A compiler tries to "inline" JSX instead of using the runtime.',
                );
            }
            if (value.$$typeof === CLIENT_REFERENCE_TAG$1)
              return serializeClientReference(
                request,
                parent,
                parentPropertyName,
                value,
              );
            if (
              void 0 !== request.temporaryReferences &&
              ((elementReference = request.temporaryReferences.get(value)),
              void 0 !== elementReference)
            )
              return '$T' + elementReference;
            elementReference = request.writtenObjects;
            writtenObjects = elementReference.get(value);
            if ('function' === typeof value.then) {
              if (void 0 !== writtenObjects) {
                if (null !== task.keyPath || task.implicitSlot)
                  return (
                    '$@' + serializeThenable(request, task, value).toString(16)
                  );
                if (modelRoot === value) modelRoot = null;
                else return writtenObjects;
              }
              request =
                '$@' + serializeThenable(request, task, value).toString(16);
              elementReference.set(value, request);
              return request;
            }
            if (void 0 !== writtenObjects) {
              if (modelRoot === value) {
                if (writtenObjects !== serializeByValueID(task.id))
                  return writtenObjects;
                modelRoot = null;
              } else return writtenObjects;
            } else if (
              -1 === parentPropertyName.indexOf(':') &&
              ((writtenObjects = elementReference.get(parent)),
              void 0 !== writtenObjects)
            ) {
              existingReference = parentPropertyName;
              if (isArrayImpl(parent) && parent[0] === REACT_ELEMENT_TYPE)
                switch (parentPropertyName) {
                  case '1':
                    existingReference = 'type';
                    break;
                  case '2':
                    existingReference = 'key';
                    break;
                  case '3':
                    existingReference = 'props';
                    break;
                  case '4':
                    existingReference = '_owner';
                }
              elementReference.set(
                value,
                writtenObjects + ':' + existingReference,
              );
            }
            if (isArrayImpl(value)) return renderFragment(request, task, value);
            if (value instanceof Map)
              return (
                (value = Array.from(value)),
                '$Q' +
                  outlineModelWithFormatContext(request, value, 0).toString(16)
              );
            if (value instanceof Set)
              return (
                (value = Array.from(value)),
                '$W' +
                  outlineModelWithFormatContext(request, value, 0).toString(16)
              );
            if ('function' === typeof FormData && value instanceof FormData)
              return (
                (value = Array.from(value.entries())),
                '$K' +
                  outlineModelWithFormatContext(request, value, 0).toString(16)
              );
            if (value instanceof Error) return '$Z';
            if (value instanceof ArrayBuffer)
              return serializeTypedArray(request, 'A', new Uint8Array(value));
            if (value instanceof Int8Array)
              return serializeTypedArray(request, 'O', value);
            if (value instanceof Uint8Array)
              return serializeTypedArray(request, 'o', value);
            if (value instanceof Uint8ClampedArray)
              return serializeTypedArray(request, 'U', value);
            if (value instanceof Int16Array)
              return serializeTypedArray(request, 'S', value);
            if (value instanceof Uint16Array)
              return serializeTypedArray(request, 's', value);
            if (value instanceof Int32Array)
              return serializeTypedArray(request, 'L', value);
            if (value instanceof Uint32Array)
              return serializeTypedArray(request, 'l', value);
            if (value instanceof Float32Array)
              return serializeTypedArray(request, 'G', value);
            if (value instanceof Float64Array)
              return serializeTypedArray(request, 'g', value);
            if (value instanceof BigInt64Array)
              return serializeTypedArray(request, 'M', value);
            if (value instanceof BigUint64Array)
              return serializeTypedArray(request, 'm', value);
            if (value instanceof DataView)
              return serializeTypedArray(request, 'V', value);
            if ('function' === typeof Blob && value instanceof Blob)
              return serializeBlob(request, value);
            if ((elementReference = getIteratorFn(value)))
              return (
                (parentPropertyName = elementReference.call(value)),
                parentPropertyName === value
                  ? ((value = Array.from(parentPropertyName)),
                    '$i' +
                      outlineModelWithFormatContext(request, value, 0).toString(
                        16,
                      ))
                  : renderFragment(
                      request,
                      task,
                      Array.from(parentPropertyName),
                    )
              );
            if (
              'function' === typeof ReadableStream &&
              value instanceof ReadableStream
            )
              return serializeReadableStream(request, task, value);
            elementReference = value[ASYNC_ITERATOR];
            if ('function' === typeof elementReference)
              return (
                null !== task.keyPath
                  ? ((request = [
                      REACT_ELEMENT_TYPE,
                      REACT_FRAGMENT_TYPE,
                      task.keyPath,
                      {
                        children: value,
                      },
                    ]),
                    (request = task.implicitSlot ? [request] : request))
                  : ((parentPropertyName = elementReference.call(value)),
                    (request = serializeAsyncIterable(
                      request,
                      task,
                      value,
                      parentPropertyName,
                    ))),
                request
              );
            if (value instanceof Date) return '$D' + value.toJSON();
            request = getPrototypeOf(value);
            if (
              request !== ObjectPrototype &&
              (null === request || null !== getPrototypeOf(request))
            )
              throw Error(
                'Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.' +
                  describeObjectForErrorMessage(parent, parentPropertyName),
              );
            return value;
          }
          if ('string' === typeof value) {
            serializedSize += value.length;
            if (
              'Z' === value[value.length - 1] &&
              parent[parentPropertyName] instanceof Date
            )
              return '$D' + value;
            if (1024 <= value.length && null !== byteLengthOfChunk)
              return (
                request.pendingChunks++,
                (task = request.nextChunkId++),
                emitTextChunk(request, task, value, !1),
                serializeByValueID(task)
              );
            request = '$' === value[0] ? '$' + value : value;
            return request;
          }
          if ('boolean' === typeof value) return value;
          if ('number' === typeof value)
            return Number.isFinite(value)
              ? 0 === value && -Infinity === 1 / value
                ? '$-0'
                : value
              : Infinity === value
                ? '$Infinity'
                : -Infinity === value
                  ? '$-Infinity'
                  : '$NaN';
          if ('undefined' === typeof value) return '$undefined';
          if ('function' === typeof value) {
            if (value.$$typeof === CLIENT_REFERENCE_TAG$1)
              return serializeClientReference(
                request,
                parent,
                parentPropertyName,
                value,
              );
            if (value.$$typeof === SERVER_REFERENCE_TAG)
              return (
                (task = request.writtenServerReferences),
                (parentPropertyName = task.get(value)),
                void 0 !== parentPropertyName
                  ? (request = '$F' + parentPropertyName.toString(16))
                  : ((parentPropertyName = value.$$bound),
                    (parentPropertyName =
                      null === parentPropertyName
                        ? null
                        : Promise.resolve(parentPropertyName)),
                    (request = outlineModelWithFormatContext(
                      request,
                      {
                        id: value.$$id,
                        bound: parentPropertyName,
                      },
                      0,
                    )),
                    task.set(value, request),
                    (request = '$F' + request.toString(16))),
                request
              );
            if (
              void 0 !== request.temporaryReferences &&
              ((request = request.temporaryReferences.get(value)),
              void 0 !== request)
            )
              return '$T' + request;
            if (value.$$typeof === TEMPORARY_REFERENCE_TAG)
              throw Error(
                'Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.',
              );
            if (/^on[A-Z]/.test(parentPropertyName))
              throw Error(
                'Event handlers cannot be passed to Client Component props.' +
                  describeObjectForErrorMessage(parent, parentPropertyName) +
                  '\nIf you need interactivity, consider converting part of this to a Client Component.',
              );
            throw Error(
              'Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.' +
                describeObjectForErrorMessage(parent, parentPropertyName),
            );
          }
          if ('symbol' === typeof value) {
            task = request.writtenSymbols;
            elementReference = task.get(value);
            if (void 0 !== elementReference)
              return serializeByValueID(elementReference);
            elementReference = value.description;
            if (Symbol.for(elementReference) !== value)
              throw Error(
                'Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(' +
                  (value.description +
                    ') cannot be found among global symbols.') +
                  describeObjectForErrorMessage(parent, parentPropertyName),
              );
            request.pendingChunks++;
            parentPropertyName = request.nextChunkId++;
            parent = encodeReferenceChunk(
              request,
              parentPropertyName,
              '$S' + elementReference,
            );
            request.completedImportChunks.push(parent);
            task.set(value, parentPropertyName);
            return serializeByValueID(parentPropertyName);
          }
          if ('bigint' === typeof value) return '$n' + value.toString(10);
          throw Error(
            'Type ' +
              typeof value +
              ' is not supported in Client Component props.' +
              describeObjectForErrorMessage(parent, parentPropertyName),
          );
        }
        function logRecoverableError(request, error) {
          var prevRequest = currentRequest;
          currentRequest = null;
          try {
            var errorDigest = requestStorage.run(
              void 0,
              request.onError,
              error,
            );
          } finally {
            currentRequest = prevRequest;
          }
          if (null != errorDigest && 'string' !== typeof errorDigest)
            throw Error(
              'onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' +
                typeof errorDigest +
                '" instead',
            );
          return errorDigest || '';
        }
        function fatalError(request, error) {
          var onFatalError = request.onFatalError;
          onFatalError(error);
          null !== request.destination
            ? ((request.status = 14), request.destination.destroy(error))
            : ((request.status = 13), (request.fatalError = error));
          request.cacheController.abort(
            Error('The render was aborted due to a fatal error.', {
              cause: error,
            }),
          );
        }
        function emitErrorChunk(request, id, digest) {
          digest = {
            digest: digest,
          };
          id = id.toString(16) + ':E' + stringify(digest) + '\n';
          request.completedErrorChunks.push(id);
        }
        function emitTypedArrayChunk(request, id, tag, typedArray, debug) {
          debug ? request.pendingDebugChunks++ : request.pendingChunks++;
          typedArray = new Uint8Array(
            typedArray.buffer,
            typedArray.byteOffset,
            typedArray.byteLength,
          );
          debug = typedArray.byteLength;
          id = id.toString(16) + ':' + tag + debug.toString(16) + ',';
          request.completedRegularChunks.push(id, typedArray);
        }
        function emitTextChunk(request, id, text, debug) {
          if (null === byteLengthOfChunk)
            throw Error(
              'Existence of byteLengthOfChunk should have already been checked. This is a bug in React.',
            );
          debug ? request.pendingDebugChunks++ : request.pendingChunks++;
          debug = byteLengthOfChunk(text);
          id = id.toString(16) + ':T' + debug.toString(16) + ',';
          request.completedRegularChunks.push(id, text);
        }
        function emitChunk(request, task, value) {
          var id = task.id;
          'string' === typeof value && null !== byteLengthOfChunk
            ? emitTextChunk(request, id, value, !1)
            : value instanceof ArrayBuffer
              ? emitTypedArrayChunk(request, id, 'A', new Uint8Array(value), !1)
              : value instanceof Int8Array
                ? emitTypedArrayChunk(request, id, 'O', value, !1)
                : value instanceof Uint8Array
                  ? emitTypedArrayChunk(request, id, 'o', value, !1)
                  : value instanceof Uint8ClampedArray
                    ? emitTypedArrayChunk(request, id, 'U', value, !1)
                    : value instanceof Int16Array
                      ? emitTypedArrayChunk(request, id, 'S', value, !1)
                      : value instanceof Uint16Array
                        ? emitTypedArrayChunk(request, id, 's', value, !1)
                        : value instanceof Int32Array
                          ? emitTypedArrayChunk(request, id, 'L', value, !1)
                          : value instanceof Uint32Array
                            ? emitTypedArrayChunk(request, id, 'l', value, !1)
                            : value instanceof Float32Array
                              ? emitTypedArrayChunk(request, id, 'G', value, !1)
                              : value instanceof Float64Array
                                ? emitTypedArrayChunk(
                                    request,
                                    id,
                                    'g',
                                    value,
                                    !1,
                                  )
                                : value instanceof BigInt64Array
                                  ? emitTypedArrayChunk(
                                      request,
                                      id,
                                      'M',
                                      value,
                                      !1,
                                    )
                                  : value instanceof BigUint64Array
                                    ? emitTypedArrayChunk(
                                        request,
                                        id,
                                        'm',
                                        value,
                                        !1,
                                      )
                                    : value instanceof DataView
                                      ? emitTypedArrayChunk(
                                          request,
                                          id,
                                          'V',
                                          value,
                                          !1,
                                        )
                                      : ((value = stringify(
                                          value,
                                          task.toJSON,
                                        )),
                                        (task =
                                          task.id.toString(16) +
                                          ':' +
                                          value +
                                          '\n'),
                                        request.completedRegularChunks.push(
                                          task,
                                        ));
        }
        function erroredTask(request, task, error) {
          task.status = 4;
          error = logRecoverableError(request, error, task);
          emitErrorChunk(request, task.id, error);
          request.abortableTasks.delete(task);
          callOnAllReadyIfReady(request);
        }
        var emptyRoot = {};
        function retryTask(request, task) {
          if (0 === task.status) {
            task.status = 5;
            var parentSerializedSize = serializedSize;
            try {
              modelRoot = task.model;
              var resolvedModel = renderModelDestructive(
                request,
                task,
                emptyRoot,
                '',
                task.model,
              );
              modelRoot = resolvedModel;
              task.keyPath = null;
              task.implicitSlot = !1;
              if ('object' === typeof resolvedModel && null !== resolvedModel)
                request.writtenObjects.set(
                  resolvedModel,
                  serializeByValueID(task.id),
                ),
                  emitChunk(request, task, resolvedModel);
              else {
                var json = stringify(resolvedModel),
                  processedChunk = task.id.toString(16) + ':' + json + '\n';
                request.completedRegularChunks.push(processedChunk);
              }
              task.status = 1;
              request.abortableTasks.delete(task);
              callOnAllReadyIfReady(request);
            } catch (thrownValue) {
              if (12 === request.status) {
                if (
                  (request.abortableTasks.delete(task),
                  (task.status = 0),
                  21 === request.type)
                )
                  haltTask(task), finishHaltedTask(task, request);
                else {
                  var errorId = request.fatalError;
                  abortTask(task);
                  finishAbortedTask(task, request, errorId);
                }
              } else {
                var x =
                  thrownValue === SuspenseException
                    ? getSuspendedThenable()
                    : thrownValue;
                if (
                  'object' === typeof x &&
                  null !== x &&
                  'function' === typeof x.then
                ) {
                  task.status = 0;
                  task.thenableState = getThenableStateAfterSuspending();
                  var ping = task.ping;
                  x.then(ping, ping);
                } else erroredTask(request, task, x);
              }
            } finally {
              serializedSize = parentSerializedSize;
            }
          }
        }
        function tryStreamTask(request, task) {
          var parentSerializedSize = serializedSize;
          try {
            emitChunk(request, task, task.model);
          } finally {
            serializedSize = parentSerializedSize;
          }
        }
        function performWork(request) {
          var prevDispatcher = ReactSharedInternalsServer.H;
          ReactSharedInternalsServer.H = HooksDispatcher;
          var prevRequest = currentRequest;
          currentRequest$1 = currentRequest = request;
          try {
            var pingedTasks = request.pingedTasks;
            request.pingedTasks = [];
            for (var i = 0; i < pingedTasks.length; i++)
              retryTask(request, pingedTasks[i]);
            flushCompletedChunks(request);
          } catch (error) {
            logRecoverableError(request, error, null),
              fatalError(request, error);
          } finally {
            (ReactSharedInternalsServer.H = prevDispatcher),
              (currentRequest$1 = null),
              (currentRequest = prevRequest);
          }
        }
        function abortTask(task) {
          0 === task.status && (task.status = 3);
        }
        function finishAbortedTask(task, request, errorId) {
          3 === task.status &&
            ((errorId = serializeByValueID(errorId)),
            (task = encodeReferenceChunk(request, task.id, errorId)),
            request.completedErrorChunks.push(task));
        }
        function haltTask(task) {
          0 === task.status && (task.status = 3);
        }
        function finishHaltedTask(task, request) {
          3 === task.status && request.pendingChunks--;
        }
        function flushCompletedChunks(request) {
          var destination = request.destination;
          if (null !== destination) {
            currentView = new Uint8Array(2048);
            writtenBytes = 0;
            destinationHasCapacity = !0;
            try {
              for (
                var importsChunks = request.completedImportChunks, i = 0;
                i < importsChunks.length;
                i++
              )
                if (
                  (request.pendingChunks--,
                  !writeChunkAndReturn(destination, importsChunks[i]))
                ) {
                  request.destination = null;
                  i++;
                  break;
                }
              importsChunks.splice(0, i);
              var hintChunks = request.completedHintChunks;
              for (i = 0; i < hintChunks.length; i++)
                if (!writeChunkAndReturn(destination, hintChunks[i])) {
                  request.destination = null;
                  i++;
                  break;
                }
              hintChunks.splice(0, i);
              var regularChunks = request.completedRegularChunks;
              for (i = 0; i < regularChunks.length; i++)
                if (
                  (request.pendingChunks--,
                  !writeChunkAndReturn(destination, regularChunks[i]))
                ) {
                  request.destination = null;
                  i++;
                  break;
                }
              regularChunks.splice(0, i);
              var errorChunks = request.completedErrorChunks;
              for (i = 0; i < errorChunks.length; i++)
                if (
                  (request.pendingChunks--,
                  !writeChunkAndReturn(destination, errorChunks[i]))
                ) {
                  request.destination = null;
                  i++;
                  break;
                }
              errorChunks.splice(0, i);
            } finally {
              (request.flushScheduled = !1),
                currentView &&
                  0 < writtenBytes &&
                  destination.write(currentView.subarray(0, writtenBytes)),
                (currentView = null),
                (writtenBytes = 0),
                (destinationHasCapacity = !0);
            }
            'function' === typeof destination.flush && destination.flush();
          }
          0 === request.pendingChunks &&
            (12 > request.status &&
              request.cacheController.abort(
                Error(
                  'This render completed successfully. All cacheSignals are now aborted to allow clean up of any unused resources.',
                ),
              ),
            null !== request.destination &&
              ((request.status = 14),
              request.destination.end(),
              (request.destination = null)));
        }
        function startWork(request) {
          request.flushScheduled = null !== request.destination;
          scheduleMicrotask(function () {
            requestStorage.run(request, performWork, request);
          });
          setImmediate(function () {
            10 === request.status && (request.status = 11);
          });
        }
        function enqueueFlush(request) {
          !1 === request.flushScheduled &&
            0 === request.pingedTasks.length &&
            null !== request.destination &&
            ((request.flushScheduled = !0),
            setImmediate(function () {
              request.flushScheduled = !1;
              flushCompletedChunks(request);
            }));
        }
        function callOnAllReadyIfReady(request) {
          0 === request.abortableTasks.size &&
            ((request = request.onAllReady), request());
        }
        function startFlowing(request, destination) {
          if (13 === request.status)
            (request.status = 14), destination.destroy(request.fatalError);
          else if (14 !== request.status && null === request.destination) {
            request.destination = destination;
            try {
              flushCompletedChunks(request);
            } catch (error) {
              logRecoverableError(request, error, null),
                fatalError(request, error);
            }
          }
        }
        function finishHalt(request, abortedTasks) {
          try {
            abortedTasks.forEach(function (task) {
              return finishHaltedTask(task, request);
            });
            var onAllReady = request.onAllReady;
            onAllReady();
            flushCompletedChunks(request);
          } catch (error) {
            logRecoverableError(request, error, null),
              fatalError(request, error);
          }
        }
        function finishAbort(request, abortedTasks, errorId) {
          try {
            abortedTasks.forEach(function (task) {
              return finishAbortedTask(task, request, errorId);
            });
            var onAllReady = request.onAllReady;
            onAllReady();
            flushCompletedChunks(request);
          } catch (error) {
            logRecoverableError(request, error, null),
              fatalError(request, error);
          }
        }
        function abort(request, reason) {
          if (!(11 < request.status))
            try {
              request.status = 12;
              request.cacheController.abort(reason);
              var abortableTasks = request.abortableTasks;
              if (0 < abortableTasks.size) {
                if (21 === request.type)
                  abortableTasks.forEach(function (task) {
                    return haltTask(task, request);
                  }),
                    setImmediate(function () {
                      return finishHalt(request, abortableTasks);
                    });
                else {
                  var error =
                      void 0 === reason
                        ? Error(
                            'The render was aborted by the server without a reason.',
                          )
                        : 'object' === typeof reason &&
                            null !== reason &&
                            'function' === typeof reason.then
                          ? Error(
                              'The render was aborted by the server with a promise.',
                            )
                          : reason,
                    digest = logRecoverableError(request, error, null),
                    errorId = request.nextChunkId++;
                  request.fatalError = errorId;
                  request.pendingChunks++;
                  emitErrorChunk(request, errorId, digest, error, !1, null);
                  abortableTasks.forEach(function (task) {
                    return abortTask(task, request, errorId);
                  });
                  setImmediate(function () {
                    return finishAbort(request, abortableTasks, errorId);
                  });
                }
              } else {
                var onAllReady = request.onAllReady;
                onAllReady();
                flushCompletedChunks(request);
              }
            } catch (error$23) {
              logRecoverableError(request, error$23, null),
                fatalError(request, error$23);
            }
        }
        function resolveServerReference(bundlerConfig, id) {
          var name = '',
            resolvedModuleData = bundlerConfig[id];
          if (resolvedModuleData) name = resolvedModuleData.name;
          else {
            var idx = id.lastIndexOf('#');
            -1 !== idx &&
              ((name = id.slice(idx + 1)),
              (resolvedModuleData = bundlerConfig[id.slice(0, idx)]));
            if (!resolvedModuleData)
              throw Error(
                'Could not find the module "' +
                  id +
                  '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.',
              );
          }
          return resolvedModuleData.async
            ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1]
            : [resolvedModuleData.id, resolvedModuleData.chunks, name];
        }
        var chunkCache = new Map();
        function requireAsyncModule(id) {
          var promise = __webpack_require__(id);
          if (
            'function' !== typeof promise.then ||
            'fulfilled' === promise.status
          )
            return null;
          promise.then(
            function (value) {
              promise.status = 'fulfilled';
              promise.value = value;
            },
            function (reason) {
              promise.status = 'rejected';
              promise.reason = reason;
            },
          );
          return promise;
        }
        function ignoreReject() {}
        function preloadModule(metadata) {
          for (
            var chunks = metadata[1], promises = [], i = 0;
            i < chunks.length;

          ) {
            var chunkId = chunks[i++];
            chunks[i++];
            var entry = chunkCache.get(chunkId);
            if (void 0 === entry) {
              entry = __webpack_require__.e(chunkId);
              promises.push(entry);
              var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
              entry.then(resolve, ignoreReject);
              chunkCache.set(chunkId, entry);
            } else null !== entry && promises.push(entry);
          }
          return 4 === metadata.length
            ? 0 === promises.length
              ? requireAsyncModule(metadata[0])
              : Promise.all(promises).then(function () {
                  return requireAsyncModule(metadata[0]);
                })
            : 0 < promises.length
              ? Promise.all(promises)
              : null;
        }
        function requireModule(metadata) {
          var moduleExports = __webpack_require__(metadata[0]);
          if (4 === metadata.length && 'function' === typeof moduleExports.then)
            if ('fulfilled' === moduleExports.status)
              moduleExports = moduleExports.value;
            else throw moduleExports.reason;
          return '*' === metadata[2]
            ? moduleExports
            : '' === metadata[2]
              ? moduleExports.__esModule
                ? moduleExports.default
                : moduleExports
              : moduleExports[metadata[2]];
        }
        function Chunk(status, value, reason, response) {
          this.status = status;
          this.value = value;
          this.reason = reason;
          this._response = response;
        }
        Chunk.prototype = Object.create(Promise.prototype);
        Chunk.prototype.then = function (resolve, reject) {
          switch (this.status) {
            case 'resolved_model':
              initializeModelChunk(this);
          }
          switch (this.status) {
            case 'fulfilled':
              resolve(this.value);
              break;
            case 'pending':
            case 'blocked':
            case 'cyclic':
              resolve &&
                (null === this.value && (this.value = []),
                this.value.push(resolve));
              reject &&
                (null === this.reason && (this.reason = []),
                this.reason.push(reject));
              break;
            default:
              reject(this.reason);
          }
        };
        function createPendingChunk(response) {
          return new Chunk('pending', null, null, response);
        }
        function wakeChunk(listeners, value) {
          for (var i = 0; i < listeners.length; i++) (0, listeners[i])(value);
        }
        function triggerErrorOnChunk(chunk, error) {
          if ('pending' !== chunk.status && 'blocked' !== chunk.status)
            chunk.reason.error(error);
          else {
            var listeners = chunk.reason;
            chunk.status = 'rejected';
            chunk.reason = error;
            null !== listeners && wakeChunk(listeners, error);
          }
        }
        function resolveModelChunk(chunk, value, id) {
          if ('pending' !== chunk.status)
            (chunk = chunk.reason),
              'C' === value[0]
                ? chunk.close('C' === value ? '"$undefined"' : value.slice(1))
                : chunk.enqueueModel(value);
          else {
            var resolveListeners = chunk.value,
              rejectListeners = chunk.reason;
            chunk.status = 'resolved_model';
            chunk.value = value;
            chunk.reason = id;
            if (null !== resolveListeners)
              switch ((initializeModelChunk(chunk), chunk.status)) {
                case 'fulfilled':
                  wakeChunk(resolveListeners, chunk.value);
                  break;
                case 'pending':
                case 'blocked':
                case 'cyclic':
                  if (chunk.value)
                    for (value = 0; value < resolveListeners.length; value++)
                      chunk.value.push(resolveListeners[value]);
                  else chunk.value = resolveListeners;
                  if (chunk.reason) {
                    if (rejectListeners)
                      for (value = 0; value < rejectListeners.length; value++)
                        chunk.reason.push(rejectListeners[value]);
                  } else chunk.reason = rejectListeners;
                  break;
                case 'rejected':
                  rejectListeners && wakeChunk(rejectListeners, chunk.reason);
              }
          }
        }
        function createResolvedIteratorResultChunk(response, value, done) {
          return new Chunk(
            'resolved_model',
            (done ? '{"done":true,"value":' : '{"done":false,"value":') +
              value +
              '}',
            -1,
            response,
          );
        }
        function resolveIteratorResultChunk(chunk, value, done) {
          resolveModelChunk(
            chunk,
            (done ? '{"done":true,"value":' : '{"done":false,"value":') +
              value +
              '}',
            -1,
          );
        }
        function loadServerReference$1(
          response,
          id,
          bound,
          parentChunk,
          parentObject,
          key,
        ) {
          var serverReference = resolveServerReference(
            response._bundlerConfig,
            id,
          );
          id = preloadModule(serverReference);
          if (bound)
            bound = Promise.all([bound, id]).then(function (_ref) {
              _ref = _ref[0];
              var fn = requireModule(serverReference);
              return fn.bind.apply(fn, [null].concat(_ref));
            });
          else if (id)
            bound = Promise.resolve(id).then(function () {
              return requireModule(serverReference);
            });
          else return requireModule(serverReference);
          bound.then(
            createModelResolver(
              parentChunk,
              parentObject,
              key,
              !1,
              response,
              createModel,
              [],
            ),
            createModelReject(parentChunk),
          );
          return null;
        }
        function reviveModel(response, parentObj, parentKey, value, reference) {
          if ('string' === typeof value)
            return parseModelString(
              response,
              parentObj,
              parentKey,
              value,
              reference,
            );
          if ('object' === typeof value && null !== value)
            if (
              (void 0 !== reference &&
                void 0 !== response._temporaryReferences &&
                response._temporaryReferences.set(value, reference),
              Array.isArray(value))
            )
              for (var i = 0; i < value.length; i++)
                value[i] = reviveModel(
                  response,
                  value,
                  '' + i,
                  value[i],
                  void 0 !== reference ? reference + ':' + i : void 0,
                );
            else
              for (i in value)
                hasOwnProperty.call(value, i) &&
                  ((parentObj =
                    void 0 !== reference && -1 === i.indexOf(':')
                      ? reference + ':' + i
                      : void 0),
                  (parentObj = reviveModel(
                    response,
                    value,
                    i,
                    value[i],
                    parentObj,
                  )),
                  void 0 !== parentObj
                    ? (value[i] = parentObj)
                    : delete value[i]);
          return value;
        }
        var initializingChunk = null,
          initializingChunkBlockedModel = null;
        function initializeModelChunk(chunk) {
          var prevChunk = initializingChunk,
            prevBlocked = initializingChunkBlockedModel;
          initializingChunk = chunk;
          initializingChunkBlockedModel = null;
          var rootReference =
              -1 === chunk.reason ? void 0 : chunk.reason.toString(16),
            resolvedModel = chunk.value;
          chunk.status = 'cyclic';
          chunk.value = null;
          chunk.reason = null;
          try {
            var rawModel = JSON.parse(resolvedModel),
              value = reviveModel(
                chunk._response,
                {
                  '': rawModel,
                },
                '',
                rawModel,
                rootReference,
              );
            if (
              null !== initializingChunkBlockedModel &&
              0 < initializingChunkBlockedModel.deps
            )
              (initializingChunkBlockedModel.value = value),
                (chunk.status = 'blocked');
            else {
              var resolveListeners = chunk.value;
              chunk.status = 'fulfilled';
              chunk.value = value;
              null !== resolveListeners && wakeChunk(resolveListeners, value);
            }
          } catch (error) {
            (chunk.status = 'rejected'), (chunk.reason = error);
          } finally {
            (initializingChunk = prevChunk),
              (initializingChunkBlockedModel = prevBlocked);
          }
        }
        function reportGlobalError(response, error) {
          response._closed = !0;
          response._closedReason = error;
          response._chunks.forEach(function (chunk) {
            'pending' === chunk.status && triggerErrorOnChunk(chunk, error);
          });
        }
        function getChunk(response, id) {
          var chunks = response._chunks,
            chunk = chunks.get(id);
          chunk ||
            ((chunk = response._formData.get(response._prefix + id)),
            (chunk =
              null != chunk
                ? new Chunk('resolved_model', chunk, id, response)
                : response._closed
                  ? new Chunk(
                      'rejected',
                      null,
                      response._closedReason,
                      response,
                    )
                  : createPendingChunk(response)),
            chunks.set(id, chunk));
          return chunk;
        }
        function createModelResolver(
          chunk,
          parentObject,
          key,
          cyclic,
          response,
          map,
          path,
        ) {
          if (initializingChunkBlockedModel) {
            var blocked = initializingChunkBlockedModel;
            cyclic || blocked.deps++;
          } else
            blocked = initializingChunkBlockedModel = {
              deps: cyclic ? 0 : 1,
              value: null,
            };
          return function (value) {
            for (var i = 1; i < path.length; i++) value = value[path[i]];
            parentObject[key] = map(response, value);
            '' === key &&
              null === blocked.value &&
              (blocked.value = parentObject[key]);
            blocked.deps--;
            0 === blocked.deps &&
              'blocked' === chunk.status &&
              ((value = chunk.value),
              (chunk.status = 'fulfilled'),
              (chunk.value = blocked.value),
              null !== value && wakeChunk(value, blocked.value));
          };
        }
        function createModelReject(chunk) {
          return function (error) {
            return triggerErrorOnChunk(chunk, error);
          };
        }
        function getOutlinedModel(response, reference, parentObject, key, map) {
          reference = reference.split(':');
          var id = parseInt(reference[0], 16);
          id = getChunk(response, id);
          switch (id.status) {
            case 'resolved_model':
              initializeModelChunk(id);
          }
          switch (id.status) {
            case 'fulfilled':
              parentObject = id.value;
              for (key = 1; key < reference.length; key++)
                parentObject = parentObject[reference[key]];
              return map(response, parentObject);
            case 'pending':
            case 'blocked':
            case 'cyclic':
              var parentChunk = initializingChunk;
              id.then(
                createModelResolver(
                  parentChunk,
                  parentObject,
                  key,
                  'cyclic' === id.status,
                  response,
                  map,
                  reference,
                ),
                createModelReject(parentChunk),
              );
              return null;
            default:
              throw id.reason;
          }
        }
        function createMap(response, model) {
          return new Map(model);
        }
        function createSet(response, model) {
          return new Set(model);
        }
        function extractIterator(response, model) {
          return model[Symbol.iterator]();
        }
        function createModel(response, model) {
          return model;
        }
        function parseTypedArray(
          response,
          reference,
          constructor,
          bytesPerElement,
          parentObject,
          parentKey,
        ) {
          reference = parseInt(reference.slice(2), 16);
          reference = response._formData.get(response._prefix + reference);
          reference =
            constructor === ArrayBuffer
              ? reference.arrayBuffer()
              : reference.arrayBuffer().then(function (buffer) {
                  return new constructor(buffer);
                });
          bytesPerElement = initializingChunk;
          reference.then(
            createModelResolver(
              bytesPerElement,
              parentObject,
              parentKey,
              !1,
              response,
              createModel,
              [],
            ),
            createModelReject(bytesPerElement),
          );
          return null;
        }
        function resolveStream(response, id, stream, controller) {
          var chunks = response._chunks;
          stream = new Chunk('fulfilled', stream, controller, response);
          chunks.set(id, stream);
          response = response._formData.getAll(response._prefix + id);
          for (id = 0; id < response.length; id++)
            (chunks = response[id]),
              'C' === chunks[0]
                ? controller.close(
                    'C' === chunks ? '"$undefined"' : chunks.slice(1),
                  )
                : controller.enqueueModel(chunks);
        }
        function parseReadableStream(response, reference, type) {
          reference = parseInt(reference.slice(2), 16);
          var controller = null;
          type = new ReadableStream({
            type: type,
            start: function (c) {
              controller = c;
            },
          });
          var previousBlockedChunk = null;
          resolveStream(response, reference, type, {
            enqueueModel: function (json) {
              if (null === previousBlockedChunk) {
                var chunk = new Chunk('resolved_model', json, -1, response);
                initializeModelChunk(chunk);
                'fulfilled' === chunk.status
                  ? controller.enqueue(chunk.value)
                  : (chunk.then(
                      function (v) {
                        return controller.enqueue(v);
                      },
                      function (e) {
                        return controller.error(e);
                      },
                    ),
                    (previousBlockedChunk = chunk));
              } else {
                chunk = previousBlockedChunk;
                var chunk$26 = createPendingChunk(response);
                chunk$26.then(
                  function (v) {
                    return controller.enqueue(v);
                  },
                  function (e) {
                    return controller.error(e);
                  },
                );
                previousBlockedChunk = chunk$26;
                chunk.then(function () {
                  previousBlockedChunk === chunk$26 &&
                    (previousBlockedChunk = null);
                  resolveModelChunk(chunk$26, json, -1);
                });
              }
            },
            close: function () {
              if (null === previousBlockedChunk) controller.close();
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function () {
                  return controller.close();
                });
              }
            },
            error: function (error) {
              if (null === previousBlockedChunk) controller.error(error);
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function () {
                  return controller.error(error);
                });
              }
            },
          });
          return type;
        }
        function asyncIterator() {
          return this;
        }
        function createIterator(next) {
          next = {
            next: next,
          };
          next[ASYNC_ITERATOR] = asyncIterator;
          return next;
        }
        function parseAsyncIterable(response, reference, iterator) {
          reference = parseInt(reference.slice(2), 16);
          var buffer = [],
            closed = !1,
            nextWriteIndex = 0,
            $jscomp$compprop2 = {};
          $jscomp$compprop2 =
            (($jscomp$compprop2[ASYNC_ITERATOR] = function () {
              var nextReadIndex = 0;
              return createIterator(function (arg) {
                if (void 0 !== arg)
                  throw Error(
                    'Values cannot be passed to next() of AsyncIterables passed to Client Components.',
                  );
                if (nextReadIndex === buffer.length) {
                  if (closed)
                    return new Chunk(
                      'fulfilled',
                      {
                        done: !0,
                        value: void 0,
                      },
                      null,
                      response,
                    );
                  buffer[nextReadIndex] = createPendingChunk(response);
                }
                return buffer[nextReadIndex++];
              });
            }),
            $jscomp$compprop2);
          iterator = iterator
            ? $jscomp$compprop2[ASYNC_ITERATOR]()
            : $jscomp$compprop2;
          resolveStream(response, reference, iterator, {
            enqueueModel: function (value) {
              nextWriteIndex === buffer.length
                ? (buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
                    response,
                    value,
                    !1,
                  ))
                : resolveIteratorResultChunk(buffer[nextWriteIndex], value, !1);
              nextWriteIndex++;
            },
            close: function (value) {
              closed = !0;
              nextWriteIndex === buffer.length
                ? (buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
                    response,
                    value,
                    !0,
                  ))
                : resolveIteratorResultChunk(buffer[nextWriteIndex], value, !0);
              for (nextWriteIndex++; nextWriteIndex < buffer.length; )
                resolveIteratorResultChunk(
                  buffer[nextWriteIndex++],
                  '"$undefined"',
                  !0,
                );
            },
            error: function (error) {
              closed = !0;
              for (
                nextWriteIndex === buffer.length &&
                (buffer[nextWriteIndex] = createPendingChunk(response));
                nextWriteIndex < buffer.length;

              )
                triggerErrorOnChunk(buffer[nextWriteIndex++], error);
            },
          });
          return iterator;
        }
        function parseModelString(response, obj, key, value, reference) {
          if ('$' === value[0]) {
            switch (value[1]) {
              case '$':
                return value.slice(1);
              case '@':
                return (
                  (obj = parseInt(value.slice(2), 16)), getChunk(response, obj)
                );
              case 'F':
                return (
                  (value = value.slice(2)),
                  (value = getOutlinedModel(
                    response,
                    value,
                    obj,
                    key,
                    createModel,
                  )),
                  loadServerReference$1(
                    response,
                    value.id,
                    value.bound,
                    initializingChunk,
                    obj,
                    key,
                  )
                );
              case 'T':
                if (
                  void 0 === reference ||
                  void 0 === response._temporaryReferences
                )
                  throw Error(
                    'Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.',
                  );
                return createTemporaryReference(
                  response._temporaryReferences,
                  reference,
                );
              case 'Q':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(response, value, obj, key, createMap)
                );
              case 'W':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(response, value, obj, key, createSet)
                );
              case 'K':
                obj = value.slice(2);
                var formPrefix = response._prefix + obj + '_',
                  data = new FormData();
                response._formData.forEach(function (entry, entryKey) {
                  entryKey.startsWith(formPrefix) &&
                    data.append(entryKey.slice(formPrefix.length), entry);
                });
                return data;
              case 'i':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(response, value, obj, key, extractIterator)
                );
              case 'I':
                return Infinity;
              case '-':
                return '$-0' === value ? -0 : -Infinity;
              case 'N':
                return NaN;
              case 'u':
                return;
              case 'D':
                return new Date(Date.parse(value.slice(2)));
              case 'n':
                return BigInt(value.slice(2));
            }
            switch (value[1]) {
              case 'A':
                return parseTypedArray(
                  response,
                  value,
                  ArrayBuffer,
                  1,
                  obj,
                  key,
                );
              case 'O':
                return parseTypedArray(response, value, Int8Array, 1, obj, key);
              case 'o':
                return parseTypedArray(
                  response,
                  value,
                  Uint8Array,
                  1,
                  obj,
                  key,
                );
              case 'U':
                return parseTypedArray(
                  response,
                  value,
                  Uint8ClampedArray,
                  1,
                  obj,
                  key,
                );
              case 'S':
                return parseTypedArray(
                  response,
                  value,
                  Int16Array,
                  2,
                  obj,
                  key,
                );
              case 's':
                return parseTypedArray(
                  response,
                  value,
                  Uint16Array,
                  2,
                  obj,
                  key,
                );
              case 'L':
                return parseTypedArray(
                  response,
                  value,
                  Int32Array,
                  4,
                  obj,
                  key,
                );
              case 'l':
                return parseTypedArray(
                  response,
                  value,
                  Uint32Array,
                  4,
                  obj,
                  key,
                );
              case 'G':
                return parseTypedArray(
                  response,
                  value,
                  Float32Array,
                  4,
                  obj,
                  key,
                );
              case 'g':
                return parseTypedArray(
                  response,
                  value,
                  Float64Array,
                  8,
                  obj,
                  key,
                );
              case 'M':
                return parseTypedArray(
                  response,
                  value,
                  BigInt64Array,
                  8,
                  obj,
                  key,
                );
              case 'm':
                return parseTypedArray(
                  response,
                  value,
                  BigUint64Array,
                  8,
                  obj,
                  key,
                );
              case 'V':
                return parseTypedArray(response, value, DataView, 1, obj, key);
              case 'B':
                return (
                  (obj = parseInt(value.slice(2), 16)),
                  response._formData.get(response._prefix + obj)
                );
            }
            switch (value[1]) {
              case 'R':
                return parseReadableStream(response, value, void 0);
              case 'r':
                return parseReadableStream(response, value, 'bytes');
              case 'X':
                return parseAsyncIterable(response, value, !1);
              case 'x':
                return parseAsyncIterable(response, value, !0);
            }
            value = value.slice(1);
            return getOutlinedModel(response, value, obj, key, createModel);
          }
          return value;
        }
        function createResponse(
          bundlerConfig,
          formFieldPrefix,
          temporaryReferences,
        ) {
          var backingFormData =
              3 < arguments.length && void 0 !== arguments[3]
                ? arguments[3]
                : new FormData(),
            chunks = new Map();
          return {
            _bundlerConfig: bundlerConfig,
            _prefix: formFieldPrefix,
            _formData: backingFormData,
            _chunks: chunks,
            _closed: !1,
            _closedReason: null,
            _temporaryReferences: temporaryReferences,
          };
        }
        function resolveField(response, key, value) {
          response._formData.append(key, value);
          var prefix = response._prefix;
          key.startsWith(prefix) &&
            ((response = response._chunks),
            (key = +key.slice(prefix.length)),
            (prefix = response.get(key)) &&
              resolveModelChunk(prefix, value, key));
        }
        function close(response) {
          reportGlobalError(response, Error('Connection closed.'));
        }
        function loadServerReference(bundlerConfig, id, bound) {
          var serverReference = resolveServerReference(bundlerConfig, id);
          bundlerConfig = preloadModule(serverReference);
          return bound
            ? Promise.all([bound, bundlerConfig]).then(function (_ref) {
                _ref = _ref[0];
                var fn = requireModule(serverReference);
                return fn.bind.apply(fn, [null].concat(_ref));
              })
            : bundlerConfig
              ? Promise.resolve(bundlerConfig).then(function () {
                  return requireModule(serverReference);
                })
              : Promise.resolve(requireModule(serverReference));
        }
        function decodeBoundActionMetaData(
          body,
          serverManifest,
          formFieldPrefix,
        ) {
          body = createResponse(serverManifest, formFieldPrefix, void 0, body);
          close(body);
          body = getChunk(body, 0);
          body.then(function () {});
          if ('fulfilled' !== body.status) throw body.reason;
          return body.value;
        }
        function createDrainHandler(destination, request) {
          return function () {
            return startFlowing(request, destination);
          };
        }
        function createCancelHandler(request, reason) {
          return function () {
            request.destination = null;
            abort(request, Error(reason));
          };
        }
        function createFakeWritableFromReadableStreamController(controller) {
          return {
            write: function (chunk) {
              'string' === typeof chunk && (chunk = textEncoder.encode(chunk));
              controller.enqueue(chunk);
              return !0;
            },
            end: function () {
              controller.close();
            },
            destroy: function (error) {
              'function' === typeof controller.error
                ? controller.error(error)
                : controller.close();
            },
          };
        }
        function createFakeWritableFromNodeReadable(readable) {
          return {
            write: function (chunk) {
              return readable.push(chunk);
            },
            end: function () {
              readable.push(null);
            },
            destroy: function (error) {
              readable.destroy(error);
            },
          };
        }
        exports.createClientModuleProxy = function (moduleId) {
          moduleId = registerClientReferenceImpl({}, moduleId, !1);
          return new Proxy(moduleId, proxyHandlers$1);
        };
        exports.createTemporaryReferenceSet = function () {
          return new WeakMap();
        };
        exports.decodeAction = function (body, serverManifest) {
          var formData = new FormData(),
            action = null;
          body.forEach(function (value, key) {
            key.startsWith('$ACTION_')
              ? key.startsWith('$ACTION_REF_')
                ? ((value = '$ACTION_' + key.slice(12) + ':'),
                  (value = decodeBoundActionMetaData(
                    body,
                    serverManifest,
                    value,
                  )),
                  (action = loadServerReference(
                    serverManifest,
                    value.id,
                    value.bound,
                  )))
                : key.startsWith('$ACTION_ID_') &&
                  ((value = key.slice(11)),
                  (action = loadServerReference(serverManifest, value, null)))
              : formData.append(key, value);
          });
          return null === action
            ? null
            : action.then(function (fn) {
                return fn.bind(null, formData);
              });
        };
        exports.decodeFormState = function (
          actionResult,
          body,
          serverManifest,
        ) {
          var keyPath = body.get('$ACTION_KEY');
          if ('string' !== typeof keyPath) return Promise.resolve(null);
          var metaData = null;
          body.forEach(function (value, key) {
            key.startsWith('$ACTION_REF_') &&
              ((value = '$ACTION_' + key.slice(12) + ':'),
              (metaData = decodeBoundActionMetaData(
                body,
                serverManifest,
                value,
              )));
          });
          if (null === metaData) return Promise.resolve(null);
          var referenceId = metaData.id;
          return Promise.resolve(metaData.bound).then(function (bound) {
            return null === bound
              ? null
              : [actionResult, keyPath, referenceId, bound.length - 1];
          });
        };
        exports.decodeReply = function (body, webpackMap, options) {
          if ('string' === typeof body) {
            var form = new FormData();
            form.append('0', body);
            body = form;
          }
          body = createResponse(
            webpackMap,
            '',
            options ? options.temporaryReferences : void 0,
            body,
          );
          webpackMap = getChunk(body, 0);
          close(body);
          return webpackMap;
        };
        exports.decodeReplyFromAsyncIterable = function (
          iterable,
          webpackMap,
          options,
        ) {
          function progress(entry) {
            if (entry.done) close(response);
            else {
              var _entry$value = entry.value;
              entry = _entry$value[0];
              _entry$value = _entry$value[1];
              'string' === typeof _entry$value
                ? resolveField(response, entry, _entry$value)
                : response._formData.append(entry, _entry$value);
              iterator.next().then(progress, error);
            }
          }
          function error(reason) {
            reportGlobalError(response, reason);
            'function' === typeof iterator.throw &&
              iterator.throw(reason).then(error, error);
          }
          var iterator = iterable[ASYNC_ITERATOR](),
            response = createResponse(
              webpackMap,
              '',
              options ? options.temporaryReferences : void 0,
            );
          iterator.next().then(progress, error);
          return getChunk(response, 0);
        };
        exports.decodeReplyFromBusboy = function (
          busboyStream,
          webpackMap,
          options,
        ) {
          var response = createResponse(
              webpackMap,
              '',
              options ? options.temporaryReferences : void 0,
            ),
            pendingFiles = 0,
            queuedFields = [];
          busboyStream.on('field', function (name, value) {
            0 < pendingFiles
              ? queuedFields.push(name, value)
              : resolveField(response, name, value);
          });
          busboyStream.on('file', function (name, value, _ref2) {
            var filename = _ref2.filename,
              mimeType = _ref2.mimeType;
            if ('base64' === _ref2.encoding.toLowerCase())
              throw Error(
                "React doesn't accept base64 encoded file uploads because we don't expect form data passed from a browser to ever encode data that way. If that's the wrong assumption, we can easily fix it.",
              );
            pendingFiles++;
            var JSCompiler_object_inline_chunks_274 = [];
            value.on('data', function (chunk) {
              JSCompiler_object_inline_chunks_274.push(chunk);
            });
            value.on('end', function () {
              var blob = new Blob(JSCompiler_object_inline_chunks_274, {
                type: mimeType,
              });
              response._formData.append(name, blob, filename);
              pendingFiles--;
              if (0 === pendingFiles) {
                for (blob = 0; blob < queuedFields.length; blob += 2)
                  resolveField(
                    response,
                    queuedFields[blob],
                    queuedFields[blob + 1],
                  );
                queuedFields.length = 0;
              }
            });
          });
          busboyStream.on('finish', function () {
            close(response);
          });
          busboyStream.on('error', function (err) {
            reportGlobalError(response, err);
          });
          return getChunk(response, 0);
        };
        exports.prerender = function (model, webpackMap, options) {
          return new Promise(function (resolve, reject) {
            var request = new RequestInstance(
              21,
              model,
              webpackMap,
              options ? options.onError : void 0,
              options ? options.onPostpone : void 0,
              function () {
                var writable,
                  stream = new ReadableStream(
                    {
                      type: 'bytes',
                      start: function (controller) {
                        writable =
                          createFakeWritableFromReadableStreamController(
                            controller,
                          );
                      },
                      pull: function () {
                        startFlowing(request, writable);
                      },
                      cancel: function (reason) {
                        request.destination = null;
                        abort(request, reason);
                      },
                    },
                    {
                      highWaterMark: 0,
                    },
                  );
                resolve({
                  prelude: stream,
                });
              },
              reject,
              options ? options.identifierPrefix : void 0,
              options ? options.temporaryReferences : void 0,
            );
            if (options && options.signal) {
              var signal = options.signal;
              if (signal.aborted) abort(request, signal.reason);
              else {
                var listener = function () {
                  abort(request, signal.reason);
                  signal.removeEventListener('abort', listener);
                };
                signal.addEventListener('abort', listener);
              }
            }
            startWork(request);
          });
        };
        exports.prerenderToNodeStream = function (model, webpackMap, options) {
          return new Promise(function (resolve, reject) {
            var request = new RequestInstance(
              21,
              model,
              webpackMap,
              options ? options.onError : void 0,
              options ? options.onPostpone : void 0,
              function () {
                var readable = new stream.Readable({
                    read: function () {
                      startFlowing(request, writable);
                    },
                  }),
                  writable = createFakeWritableFromNodeReadable(readable);
                resolve({
                  prelude: readable,
                });
              },
              reject,
              options ? options.identifierPrefix : void 0,
              options ? options.temporaryReferences : void 0,
            );
            if (options && options.signal) {
              var signal = options.signal;
              if (signal.aborted) abort(request, signal.reason);
              else {
                var listener = function () {
                  abort(request, signal.reason);
                  signal.removeEventListener('abort', listener);
                };
                signal.addEventListener('abort', listener);
              }
            }
            startWork(request);
          });
        };
        exports.registerClientReference = function (
          proxyImplementation,
          id,
          exportName,
        ) {
          return registerClientReferenceImpl(
            proxyImplementation,
            id + '#' + exportName,
            !1,
          );
        };
        exports.registerServerReference = function (reference, id, exportName) {
          return Object.defineProperties(reference, {
            $$typeof: {
              value: SERVER_REFERENCE_TAG,
            },
            $$id: {
              value: null === exportName ? id : id + '#' + exportName,
              configurable: !0,
            },
            $$bound: {
              value: null,
              configurable: !0,
            },
            bind: {
              value: bind,
              configurable: !0,
            },
          });
        };
        exports.renderToPipeableStream = function (model, webpackMap, options) {
          var request = new RequestInstance(
              20,
              model,
              webpackMap,
              options ? options.onError : void 0,
              options ? options.onPostpone : void 0,
              noop,
              noop,
              options ? options.identifierPrefix : void 0,
              options ? options.temporaryReferences : void 0,
            ),
            hasStartedFlowing = !1;
          startWork(request);
          return {
            pipe: function (destination) {
              if (hasStartedFlowing)
                throw Error(
                  'React currently only supports piping to one writable stream.',
                );
              hasStartedFlowing = !0;
              startFlowing(request, destination);
              destination.on('drain', createDrainHandler(destination, request));
              destination.on(
                'error',
                createCancelHandler(
                  request,
                  'The destination stream errored while writing data.',
                ),
              );
              destination.on(
                'close',
                createCancelHandler(
                  request,
                  'The destination stream closed early.',
                ),
              );
              return destination;
            },
            abort: function (reason) {
              abort(request, reason);
            },
          };
        };
        exports.renderToReadableStream = function (model, webpackMap, options) {
          var request = new RequestInstance(
            20,
            model,
            webpackMap,
            options ? options.onError : void 0,
            options ? options.onPostpone : void 0,
            noop,
            noop,
            options ? options.identifierPrefix : void 0,
            options ? options.temporaryReferences : void 0,
          );
          if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
              var listener = function () {
                abort(request, signal.reason);
                signal.removeEventListener('abort', listener);
              };
              signal.addEventListener('abort', listener);
            }
          }
          var writable;
          return new ReadableStream(
            {
              type: 'bytes',
              start: function (controller) {
                writable =
                  createFakeWritableFromReadableStreamController(controller);
                startWork(request);
              },
              pull: function () {
                startFlowing(request, writable);
              },
              cancel: function (reason) {
                request.destination = null;
                abort(request, reason);
              },
            },
            {
              highWaterMark: 0,
            },
          );
        };

        /***/
      },

    /***/ '../../../packages/react-server-dom-webpack/server.node.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var s;
      if (true) {
        s = __webpack_require__(
          '../../../packages/react-server-dom-webpack/cjs/react-server-dom-webpack-server.node.production.js',
        );
      } else {
      }

      // Use globalThis to ensure singleton registry across webpack module instances.
      // This is necessary because webpack's share scope may create multiple module
      // instances with different IDs that each execute this code.
      const REGISTRY_KEY = '__RSC_SERVER_ACTION_REGISTRY__';
      const MANIFEST_KEY = '__RSC_DYNAMIC_MANIFEST__';

      // Global registry for inline server actions
      // This allows action lookup for functions not exported from modules
      if (!globalThis[REGISTRY_KEY]) {
        globalThis[REGISTRY_KEY] = new Map();
      }
      const serverActionRegistry = globalThis[REGISTRY_KEY];

      // Dynamic manifest entries for actions registered at runtime (inline actions)
      // Key: actionId, Value: { id, name, chunks }
      if (!globalThis[MANIFEST_KEY]) {
        globalThis[MANIFEST_KEY] = new Map();
      }
      const dynamicServerActionsManifest = globalThis[MANIFEST_KEY];

      /**
       * Wrap registerServerReference to also store in global registry
       * This enables lookup of inline server actions defined inside components
       */
      function registerServerReferenceWithRegistry(reference, id, exportName) {
        // Call the original implementation
        const result = s.registerServerReference(reference, id, exportName);

        // Store in global registry for lookup
        const actionId = exportName === null ? id : id + '#' + exportName;
        serverActionRegistry.set(actionId, reference);

        // Debug: log registration
        if (process.env.RSC_DEBUG) {
          console.log(
            `[RSC Registry] Registered action: ${actionId} (registry size: ${serverActionRegistry.size})`,
          );
        }

        // Also keep a manifest entry so decodeReply can resolve dynamic inline actions
        dynamicServerActionsManifest.set(actionId, {
          id,
          name: exportName === null ? 'default' : exportName,
          chunks: [],
        });
        return result;
      }

      /**
       * Get a server action function by its ID
       * Used by action handlers to find inline server actions
       */
      function getServerAction(actionId) {
        const result = serverActionRegistry.get(actionId);
        // Debug: log lookup
        if (process.env.RSC_DEBUG) {
          console.log(
            `[RSC Registry] Lookup action: ${actionId} -> ${result ? 'FOUND' : 'NOT FOUND'} (registry size: ${serverActionRegistry.size})`,
          );
          if (!result) {
            console.log(
              `[RSC Registry] Available actions: ${Array.from(serverActionRegistry.keys()).join(', ')}`,
            );
          }
        }
        return result;
      }
      function getDynamicServerActionsManifest() {
        const entries = {};
        for (const [key, value] of dynamicServerActionsManifest) {
          entries[key] = value;
        }
        return entries;
      }

      /**
       * Clear the server action registry (for testing purposes)
       * This is needed when reloading bundles in tests to ensure fresh state
       */
      function clearServerActionRegistry() {
        serverActionRegistry.clear();
        dynamicServerActionsManifest.clear();
        if (process.env.RSC_DEBUG) {
          console.log('[RSC Registry] Cleared registry and manifest');
        }
      }
      exports.renderToReadableStream = s.renderToReadableStream;
      exports.renderToPipeableStream = s.renderToPipeableStream;
      exports.decodeReply = s.decodeReply;
      exports.decodeReplyFromBusboy = s.decodeReplyFromBusboy;
      exports.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
      exports.decodeAction = s.decodeAction;
      exports.decodeFormState = s.decodeFormState;
      exports.registerServerReference = registerServerReferenceWithRegistry;
      exports.registerClientReference = s.registerClientReference;
      exports.createClientModuleProxy = s.createClientModuleProxy;
      exports.createTemporaryReferenceSet = s.createTemporaryReferenceSet;

      // Export registry access for action handlers
      exports.getServerAction = getServerAction;
      exports.serverActionRegistry = serverActionRegistry;
      exports.getDynamicServerActionsManifest = getDynamicServerActionsManifest;
      exports.clearServerActionRegistry = clearServerActionRegistry;

      /***/
    },

    /***/ '../../../packages/rsc/dist/rscRuntimePlugin.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var __webpack_modules__ = {
        '@module-federation/react-server-dom-webpack/server': function (
          module,
        ) {
          module.exports = __webpack_require__(
            '../../../packages/react-server-dom-webpack/server.node.js',
          );
        },
      };
      var __webpack_module_cache__ = {};
      function __nested_webpack_require_245__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = (__webpack_module_cache__[moduleId] = {
          exports: {},
        });
        __webpack_modules__[moduleId](
          module,
          module.exports,
          __nested_webpack_require_245__,
        );
        return module.exports;
      }
      (() => {
        __nested_webpack_require_245__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_245__.o(definition, key) &&
              !__nested_webpack_require_245__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_245__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_245__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      (() => {
        __nested_webpack_require_245__.r(__webpack_exports__);
        __nested_webpack_require_245__.d(__webpack_exports__, {
          default: () => rscRuntimePlugin,
          ensureRemoteActionsForAction: () => ensureRemoteActionsForAction,
          ensureRemoteServerActions: () => ensureRemoteServerActions,
          formatRemoteRequest: () => formatRemoteRequest,
          getFederationInstance: () => getFederationInstance,
          getFederationRemotes: () => getFederationRemotes,
          getIndexedRemoteAction: () => getIndexedRemoteAction,
          getRemoteRSCConfig: () => getRemoteRSCConfig,
          getRemoteServerActionsManifest: () => getRemoteServerActionsManifest,
          indexRemoteActionIds: () => indexRemoteActionIds,
          parseRemoteActionId: () => parseRemoteActionId,
          registeredRemotes: () => registeredRemotes,
          resolveRemoteAction: () => resolveRemoteAction,
        });
        const LOG_PREFIX = '[RSC-MF]';
        const DEBUG =
          'undefined' != typeof process &&
          process.env &&
          'true' === process.env.MF_RSC_DEBUG;
        const FETCH_TIMEOUT_MS = 5000;
        const REMOTE_ACTION_PREFIX = 'remote:';
        const CACHE_TTL_MS = 30000;
        const DEFAULT_ACTIONS_PATH = '/react';
        function getRuntimeState() {
          const existing = globalThis.__RSC_MF_RUNTIME_STATE__;
          const state = existing && 'object' == typeof existing ? existing : {};
          if (!(state.remoteRSCConfigs instanceof Map))
            state.remoteRSCConfigs = new Map();
          if (!(state.remoteMFManifests instanceof Map))
            state.remoteMFManifests = new Map();
          if (!(state.remoteServerActionsManifests instanceof Map))
            state.remoteServerActionsManifests = new Map();
          if (!(state.remoteActionIndex instanceof Map))
            state.remoteActionIndex = new Map();
          if (!(state.registeredRemotes instanceof Set))
            state.registeredRemotes = new Set();
          if (!(state.registeringRemotes instanceof Map))
            state.registeringRemotes = new Map();
          if (!existing)
            try {
              Object.defineProperty(globalThis, '__RSC_MF_RUNTIME_STATE__', {
                value: state,
                configurable: true,
                writable: true,
              });
            } catch (_e) {
              globalThis.__RSC_MF_RUNTIME_STATE__ = state;
            }
          return state;
        }
        const runtimeState = getRuntimeState();
        const remoteRSCConfigs = runtimeState.remoteRSCConfigs;
        const remoteMFManifests = runtimeState.remoteMFManifests;
        const remoteServerActionsManifests =
          runtimeState.remoteServerActionsManifests;
        const remoteActionIndex = runtimeState.remoteActionIndex;
        const registeredRemotes = runtimeState.registeredRemotes;
        const registeringRemotes = runtimeState.registeringRemotes;
        function log(...args) {
          if (DEBUG) console.log(LOG_PREFIX, ...args);
        }
        function getStringProp(obj, key) {
          if (!obj || 'object' != typeof obj) return null;
          const record = obj;
          const value = record[key];
          return 'string' == typeof value ? value : null;
        }
        function isServerActionManifestEntry(value) {
          return !!getStringProp(value, 'id') && !!getStringProp(value, 'name');
        }
        function getCacheValue(cache, key, onExpire) {
          const entry = cache.get(key);
          if (!entry) return null;
          if (!entry || 'object' != typeof entry || !('value' in entry))
            return entry;
          const ttl = Number.isFinite(CACHE_TTL_MS) ? CACHE_TTL_MS : 0;
          const cacheEntry = entry;
          if (ttl > 0 && Date.now() - cacheEntry.timestamp > ttl) {
            cache.delete(key);
            if ('function' == typeof onExpire) onExpire();
            return null;
          }
          return cacheEntry.value;
        }
        function setCacheValue(cache, key, value) {
          cache.set(key, {
            value,
            timestamp: Date.now(),
          });
          return value;
        }
        function resolveExplicitManifestUrl(remoteInfo) {
          if (!remoteInfo || 'object' != typeof remoteInfo) return null;
          const candidate =
            remoteInfo.manifestUrl ||
            remoteInfo.manifest ||
            remoteInfo.statsUrl ||
            remoteInfo.manifestFile;
          return 'string' == typeof candidate ? candidate : null;
        }
        function clearRemoteActionIndex(remoteEntry) {
          for (const [actionId, info] of remoteActionIndex.entries())
            if (info && info.remoteEntry === remoteEntry)
              remoteActionIndex.delete(actionId);
        }
        function parseRemoteActionId(actionId) {
          if ('string' != typeof actionId) return null;
          if (!actionId.startsWith(REMOTE_ACTION_PREFIX)) return null;
          const rest = actionId.slice(REMOTE_ACTION_PREFIX.length);
          const colonIndex = rest.indexOf(':');
          if (colonIndex <= 0) return null;
          const remoteName = rest.slice(0, colonIndex);
          const forwardedId = rest.slice(colonIndex + 1);
          if (!remoteName || !forwardedId) return null;
          return {
            remoteName,
            forwardedId,
          };
        }
        function getFederationInstance(preferredName, origin) {
          var _globalThis___FEDERATION__;
          if (origin && 'object' == typeof origin && origin.options)
            return origin;
          const instances =
            null == (_globalThis___FEDERATION__ = globalThis.__FEDERATION__)
              ? void 0
              : _globalThis___FEDERATION__.__INSTANCES__;
          if (!Array.isArray(instances)) return null;
          if (preferredName)
            return (
              instances.find((inst) => inst && inst.name === preferredName) ||
              instances[0]
            );
          return instances[0] || null;
        }
        function getFederationRemotes(origin, preferredName) {
          var _instance_options;
          const instance = getFederationInstance(preferredName, origin);
          const remotes = Array.isArray(
            null == instance
              ? void 0
              : null == (_instance_options = instance.options)
                ? void 0
                : _instance_options.remotes,
          )
            ? instance.options.remotes
            : [];
          return remotes
            .map((remote) => {
              if (!remote || 'object' != typeof remote) return null;
              const name = remote.name || remote.alias || remote.global || null;
              const entry =
                'string' == typeof remote.entry ? remote.entry : null;
              if (!name || !entry) return null;
              return {
                name,
                entry,
                raw: remote,
              };
            })
            .filter(Boolean);
        }
        function formatRemoteRequest(remoteName, exposeKey) {
          if ('string' != typeof remoteName || 0 === remoteName.length)
            return null;
          if ('string' != typeof exposeKey || 0 === exposeKey.length)
            return null;
          if ('.' === exposeKey) return remoteName;
          if (exposeKey.startsWith('./'))
            return `${remoteName}/${exposeKey.slice(2)}`;
          if (exposeKey.startsWith('/')) return `${remoteName}${exposeKey}`;
          return `${remoteName}/${exposeKey}`;
        }
        function getRemoteNameHint(remoteInfo, stats) {
          var _stats_metaData, _stats_metaData1;
          if (remoteInfo && 'object' == typeof remoteInfo) {
            const candidates = [
              remoteInfo.name,
              remoteInfo.alias,
              remoteInfo.global,
              remoteInfo.entryGlobalName,
              remoteInfo.globalName,
            ];
            for (const candidate of candidates)
              if ('string' == typeof candidate && candidate.length > 0)
                return candidate;
          }
          const statsCandidates = [
            null == stats ? void 0 : stats.name,
            null == stats ? void 0 : stats.id,
            null == stats
              ? void 0
              : null == (_stats_metaData = stats.metaData)
                ? void 0
                : _stats_metaData.name,
            null == stats
              ? void 0
              : null == (_stats_metaData1 = stats.metaData)
                ? void 0
                : _stats_metaData1.globalName,
          ];
          for (const candidate of statsCandidates)
            if ('string' == typeof candidate && candidate.length > 0)
              return candidate;
          return null;
        }
        function normalizeActionsPath(value) {
          if ('string' != typeof value) return DEFAULT_ACTIONS_PATH;
          const trimmed = value.trim();
          if (0 === trimmed.length) return DEFAULT_ACTIONS_PATH;
          return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        }
        function getActionsEndpoint(rscConfig, remoteEntry) {
          const remoteInfo =
            (null == rscConfig ? void 0 : rscConfig.remote) || null;
          const configuredPath =
            (null == rscConfig ? void 0 : rscConfig.actionsEndpointPath) ||
            (null == remoteInfo ? void 0 : remoteInfo.actionsEndpointPath) ||
            DEFAULT_ACTIONS_PATH;
          const actionsPath = normalizeActionsPath(configuredPath);
          if (remoteInfo && 'string' == typeof remoteInfo.actionsEndpoint)
            return remoteInfo.actionsEndpoint;
          if (remoteInfo && 'string' == typeof remoteInfo.url)
            try {
              const url = new URL(actionsPath, remoteInfo.url);
              return url.href;
            } catch (_e) {
              return `${remoteInfo.url.replace(/\/$/, '')}${actionsPath}`;
            }
          if ('string' == typeof remoteEntry && remoteEntry.startsWith('http'))
            try {
              const url = new URL(remoteEntry);
              url.pathname = url.pathname.replace(/\/[^/]*$/, actionsPath);
              url.search = '';
              return url.href;
            } catch (_e) {}
          return null;
        }
        function indexRemoteActions(
          remoteEntry,
          manifest,
          rscConfig,
          remoteNameHint,
        ) {
          if (!manifest || 'object' != typeof manifest) return;
          const remoteInfo =
            (null == rscConfig ? void 0 : rscConfig.remote) || null;
          const remoteName =
            remoteNameHint ||
            (null == remoteInfo ? void 0 : remoteInfo.name) ||
            (null == remoteInfo ? void 0 : remoteInfo.entryGlobalName) ||
            (null == remoteInfo ? void 0 : remoteInfo.globalName) ||
            null;
          const actionsEndpoint = getActionsEndpoint(rscConfig, remoteEntry);
          if (!remoteName || !actionsEndpoint) return;
          for (const actionId of Object.keys(manifest))
            if (!remoteActionIndex.has(actionId))
              remoteActionIndex.set(actionId, {
                remoteName,
                actionsEndpoint,
                remoteEntry,
              });
        }
        function indexRemoteActionIds(
          remoteEntry,
          actionIds,
          rscConfig,
          remoteNameHint,
        ) {
          if (!remoteEntry || !actionIds) return;
          const list =
            actionIds instanceof Set
              ? Array.from(actionIds)
              : Array.isArray(actionIds)
                ? actionIds
                : [];
          if (0 === list.length) return;
          const remoteInfo =
            (null == rscConfig ? void 0 : rscConfig.remote) || null;
          const remoteName =
            remoteNameHint ||
            (null == remoteInfo ? void 0 : remoteInfo.name) ||
            (null == remoteInfo ? void 0 : remoteInfo.entryGlobalName) ||
            (null == remoteInfo ? void 0 : remoteInfo.globalName) ||
            null;
          const actionsEndpoint = getActionsEndpoint(rscConfig, remoteEntry);
          if (!remoteName || !actionsEndpoint) return;
          for (const actionId of list)
            if ('string' == typeof actionId && 0 !== actionId.length) {
              if (!remoteActionIndex.has(actionId))
                remoteActionIndex.set(actionId, {
                  remoteName,
                  actionsEndpoint,
                  remoteEntry,
                });
            }
        }
        function isResponseLike(value) {
          return (
            value &&
            'object' == typeof value &&
            'function' == typeof value.json &&
            'number' == typeof value.status
          );
        }
        async function fetchJson(url, origin) {
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            FETCH_TIMEOUT_MS,
          );
          try {
            var _origin_loaderHook_lifecycle_fetch,
              _origin_loaderHook_lifecycle,
              _origin_loaderHook;
            let res;
            if (
              null == origin
                ? void 0
                : null == (_origin_loaderHook = origin.loaderHook)
                  ? void 0
                  : null ==
                      (_origin_loaderHook_lifecycle =
                        _origin_loaderHook.lifecycle)
                    ? void 0
                    : null ==
                        (_origin_loaderHook_lifecycle_fetch =
                          _origin_loaderHook_lifecycle.fetch)
                      ? void 0
                      : _origin_loaderHook_lifecycle_fetch.emit
            )
              try {
                res = await origin.loaderHook.lifecycle.fetch.emit(url, {
                  signal: controller.signal,
                });
              } catch (_e) {}
            if (!isResponseLike(res))
              res = await fetch(url, {
                signal: controller.signal,
              });
            if (!isResponseLike(res) || !res.ok) return null;
            return await res.json();
          } catch (e) {
            log(
              'Error fetching JSON',
              url,
              (null == e ? void 0 : e.message) || String(e),
            );
            return null;
          } finally {
            clearTimeout(timeoutId);
          }
        }
        function getSiblingRemoteUrl(remoteEntryUrl, filename) {
          try {
            const url = new URL(filename, remoteEntryUrl);
            return url.href;
          } catch (_e) {
            return remoteEntryUrl.replace(/\/[^/]+$/, `/${filename}`);
          }
        }
        function resolveRemoteAssetUrl(
          remoteEntryUrl,
          candidate,
          fallbackFilename,
        ) {
          if ('string' == typeof candidate && candidate.length > 0) {
            if (candidate.startsWith('http')) return candidate;
            if (
              'string' == typeof remoteEntryUrl &&
              remoteEntryUrl.startsWith('http')
            )
              return getSiblingRemoteUrl(remoteEntryUrl, candidate);
            return null;
          }
          if (
            'string' == typeof fallbackFilename &&
            fallbackFilename.length > 0 &&
            'string' == typeof remoteEntryUrl &&
            remoteEntryUrl.startsWith('http')
          )
            return getSiblingRemoteUrl(remoteEntryUrl, fallbackFilename);
          return null;
        }
        async function getMFManifest(remoteUrl, origin, remoteInfo) {
          const cached = getCacheValue(remoteMFManifests, remoteUrl);
          if (cached) return cached;
          try {
            const explicitManifestUrl = resolveExplicitManifestUrl(remoteInfo);
            if (!remoteUrl.startsWith('http') && !explicitManifestUrl) {
              log('Skipping non-HTTP remote entry (unsupported):', remoteUrl);
              return null;
            }
            let isManifestUrl = false;
            try {
              const url = new URL(remoteUrl);
              isManifestUrl =
                url.pathname.includes('mf-manifest') &&
                url.pathname.endsWith('.json');
            } catch (_e) {
              isManifestUrl =
                remoteUrl.includes('mf-manifest') &&
                remoteUrl.endsWith('.json');
            }
            const manifestFileName = remoteUrl.includes('remoteEntry.server')
              ? 'mf-manifest.server.json'
              : remoteUrl.includes('remoteEntry.ssr')
                ? 'mf-manifest.ssr.json'
                : 'mf-manifest.json';
            const statsUrl = explicitManifestUrl
              ? explicitManifestUrl
              : isManifestUrl
                ? remoteUrl
                : getSiblingRemoteUrl(remoteUrl, manifestFileName);
            log('Fetching MF manifest from:', statsUrl);
            const json = await fetchJson(statsUrl, origin);
            if (!json) return null;
            return setCacheValue(remoteMFManifests, remoteUrl, json);
          } catch (e) {
            log('Error fetching federation stats/manifest:', e.message);
            return null;
          }
        }
        async function getRemoteRSCConfig(remoteUrl, origin, remoteInfo) {
          const cached = getCacheValue(remoteRSCConfigs, remoteUrl);
          if (cached) return cached;
          try {
            var _stats_additionalData;
            const stats = await getMFManifest(remoteUrl, origin, remoteInfo);
            const additionalRsc =
              (null == stats
                ? void 0
                : null == (_stats_additionalData = stats.additionalData)
                  ? void 0
                  : _stats_additionalData.rsc) || null;
            let rscConfig =
              (null == stats ? void 0 : stats.rsc) || additionalRsc || null;
            if (rscConfig && additionalRsc) {
              const remoteFromAdditional =
                additionalRsc.remote && 'object' == typeof additionalRsc.remote
                  ? additionalRsc.remote
                  : null;
              const remoteFromStats =
                rscConfig.remote && 'object' == typeof rscConfig.remote
                  ? rscConfig.remote
                  : null;
              rscConfig = {
                ...additionalRsc,
                ...rscConfig,
                remote: {
                  ...(remoteFromAdditional || {}),
                  ...(remoteFromStats || {}),
                },
              };
            }
            if (rscConfig) {
              const hint = getRemoteNameHint(remoteInfo, stats);
              if (hint) {
                const remoteCfg =
                  rscConfig.remote && 'object' == typeof rscConfig.remote
                    ? rscConfig.remote
                    : null;
                if (!remoteCfg || 'string' != typeof remoteCfg.name)
                  rscConfig.remote = {
                    ...(remoteCfg || {}),
                    name: hint,
                  };
              }
            }
            if ((null == stats ? void 0 : stats.additionalData) && rscConfig)
              rscConfig.additionalData = stats.additionalData;
            if (rscConfig)
              setCacheValue(remoteRSCConfigs, remoteUrl, rscConfig);
            log('Loaded RSC config:', JSON.stringify(rscConfig, null, 2));
            return rscConfig;
          } catch (error) {
            log('Error fetching RSC config:', error.message);
            return null;
          }
        }
        async function getRemoteServerActionsManifest(
          remoteUrl,
          origin,
          remoteInfo,
        ) {
          const cached = getCacheValue(
            remoteServerActionsManifests,
            remoteUrl,
            () => clearRemoteActionIndex(remoteUrl),
          );
          if (cached) return cached;
          try {
            const stats = await getMFManifest(remoteUrl, origin, remoteInfo);
            const rscConfig = await getRemoteRSCConfig(
              remoteUrl,
              origin,
              remoteInfo,
            );
            const manifestUrl = resolveRemoteAssetUrl(
              remoteUrl,
              null == rscConfig ? void 0 : rscConfig.serverActionsManifest,
              'react-server-actions-manifest.json',
            );
            if (!manifestUrl) return null;
            log('Fetching server actions manifest from:', manifestUrl);
            if (!manifestUrl.startsWith('http')) return null;
            const manifest = await fetchJson(manifestUrl, origin);
            if (!manifest) return null;
            clearRemoteActionIndex(remoteUrl);
            setCacheValue(remoteServerActionsManifests, remoteUrl, manifest);
            indexRemoteActions(
              remoteUrl,
              manifest,
              rscConfig,
              getRemoteNameHint(remoteInfo, stats),
            );
            log(
              'Loaded server actions manifest with',
              Object.keys(manifest).length,
              'actions',
            );
            return manifest;
          } catch (error) {
            log('Error fetching server actions manifest:', error.message);
            return null;
          }
        }
        function registerServerActionsFromModule(
          remoteName,
          exposeModule,
          manifest,
        ) {
          if (!exposeModule || !manifest) return 0;
          let registeredCount = 0;
          try {
            const { registerServerReference } = __nested_webpack_require_245__(
              '@module-federation/react-server-dom-webpack/server',
            );
            const manifestEntries = manifest;
            for (const [actionId, entry] of Object.entries(manifestEntries)) {
              if (!isServerActionManifestEntry(entry)) continue;
              const exportName = entry.name;
              const fn =
                'default' === exportName
                  ? exposeModule.default
                  : exposeModule[exportName];
              if ('function' == typeof fn) {
                registerServerReference(fn, entry.id, exportName);
                registeredCount++;
                log(`Registered action: ${actionId} -> ${exportName}`);
              }
            }
          } catch (error) {
            log('Error registering server actions:', error.message);
          }
          return registeredCount;
        }
        async function registerRemoteActionsAtInit(
          remoteInfo,
          remoteEntryExports,
          origin,
        ) {
          const remoteName =
            (null == remoteInfo ? void 0 : remoteInfo.name) ||
            (null == remoteInfo ? void 0 : remoteInfo.entryGlobalName) ||
            'remote';
          const remoteEntry = null == remoteInfo ? void 0 : remoteInfo.entry;
          const registrationKey = `${remoteName}:server-actions:init`;
          if (registeredRemotes.has(registrationKey)) return;
          if (registeringRemotes.has(registrationKey))
            return registeringRemotes.get(registrationKey);
          const work = (async () => {
            try {
              if (!remoteEntry) return;
              const rscConfig = await getRemoteRSCConfig(
                remoteEntry,
                origin,
                remoteInfo,
              );
              const exposeTypes =
                (null == rscConfig ? void 0 : rscConfig.exposeTypes) &&
                'object' == typeof rscConfig.exposeTypes
                  ? rscConfig.exposeTypes
                  : null;
              const exposesToRegister = new Set();
              if (exposeTypes) {
                for (const [key, type] of Object.entries(exposeTypes))
                  if ('server-action' === type && 'string' == typeof key)
                    exposesToRegister.add(key);
              }
              if (0 === exposesToRegister.size)
                return void log(
                  'No server-action exposes declared for',
                  remoteName,
                );
              const manifest = await getRemoteServerActionsManifest(
                remoteEntry,
                origin,
                remoteInfo,
              );
              if (!manifest)
                return void log(
                  'No server actions manifest during init for',
                  remoteName,
                );
              if (
                !(null == remoteEntryExports ? void 0 : remoteEntryExports.get)
              )
                return void log(
                  'remoteEntryExports.get is missing for',
                  remoteName,
                );
              for (const exposeKey of exposesToRegister) {
                const factory = await remoteEntryExports.get(exposeKey);
                if (!factory) continue;
                const exposeModule = await factory();
                const count = registerServerActionsFromModule(
                  remoteName,
                  exposeModule,
                  manifest,
                );
                if (count > 0) {
                  registeredRemotes.add(registrationKey);
                  registeredRemotes.add(`${remoteName}:${exposeKey}`);
                  log(
                    `Registered ${count} server actions at init for ${remoteName}:${exposeKey}`,
                  );
                }
              }
            } catch (error) {
              log(
                'Error registering actions at init for',
                remoteName,
                error.message,
              );
            } finally {
              registeringRemotes.delete(registrationKey);
            }
          })();
          registeringRemotes.set(registrationKey, work);
          return work;
        }
        async function resolveRemoteAction(actionId, origin) {
          if (!actionId) return null;
          const parsed = parseRemoteActionId(actionId);
          const normalizedId = parsed ? parsed.forwardedId : actionId;
          const cached = remoteActionIndex.get(normalizedId);
          if (cached && (!parsed || parsed.remoteName === cached.remoteName))
            return {
              ...cached,
              forwardedId: normalizedId,
            };
          if (parsed) {
            const remotes = getFederationRemotes(origin, parsed.remoteName);
            const remote = remotes[0];
            if (!remote) return null;
            const rscConfig = await getRemoteRSCConfig(
              remote.entry,
              origin,
              remote.raw,
            );
            const actionsEndpoint = getActionsEndpoint(rscConfig, remote.entry);
            if (!actionsEndpoint) return null;
            await getRemoteServerActionsManifest(
              remote.entry,
              origin,
              remote.raw,
            );
            return {
              remoteName: remote.name,
              actionsEndpoint,
              remoteEntry: remote.entry,
              forwardedId: normalizedId,
            };
          }
          const remotes = getFederationRemotes(origin);
          for (const remote of remotes) {
            const manifest = await getRemoteServerActionsManifest(
              remote.entry,
              origin,
              remote.raw,
            );
            if (manifest && manifest[normalizedId]) {
              const info = remoteActionIndex.get(normalizedId);
              if (info)
                return {
                  ...info,
                  forwardedId: normalizedId,
                };
              const rscConfig = await getRemoteRSCConfig(
                remote.entry,
                origin,
                remote.raw,
              );
              const actionsEndpoint = getActionsEndpoint(
                rscConfig,
                remote.entry,
              );
              if (!actionsEndpoint) continue;
              return {
                remoteName: remote.name,
                actionsEndpoint,
                remoteEntry: remote.entry,
                forwardedId: normalizedId,
              };
            }
          }
          return null;
        }
        function getIndexedRemoteAction(actionId) {
          if (!actionId) return null;
          const parsed = parseRemoteActionId(actionId);
          const normalizedId = parsed ? parsed.forwardedId : actionId;
          const cached = remoteActionIndex.get(normalizedId);
          if (!cached) return null;
          if (parsed && parsed.remoteName !== cached.remoteName) return null;
          if (parsed)
            return {
              ...cached,
              forwardedId: normalizedId,
            };
          return {
            ...cached,
          };
        }
        async function ensureRemoteServerActions(remoteName, origin) {
          if (!origin || 'function' != typeof origin.loadRemote) return;
          if ('string' != typeof remoteName || 0 === remoteName.length) return;
          const ensureKey = `${remoteName}:server-actions:ensure`;
          if (registeredRemotes.has(ensureKey)) return;
          if (registeringRemotes.has(ensureKey))
            return registeringRemotes.get(ensureKey);
          const work = (async () => {
            try {
              const remotes = getFederationRemotes(origin, remoteName);
              const remote = remotes && remotes.length > 0 ? remotes[0] : null;
              if (!remote) return;
              const rscConfig = await getRemoteRSCConfig(
                remote.entry,
                origin,
                remote.raw,
              );
              const exposeTypes =
                (null == rscConfig ? void 0 : rscConfig.exposeTypes) &&
                'object' == typeof rscConfig.exposeTypes
                  ? rscConfig.exposeTypes
                  : null;
              const serverActionExposes = exposeTypes
                ? Object.keys(exposeTypes)
                    .filter((key) => 'server-action' === exposeTypes[key])
                    .sort()
                : [];
              if (0 === serverActionExposes.length) return;
              for (const exposeKey of serverActionExposes) {
                const registrationKey = `${remote.name}:${exposeKey}`;
                if (registeredRemotes.has(registrationKey)) continue;
                const request = formatRemoteRequest(remote.name, exposeKey);
                if (request)
                  await origin.loadRemote(request, {
                    loadFactory: false,
                    from: 'runtime',
                  });
              }
              registeredRemotes.add(ensureKey);
            } finally {
              registeringRemotes.delete(ensureKey);
            }
          })();
          registeringRemotes.set(ensureKey, work);
          return work;
        }
        async function ensureRemoteActionsForAction(actionId, origin) {
          if (!origin) return null;
          const parsed = parseRemoteActionId(actionId);
          const remoteName = null == parsed ? void 0 : parsed.remoteName;
          if (remoteName) {
            await ensureRemoteServerActions(remoteName, origin);
            return remoteName;
          }
          const resolved = await resolveRemoteAction(actionId, origin);
          if (!(null == resolved ? void 0 : resolved.remoteName)) return null;
          await ensureRemoteServerActions(resolved.remoteName, origin);
          return resolved.remoteName;
        }
        function rscRuntimePlugin() {
          return {
            name: 'rsc-runtime-plugin',
            version: '1.0.0',
            async afterResolve(args) {
              var _args_remote, _args_remote1;
              log(
                'afterResolve - id:',
                args.id,
                'expose:',
                args.expose,
                'remote:',
                null == (_args_remote = args.remote)
                  ? void 0
                  : _args_remote.name,
              );
              if (
                (null == (_args_remote1 = args.remote)
                  ? void 0
                  : _args_remote1.entry) &&
                !getCacheValue(remoteRSCConfigs, args.remote.entry)
              )
                getRemoteRSCConfig(
                  args.remote.entry,
                  args.origin,
                  args.remote,
                ).catch(() => {});
              return args;
            },
            async onLoad(args) {
              var _args_remote;
              log(
                'onLoad - expose:',
                args.expose,
                'remote:',
                null == (_args_remote = args.remote)
                  ? void 0
                  : _args_remote.name,
              );
              if (!args.remote || !args.expose) return args;
              const remoteName = args.remote.name;
              const remoteEntry = args.remote.entry;
              const exposeKey = args.expose;
              const rscConfig = await getRemoteRSCConfig(
                remoteEntry,
                args.origin,
                args.remote,
              );
              const exposeTypes =
                (null == rscConfig ? void 0 : rscConfig.exposeTypes) &&
                'object' == typeof rscConfig.exposeTypes
                  ? rscConfig.exposeTypes
                  : null;
              const isServerActionsExpose =
                !!exposeTypes && 'server-action' === exposeTypes[exposeKey];
              if (!isServerActionsExpose) {
                log('Not a server-actions expose, skipping registration');
                return args;
              }
              const registrationKey = `${remoteName}:${exposeKey}`;
              if (registeredRemotes.has(registrationKey)) {
                log('Actions already registered for', registrationKey);
                return args;
              }
              log('Detected server-actions expose, attempting registration...');
              const manifest = await getRemoteServerActionsManifest(
                remoteEntry,
                args.origin,
                args.remote,
              );
              if (!manifest) {
                log('No server actions manifest available for', remoteName);
                return args;
              }
              const exposeModule = args.exposeModule;
              if (!exposeModule) {
                log('No exposeModule available');
                return args;
              }
              const count = registerServerActionsFromModule(
                remoteName,
                exposeModule,
                manifest,
              );
              if (count > 0) {
                registeredRemotes.add(registrationKey);
                log(
                  `Registered ${count} server actions from ${remoteName}:${exposeKey}`,
                );
              }
              return args;
            },
            async initContainer(args) {
              var _args_remoteInfo, _args_remoteInfo1;
              log(
                'initContainer - remote:',
                null == (_args_remoteInfo = args.remoteInfo)
                  ? void 0
                  : _args_remoteInfo.name,
                'entry:',
                null == (_args_remoteInfo1 = args.remoteInfo)
                  ? void 0
                  : _args_remoteInfo1.entry,
              );
              await registerRemoteActionsAtInit(
                args.remoteInfo,
                args.remoteEntryExports,
                args.origin,
              );
              return args;
            },
          };
        }
      })();
      exports['default'] = __webpack_exports__['default'];
      exports.ensureRemoteActionsForAction =
        __webpack_exports__.ensureRemoteActionsForAction;
      exports.ensureRemoteServerActions =
        __webpack_exports__.ensureRemoteServerActions;
      exports.formatRemoteRequest = __webpack_exports__.formatRemoteRequest;
      exports.getFederationInstance = __webpack_exports__.getFederationInstance;
      exports.getFederationRemotes = __webpack_exports__.getFederationRemotes;
      exports.getIndexedRemoteAction =
        __webpack_exports__.getIndexedRemoteAction;
      exports.getRemoteRSCConfig = __webpack_exports__.getRemoteRSCConfig;
      exports.getRemoteServerActionsManifest =
        __webpack_exports__.getRemoteServerActionsManifest;
      exports.indexRemoteActionIds = __webpack_exports__.indexRemoteActionIds;
      exports.parseRemoteActionId = __webpack_exports__.parseRemoteActionId;
      exports.registeredRemotes = __webpack_exports__.registeredRemotes;
      exports.resolveRemoteAction = __webpack_exports__.resolveRemoteAction;
      for (var __webpack_i__ in __webpack_exports__)
        if (
          -1 ===
          [
            'default',
            'ensureRemoteActionsForAction',
            'ensureRemoteServerActions',
            'formatRemoteRequest',
            'getFederationInstance',
            'getFederationRemotes',
            'getIndexedRemoteAction',
            'getRemoteRSCConfig',
            'getRemoteServerActionsManifest',
            'indexRemoteActionIds',
            'parseRemoteActionId',
            'registeredRemotes',
            'resolveRemoteAction',
          ].indexOf(__webpack_i__)
        )
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },

    /***/ '../../../packages/rsc/dist/rscSSRRuntimePlugin.js': /***/ (
      __unused_webpack_module,
      exports,
    ) => {
      var __nested_webpack_require_19__ = {};
      (() => {
        __nested_webpack_require_19__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_19__.o(definition, key) &&
              !__nested_webpack_require_19__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_19__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_19__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      __nested_webpack_require_19__.r(__webpack_exports__);
      __nested_webpack_require_19__.d(__webpack_exports__, {
        default: () => rscSSRRuntimePlugin,
      });
      function rscSSRRuntimePlugin() {
        let registryInitialized = false;
        async function fetchJson(url) {
          if ('function' != typeof fetch) return null;
          try {
            const res = await fetch(url);
            if (!res || !res.ok) return null;
            return await res.json();
          } catch (_e) {
            return null;
          }
        }
        function initializeRegistry() {
          if (registryInitialized) return;
          registryInitialized = true;
          globalThis.__RSC_SSR_REGISTRY__ =
            globalThis.__RSC_SSR_REGISTRY__ || {};
          if (globalThis.__RSC_SSR_MANIFEST__) {
            var _globalThis___RSC_SSR_MANIFEST___additionalData_rsc,
              _globalThis___RSC_SSR_MANIFEST___additionalData,
              _globalThis___RSC_SSR_MANIFEST__,
              _globalThis___RSC_SSR_MANIFEST___rsc,
              _globalThis___RSC_SSR_MANIFEST__1;
            const registry =
              (null ==
              (_globalThis___RSC_SSR_MANIFEST__ =
                globalThis.__RSC_SSR_MANIFEST__)
                ? void 0
                : null ==
                    (_globalThis___RSC_SSR_MANIFEST___additionalData =
                      _globalThis___RSC_SSR_MANIFEST__.additionalData)
                  ? void 0
                  : null ==
                      (_globalThis___RSC_SSR_MANIFEST___additionalData_rsc =
                        _globalThis___RSC_SSR_MANIFEST___additionalData.rsc)
                    ? void 0
                    : _globalThis___RSC_SSR_MANIFEST___additionalData_rsc.clientComponents) ||
              (null ==
              (_globalThis___RSC_SSR_MANIFEST__1 =
                globalThis.__RSC_SSR_MANIFEST__)
                ? void 0
                : null ==
                    (_globalThis___RSC_SSR_MANIFEST___rsc =
                      _globalThis___RSC_SSR_MANIFEST__1.rsc)
                  ? void 0
                  : _globalThis___RSC_SSR_MANIFEST___rsc.clientComponents) ||
              null;
            if (registry)
              Object.assign(globalThis.__RSC_SSR_REGISTRY__, registry);
          }
        }
        function mergeRegistryFrom(manifestJson) {
          var _manifestJson_additionalData_rsc,
            _manifestJson_additionalData,
            _manifestJson_rsc;
          if (!manifestJson) return;
          const registry =
            (null == manifestJson
              ? void 0
              : null ==
                  (_manifestJson_additionalData = manifestJson.additionalData)
                ? void 0
                : null ==
                    (_manifestJson_additionalData_rsc =
                      _manifestJson_additionalData.rsc)
                  ? void 0
                  : _manifestJson_additionalData_rsc.clientComponents) ||
            (null == manifestJson
              ? void 0
              : null == (_manifestJson_rsc = manifestJson.rsc)
                ? void 0
                : _manifestJson_rsc.clientComponents) ||
            null;
          if (registry) {
            globalThis.__RSC_SSR_REGISTRY__ =
              globalThis.__RSC_SSR_REGISTRY__ || {};
            Object.assign(globalThis.__RSC_SSR_REGISTRY__, registry);
          }
        }
        function resolveSsrManifestUrl(manifestJson, manifestUrl) {
          var _manifestJson_additionalData_rsc,
            _manifestJson_additionalData,
            _manifestJson_rsc;
          const candidate =
            (null == manifestJson
              ? void 0
              : null ==
                  (_manifestJson_additionalData = manifestJson.additionalData)
                ? void 0
                : null ==
                    (_manifestJson_additionalData_rsc =
                      _manifestJson_additionalData.rsc)
                  ? void 0
                  : _manifestJson_additionalData_rsc.ssrManifest) ||
            (null == manifestJson
              ? void 0
              : null == (_manifestJson_rsc = manifestJson.rsc)
                ? void 0
                : _manifestJson_rsc.ssrManifest) ||
            null;
          if (!candidate || 'string' != typeof candidate) return null;
          if (candidate.startsWith('http')) return candidate;
          if (manifestUrl && 'string' == typeof manifestUrl)
            try {
              return new URL(candidate, manifestUrl).href;
            } catch (_e) {
              return null;
            }
          return candidate;
        }
        return {
          name: 'rsc-ssr-runtime-plugin',
          beforeInit(args) {
            initializeRegistry();
            return args;
          },
          async loadRemoteSnapshot(args) {
            var _args_manifestJson_additionalData_rsc,
              _args_manifestJson_additionalData,
              _args_manifestJson,
              _args_manifestJson_rsc,
              _args_manifestJson1;
            mergeRegistryFrom(args.manifestJson);
            const layer =
              (null == args
                ? void 0
                : null == (_args_manifestJson = args.manifestJson)
                  ? void 0
                  : null ==
                      (_args_manifestJson_additionalData =
                        _args_manifestJson.additionalData)
                    ? void 0
                    : null ==
                        (_args_manifestJson_additionalData_rsc =
                          _args_manifestJson_additionalData.rsc)
                      ? void 0
                      : _args_manifestJson_additionalData_rsc.layer) ||
              (null == args
                ? void 0
                : null == (_args_manifestJson1 = args.manifestJson)
                  ? void 0
                  : null == (_args_manifestJson_rsc = _args_manifestJson1.rsc)
                    ? void 0
                    : _args_manifestJson_rsc.layer);
            const needsSsrManifest = layer && 'ssr' !== layer;
            if (needsSsrManifest) {
              const ssrManifestUrl = resolveSsrManifestUrl(
                args.manifestJson,
                args.manifestUrl,
              );
              if (ssrManifestUrl) {
                const ssrManifest = await fetchJson(ssrManifestUrl);
                mergeRegistryFrom(ssrManifest);
              }
            }
            return args;
          },
        };
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },

    /***/ '../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/cjs/react-dom.react-server.production.js':
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        /**
         * @license React
         * react-dom.react-server.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var React = __webpack_require__(
          '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
        );
        function noop() {}
        var Internals = {
          d: {
            f: noop,
            r: function () {
              throw Error(
                'Invalid form element. requestFormReset must be passed a form that was rendered by React.',
              );
            },
            D: noop,
            C: noop,
            L: noop,
            m: noop,
            X: noop,
            S: noop,
            M: noop,
          },
          p: 0,
          findDOMNode: null,
        };
        if (
          !React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
        )
          throw Error(
            'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.',
          );
        function getCrossOriginStringAs(as, input) {
          if ('font' === as) return '';
          if ('string' === typeof input)
            return 'use-credentials' === input ? input : '';
        }
        exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
          Internals;
        exports.preconnect = function (href, options) {
          'string' === typeof href &&
            (options
              ? ((options = options.crossOrigin),
                (options =
                  'string' === typeof options
                    ? 'use-credentials' === options
                      ? options
                      : ''
                    : void 0))
              : (options = null),
            Internals.d.C(href, options));
        };
        exports.prefetchDNS = function (href) {
          'string' === typeof href && Internals.d.D(href);
        };
        exports.preinit = function (href, options) {
          if (
            'string' === typeof href &&
            options &&
            'string' === typeof options.as
          ) {
            var as = options.as,
              crossOrigin = getCrossOriginStringAs(as, options.crossOrigin),
              integrity =
                'string' === typeof options.integrity
                  ? options.integrity
                  : void 0,
              fetchPriority =
                'string' === typeof options.fetchPriority
                  ? options.fetchPriority
                  : void 0;
            'style' === as
              ? Internals.d.S(
                  href,
                  'string' === typeof options.precedence
                    ? options.precedence
                    : void 0,
                  {
                    crossOrigin: crossOrigin,
                    integrity: integrity,
                    fetchPriority: fetchPriority,
                  },
                )
              : 'script' === as &&
                Internals.d.X(href, {
                  crossOrigin: crossOrigin,
                  integrity: integrity,
                  fetchPriority: fetchPriority,
                  nonce:
                    'string' === typeof options.nonce ? options.nonce : void 0,
                });
          }
        };
        exports.preinitModule = function (href, options) {
          if ('string' === typeof href)
            if ('object' === typeof options && null !== options) {
              if (null == options.as || 'script' === options.as) {
                var crossOrigin = getCrossOriginStringAs(
                  options.as,
                  options.crossOrigin,
                );
                Internals.d.M(href, {
                  crossOrigin: crossOrigin,
                  integrity:
                    'string' === typeof options.integrity
                      ? options.integrity
                      : void 0,
                  nonce:
                    'string' === typeof options.nonce ? options.nonce : void 0,
                });
              }
            } else null == options && Internals.d.M(href);
        };
        exports.preload = function (href, options) {
          if (
            'string' === typeof href &&
            'object' === typeof options &&
            null !== options &&
            'string' === typeof options.as
          ) {
            var as = options.as,
              crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
            Internals.d.L(href, as, {
              crossOrigin: crossOrigin,
              integrity:
                'string' === typeof options.integrity
                  ? options.integrity
                  : void 0,
              nonce: 'string' === typeof options.nonce ? options.nonce : void 0,
              type: 'string' === typeof options.type ? options.type : void 0,
              fetchPriority:
                'string' === typeof options.fetchPriority
                  ? options.fetchPriority
                  : void 0,
              referrerPolicy:
                'string' === typeof options.referrerPolicy
                  ? options.referrerPolicy
                  : void 0,
              imageSrcSet:
                'string' === typeof options.imageSrcSet
                  ? options.imageSrcSet
                  : void 0,
              imageSizes:
                'string' === typeof options.imageSizes
                  ? options.imageSizes
                  : void 0,
              media: 'string' === typeof options.media ? options.media : void 0,
            });
          }
        };
        exports.preloadModule = function (href, options) {
          if ('string' === typeof href)
            if (options) {
              var crossOrigin = getCrossOriginStringAs(
                options.as,
                options.crossOrigin,
              );
              Internals.d.m(href, {
                as:
                  'string' === typeof options.as && 'script' !== options.as
                    ? options.as
                    : void 0,
                crossOrigin: crossOrigin,
                integrity:
                  'string' === typeof options.integrity
                    ? options.integrity
                    : void 0,
              });
            } else Internals.d.m(href);
        };
        exports.version = '19.2.0';

        /***/
      },

    /***/ '../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/react-dom.react-server.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        if (true) {
          module.exports = __webpack_require__(
            '../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/cjs/react-dom.react-server.production.js',
          );
        } else {
        }

        /***/
      },

    /***/ '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react.react-server.production.js':
      /***/ (__unused_webpack_module, exports) => {
        /**
         * @license React
         * react.react-server.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var ReactSharedInternals = { H: null, A: null };
        function formatProdErrorMessage(code) {
          var url = 'https://react.dev/errors/' + code;
          if (1 < arguments.length) {
            url += '?args[]=' + encodeURIComponent(arguments[1]);
            for (var i = 2; i < arguments.length; i++)
              url += '&args[]=' + encodeURIComponent(arguments[i]);
          }
          return (
            'Minified React error #' +
            code +
            '; visit ' +
            url +
            ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
          );
        }
        var isArrayImpl = Array.isArray;
        function noop() {}
        var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_PORTAL_TYPE = Symbol.for('react.portal'),
          REACT_FRAGMENT_TYPE = Symbol.for('react.fragment'),
          REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode'),
          REACT_PROFILER_TYPE = Symbol.for('react.profiler'),
          REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref'),
          REACT_SUSPENSE_TYPE = Symbol.for('react.suspense'),
          REACT_MEMO_TYPE = Symbol.for('react.memo'),
          REACT_LAZY_TYPE = Symbol.for('react.lazy'),
          MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        function getIteratorFn(maybeIterable) {
          if (null === maybeIterable || 'object' !== typeof maybeIterable)
            return null;
          maybeIterable =
            (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
            maybeIterable['@@iterator'];
          return 'function' === typeof maybeIterable ? maybeIterable : null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty,
          assign = Object.assign;
        function ReactElement(type, key, props) {
          var refProp = props.ref;
          return {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            ref: void 0 !== refProp ? refProp : null,
            props: props,
          };
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          return ReactElement(oldElement.type, newKey, oldElement.props);
        }
        function isValidElement(object) {
          return (
            'object' === typeof object &&
            null !== object &&
            object.$$typeof === REACT_ELEMENT_TYPE
          );
        }
        function escape(key) {
          var escaperLookup = { '=': '=0', ':': '=2' };
          return (
            '$' +
            key.replace(/[=:]/g, function (match) {
              return escaperLookup[match];
            })
          );
        }
        var userProvidedKeyEscapeRegex = /\/+/g;
        function getElementKey(element, index) {
          return 'object' === typeof element &&
            null !== element &&
            null != element.key
            ? escape('' + element.key)
            : index.toString(36);
        }
        function resolveThenable(thenable) {
          switch (thenable.status) {
            case 'fulfilled':
              return thenable.value;
            case 'rejected':
              throw thenable.reason;
            default:
              switch (
                ('string' === typeof thenable.status
                  ? thenable.then(noop, noop)
                  : ((thenable.status = 'pending'),
                    thenable.then(
                      function (fulfilledValue) {
                        'pending' === thenable.status &&
                          ((thenable.status = 'fulfilled'),
                          (thenable.value = fulfilledValue));
                      },
                      function (error) {
                        'pending' === thenable.status &&
                          ((thenable.status = 'rejected'),
                          (thenable.reason = error));
                      },
                    )),
                thenable.status)
              ) {
                case 'fulfilled':
                  return thenable.value;
                case 'rejected':
                  throw thenable.reason;
              }
          }
          throw thenable;
        }
        function mapIntoArray(
          children,
          array,
          escapedPrefix,
          nameSoFar,
          callback,
        ) {
          var type = typeof children;
          if ('undefined' === type || 'boolean' === type) children = null;
          var invokeCallback = !1;
          if (null === children) invokeCallback = !0;
          else
            switch (type) {
              case 'bigint':
              case 'string':
              case 'number':
                invokeCallback = !0;
                break;
              case 'object':
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = !0;
                    break;
                  case REACT_LAZY_TYPE:
                    return (
                      (invokeCallback = children._init),
                      mapIntoArray(
                        invokeCallback(children._payload),
                        array,
                        escapedPrefix,
                        nameSoFar,
                        callback,
                      )
                    );
                }
            }
          if (invokeCallback)
            return (
              (callback = callback(children)),
              (invokeCallback =
                '' === nameSoFar
                  ? '.' + getElementKey(children, 0)
                  : nameSoFar),
              isArrayImpl(callback)
                ? ((escapedPrefix = ''),
                  null != invokeCallback &&
                    (escapedPrefix =
                      invokeCallback.replace(
                        userProvidedKeyEscapeRegex,
                        '$&/',
                      ) + '/'),
                  mapIntoArray(
                    callback,
                    array,
                    escapedPrefix,
                    '',
                    function (c) {
                      return c;
                    },
                  ))
                : null != callback &&
                  (isValidElement(callback) &&
                    (callback = cloneAndReplaceKey(
                      callback,
                      escapedPrefix +
                        (null == callback.key ||
                        (children && children.key === callback.key)
                          ? ''
                          : ('' + callback.key).replace(
                              userProvidedKeyEscapeRegex,
                              '$&/',
                            ) + '/') +
                        invokeCallback,
                    )),
                  array.push(callback)),
              1
            );
          invokeCallback = 0;
          var nextNamePrefix = '' === nameSoFar ? '.' : nameSoFar + ':';
          if (isArrayImpl(children))
            for (var i = 0; i < children.length; i++)
              (nameSoFar = children[i]),
                (type = nextNamePrefix + getElementKey(nameSoFar, i)),
                (invokeCallback += mapIntoArray(
                  nameSoFar,
                  array,
                  escapedPrefix,
                  type,
                  callback,
                ));
          else if (((i = getIteratorFn(children)), 'function' === typeof i))
            for (
              children = i.call(children), i = 0;
              !(nameSoFar = children.next()).done;

            )
              (nameSoFar = nameSoFar.value),
                (type = nextNamePrefix + getElementKey(nameSoFar, i++)),
                (invokeCallback += mapIntoArray(
                  nameSoFar,
                  array,
                  escapedPrefix,
                  type,
                  callback,
                ));
          else if ('object' === type) {
            if ('function' === typeof children.then)
              return mapIntoArray(
                resolveThenable(children),
                array,
                escapedPrefix,
                nameSoFar,
                callback,
              );
            array = String(children);
            throw Error(
              formatProdErrorMessage(
                31,
                '[object Object]' === array
                  ? 'object with keys {' +
                      Object.keys(children).join(', ') +
                      '}'
                  : array,
              ),
            );
          }
          return invokeCallback;
        }
        function mapChildren(children, func, context) {
          if (null == children) return children;
          var result = [],
            count = 0;
          mapIntoArray(children, result, '', '', function (child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function lazyInitializer(payload) {
          if (-1 === payload._status) {
            var ctor = payload._result;
            ctor = ctor();
            ctor.then(
              function (moduleObject) {
                if (0 === payload._status || -1 === payload._status)
                  (payload._status = 1), (payload._result = moduleObject);
              },
              function (error) {
                if (0 === payload._status || -1 === payload._status)
                  (payload._status = 2), (payload._result = error);
              },
            );
            -1 === payload._status &&
              ((payload._status = 0), (payload._result = ctor));
          }
          if (1 === payload._status) return payload._result.default;
          throw payload._result;
        }
        function createCacheRoot() {
          return new WeakMap();
        }
        function createCacheNode() {
          return { s: 0, v: void 0, o: null, p: null };
        }
        exports.Children = {
          map: mapChildren,
          forEach: function (children, forEachFunc, forEachContext) {
            mapChildren(
              children,
              function () {
                forEachFunc.apply(this, arguments);
              },
              forEachContext,
            );
          },
          count: function (children) {
            var n = 0;
            mapChildren(children, function () {
              n++;
            });
            return n;
          },
          toArray: function (children) {
            return (
              mapChildren(children, function (child) {
                return child;
              }) || []
            );
          },
          only: function (children) {
            if (!isValidElement(children))
              throw Error(formatProdErrorMessage(143));
            return children;
          },
        };
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
          ReactSharedInternals;
        exports.cache = function (fn) {
          return function () {
            var dispatcher = ReactSharedInternals.A;
            if (!dispatcher) return fn.apply(null, arguments);
            var fnMap = dispatcher.getCacheForType(createCacheRoot);
            dispatcher = fnMap.get(fn);
            void 0 === dispatcher &&
              ((dispatcher = createCacheNode()), fnMap.set(fn, dispatcher));
            fnMap = 0;
            for (var l = arguments.length; fnMap < l; fnMap++) {
              var arg = arguments[fnMap];
              if (
                'function' === typeof arg ||
                ('object' === typeof arg && null !== arg)
              ) {
                var objectCache = dispatcher.o;
                null === objectCache &&
                  (dispatcher.o = objectCache = new WeakMap());
                dispatcher = objectCache.get(arg);
                void 0 === dispatcher &&
                  ((dispatcher = createCacheNode()),
                  objectCache.set(arg, dispatcher));
              } else
                (objectCache = dispatcher.p),
                  null === objectCache &&
                    (dispatcher.p = objectCache = new Map()),
                  (dispatcher = objectCache.get(arg)),
                  void 0 === dispatcher &&
                    ((dispatcher = createCacheNode()),
                    objectCache.set(arg, dispatcher));
            }
            if (1 === dispatcher.s) return dispatcher.v;
            if (2 === dispatcher.s) throw dispatcher.v;
            try {
              var result = fn.apply(null, arguments);
              fnMap = dispatcher;
              fnMap.s = 1;
              return (fnMap.v = result);
            } catch (error) {
              throw (
                ((result = dispatcher),
                (result.s = 2),
                (result.v = error),
                error)
              );
            }
          };
        };
        exports.cacheSignal = function () {
          var dispatcher = ReactSharedInternals.A;
          return dispatcher ? dispatcher.cacheSignal() : null;
        };
        exports.captureOwnerStack = function () {
          return null;
        };
        exports.cloneElement = function (element, config, children) {
          if (null === element || void 0 === element)
            throw Error(formatProdErrorMessage(267, element));
          var props = assign({}, element.props),
            key = element.key;
          if (null != config)
            for (propName in (void 0 !== config.key && (key = '' + config.key),
            config))
              !hasOwnProperty.call(config, propName) ||
                'key' === propName ||
                '__self' === propName ||
                '__source' === propName ||
                ('ref' === propName && void 0 === config.ref) ||
                (props[propName] = config[propName]);
          var propName = arguments.length - 2;
          if (1 === propName) props.children = children;
          else if (1 < propName) {
            for (var childArray = Array(propName), i = 0; i < propName; i++)
              childArray[i] = arguments[i + 2];
            props.children = childArray;
          }
          return ReactElement(element.type, key, props);
        };
        exports.createElement = function (type, config, children) {
          var propName,
            props = {},
            key = null;
          if (null != config)
            for (propName in (void 0 !== config.key && (key = '' + config.key),
            config))
              hasOwnProperty.call(config, propName) &&
                'key' !== propName &&
                '__self' !== propName &&
                '__source' !== propName &&
                (props[propName] = config[propName]);
          var childrenLength = arguments.length - 2;
          if (1 === childrenLength) props.children = children;
          else if (1 < childrenLength) {
            for (
              var childArray = Array(childrenLength), i = 0;
              i < childrenLength;
              i++
            )
              childArray[i] = arguments[i + 2];
            props.children = childArray;
          }
          if (type && type.defaultProps)
            for (propName in ((childrenLength = type.defaultProps),
            childrenLength))
              void 0 === props[propName] &&
                (props[propName] = childrenLength[propName]);
          return ReactElement(type, key, props);
        };
        exports.createRef = function () {
          return { current: null };
        };
        exports.forwardRef = function (render) {
          return { $$typeof: REACT_FORWARD_REF_TYPE, render: render };
        };
        exports.isValidElement = isValidElement;
        exports.lazy = function (ctor) {
          return {
            $$typeof: REACT_LAZY_TYPE,
            _payload: { _status: -1, _result: ctor },
            _init: lazyInitializer,
          };
        };
        exports.memo = function (type, compare) {
          return {
            $$typeof: REACT_MEMO_TYPE,
            type: type,
            compare: void 0 === compare ? null : compare,
          };
        };
        exports.use = function (usable) {
          return ReactSharedInternals.H.use(usable);
        };
        exports.useCallback = function (callback, deps) {
          return ReactSharedInternals.H.useCallback(callback, deps);
        };
        exports.useDebugValue = function () {};
        exports.useId = function () {
          return ReactSharedInternals.H.useId();
        };
        exports.useMemo = function (create, deps) {
          return ReactSharedInternals.H.useMemo(create, deps);
        };
        exports.version = '19.2.0';

        /***/
      },

    /***/ '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        if (true) {
          module.exports = __webpack_require__(
            '../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react.react-server.production.js',
          );
        } else {
        }

        /***/
      },

    /***/ './node_modules/.federation/entry.ba72a59b5942274d001a6b4522111f1c.js':
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _Users_bytedance_dev_core_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            '../../../packages/webpack-bundler-runtime/dist/index.esm.js',
          );
        /* harmony import */ var _Users_bytedance_dev_core_packages_node_dist_src_runtimePlugin_js__WEBPACK_IMPORTED_MODULE_1__ =
          __webpack_require__(
            '../../../packages/node/dist/src/runtimePlugin.js',
          );
        /* harmony import */ var _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2__ =
          __webpack_require__('../../../packages/rsc/dist/rscRuntimePlugin.js');
        /* harmony import */ var _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2___default =
          /*#__PURE__*/ __webpack_require__.n(
            _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2__,
          );
        /* harmony import */ var _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3__ =
          __webpack_require__(
            '../../../packages/rsc/dist/rscSSRRuntimePlugin.js',
          );
        /* harmony import */ var _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3___default =
          /*#__PURE__*/ __webpack_require__.n(
            _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3__,
          );

        if (!__webpack_require__.federation.runtime) {
          var prevFederation = __webpack_require__.federation;
          __webpack_require__.federation = {};
          for (var key in _Users_bytedance_dev_core_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__[
            'default'
          ]) {
            __webpack_require__.federation[key] =
              _Users_bytedance_dev_core_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__[
                'default'
              ][key];
          }
          for (var key in prevFederation) {
            __webpack_require__.federation[key] = prevFederation[key];
          }
        }
        if (!__webpack_require__.federation.instance) {
          var pluginsToAdd = [
            _Users_bytedance_dev_core_packages_node_dist_src_runtimePlugin_js__WEBPACK_IMPORTED_MODULE_1__[
              'default'
            ]
              ? (
                  _Users_bytedance_dev_core_packages_node_dist_src_runtimePlugin_js__WEBPACK_IMPORTED_MODULE_1__[
                    'default'
                  ]['default'] ||
                  _Users_bytedance_dev_core_packages_node_dist_src_runtimePlugin_js__WEBPACK_IMPORTED_MODULE_1__[
                    'default'
                  ]
                )(undefined)
              : false,
            _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2___default()
              ? (
                  _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2___default()[
                    'default'
                  ] ||
                  _Users_bytedance_dev_core_packages_rsc_dist_rscRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_2___default()
                )(undefined)
              : false,
            _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3___default()
              ? (
                  _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3___default()[
                    'default'
                  ] ||
                  _Users_bytedance_dev_core_packages_rsc_dist_rscSSRRuntimePlugin_js__WEBPACK_IMPORTED_MODULE_3___default()
                )(undefined)
              : false,
          ].filter(Boolean);
          __webpack_require__.federation.initOptions.plugins =
            __webpack_require__.federation.initOptions.plugins
              ? __webpack_require__.federation.initOptions.plugins.concat(
                  pluginsToAdd,
                )
              : pluginsToAdd;
          __webpack_require__.federation.instance =
            __webpack_require__.federation.bundlerRuntime.init({
              webpackRequire: __webpack_require__,
            });
          if (__webpack_require__.federation.attachShareScopeMap) {
            __webpack_require__.federation.attachShareScopeMap(
              __webpack_require__,
            );
          }
          if (__webpack_require__.federation.installInitialConsumes) {
            __webpack_require__.federation.installInitialConsumes();
          }

          if (
            !__webpack_require__.federation.isMFRemote &&
            __webpack_require__.federation.prefetch
          ) {
            __webpack_require__.federation.prefetch();
          }
        }

        /***/
      },

    /***/ 'webpack/container/entry/app2': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var moduleMap = {
        './RemoteServerWidget': () => {
          return __webpack_require__
            .e(
              /* __federation_expose_RemoteServerWidget */ '__federation_expose_RemoteServerWidget',
            )
            .then(
              () => () =>
                __webpack_require__('./src/RemoteServerWidget.server.js'),
            );
        },
        './server-actions': () => {
          return __webpack_require__
            .e(
              /* __federation_expose_server_actions */ '__federation_expose_server_actions',
            )
            .then(() => () => __webpack_require__('./src/server-actions.js'));
        },
      };
      var get = (module, getScope) => {
        __webpack_require__.R = getScope;
        getScope = __webpack_require__.o(moduleMap, module)
          ? moduleMap[module]()
          : Promise.resolve().then(() => {
              throw new Error(
                'Module "' + module + '" does not exist in container.',
              );
            });
        __webpack_require__.R = undefined;
        return getScope;
      };
      var init = (shareScope, initScope, remoteEntryInitOptions) => {
        return __webpack_require__.federation.bundlerRuntime.initContainerEntry(
          {
            webpackRequire: __webpack_require__,
            shareScope: shareScope,
            initScope: initScope,
            remoteEntryInitOptions: remoteEntryInitOptions,
            shareScopeKey: ['rsc', 'client'],
          },
        );
      };

      // This exports getters to disallow modifications
      __webpack_require__.d(exports, {
        get: () => get,
        init: () => init,
      });

      /***/
    },

    /***/ async_hooks: /***/ (module) => {
      module.exports = require('async_hooks');

      /***/
    },

    /***/ crypto: /***/ (module) => {
      module.exports = require('crypto');

      /***/
    },

    /***/ stream: /***/ (module) => {
      module.exports = require('stream');

      /***/
    },

    /***/ util: /***/ (module) => {
      module.exports = require('util');

      /***/
    },

    /***/ '../../../packages/node/dist/src/runtimePlugin.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var __webpack_unused_export__;

      __webpack_unused_export__ = {
        value: true,
      };
      exports.setupWebpackRequirePatching =
        exports.setupChunkHandler =
        exports.setupScriptLoader =
        exports.deleteChunk =
        exports.installChunk =
        exports.loadChunk =
        exports.resolveUrl =
        exports.fetchAndRun =
        exports.loadFromFs =
        exports.returnFromGlobalInstances =
        exports.returnFromCache =
        exports.resolveFile =
        exports.nodeRuntimeImportCache =
          void 0;
      __webpack_unused_export__ = importNodeModule;
      exports['default'] = default_1;
      exports.nodeRuntimeImportCache = new Map();
      function importNodeModule(name) {
        if (!name) {
          throw new Error('import specifier is required');
        }
        // Check cache to prevent infinite recursion
        if (exports.nodeRuntimeImportCache.has(name)) {
          return exports.nodeRuntimeImportCache.get(name);
        }
        const importModule = new Function('name', `return import(name)`);
        const promise = importModule(name)
          .then((res) => res.default)
          .catch((error) => {
            console.error(`Error importing module ${name}:`, error);
            // Remove from cache on error so it can be retried
            exports.nodeRuntimeImportCache.delete(name);
            throw error;
          });
        // Cache the promise to prevent recursive calls
        exports.nodeRuntimeImportCache.set(name, promise);
        return promise;
      }
      // Hoisted utility function to resolve file paths for chunks
      const resolveFile = (rootOutputDir, chunkId) => {
        const path = require('path');
        return path.join(
          __dirname,
          rootOutputDir + __webpack_require__.u(chunkId),
        );
      };
      exports.resolveFile = resolveFile;
      // Hoisted utility function to get remote entry from cache
      const returnFromCache = (remoteName) => {
        const globalThisVal = new Function('return globalThis')();
        const federationInstances =
          globalThisVal['__FEDERATION__']['__INSTANCES__'];
        for (const instance of federationInstances) {
          const moduleContainer = instance.moduleCache.get(remoteName);
          if (moduleContainer?.remoteInfo)
            return moduleContainer.remoteInfo.entry;
        }
        return null;
      };
      exports.returnFromCache = returnFromCache;
      // Hoisted utility function to get remote entry from global instances
      const returnFromGlobalInstances = (remoteName) => {
        const globalThisVal = new Function('return globalThis')();
        const federationInstances =
          globalThisVal['__FEDERATION__']['__INSTANCES__'];
        for (const instance of federationInstances) {
          for (const remote of instance.options.remotes) {
            if (remote.name === remoteName || remote.alias === remoteName) {
              console.log('Backup remote entry found:', remote.entry);
              return remote.entry;
            }
          }
        }
        return null;
      };
      exports.returnFromGlobalInstances = returnFromGlobalInstances;
      // Hoisted utility function to load chunks from filesystem
      const loadFromFs = (filename, callback) => {
        const fs = require('fs');
        const path = require('path');
        const vm = require('vm');
        if (fs.existsSync(filename)) {
          fs.readFile(filename, 'utf-8', (err, content) => {
            if (err) return callback(err, null);
            const chunk = {};
            try {
              const script = new vm.Script(
                `(function(exports, require, __dirname, __filename) {${content}\n})`,
                {
                  filename,
                  importModuleDynamically:
                    //@ts-ignore
                    vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
                    importNodeModule,
                },
              );
              script.runInThisContext()(
                chunk,
                require,
                path.dirname(filename),
                filename,
              );
              callback(null, chunk);
            } catch (e) {
              console.log("'runInThisContext threw'", e);
              callback(e, null);
            }
          });
        } else {
          callback(new Error(`File ${filename} does not exist`), null);
        }
      };
      exports.loadFromFs = loadFromFs;
      // Hoisted utility function to fetch and execute chunks from remote URLs
      const fetchAndRun = (url, chunkName, callback, args) => {
        (typeof fetch === 'undefined'
          ? importNodeModule('node-fetch').then((mod) => mod.default)
          : Promise.resolve(fetch)
        )
          .then((fetchFunction) => {
            return args.origin.loaderHook.lifecycle.fetch
              .emit(url.href, {})
              .then((res) => {
                if (!res || !(res instanceof Response)) {
                  return fetchFunction(url.href).then((response) =>
                    response.text(),
                  );
                }
                return res.text();
              });
          })
          .then((data) => {
            const chunk = {};
            try {
              eval(
                `(function(exports, require, __dirname, __filename) {${data}\n})`,
              )(
                chunk,
                require,
                url.pathname.split('/').slice(0, -1).join('/'),
                chunkName,
              );
              callback(null, chunk);
            } catch (e) {
              callback(e, null);
            }
          })
          .catch((err) => callback(err, null));
      };
      exports.fetchAndRun = fetchAndRun;
      // Hoisted utility function to resolve URLs for chunks
      const resolveUrl = (remoteName, chunkName) => {
        try {
          return new URL(chunkName, __webpack_require__.p);
        } catch {
          const entryUrl =
            (0, exports.returnFromCache)(remoteName) ||
            (0, exports.returnFromGlobalInstances)(remoteName);
          if (!entryUrl) return null;
          const url = new URL(entryUrl);
          const path = require('path');
          // Extract the directory path from the remote entry URL
          // e.g., from "http://url/static/js/remoteEntry.js" to "/static/js/"
          const urlPath = url.pathname;
          const lastSlashIndex = urlPath.lastIndexOf('/');
          const directoryPath =
            lastSlashIndex >= 0
              ? urlPath.substring(0, lastSlashIndex + 1)
              : '/';
          // Get rootDir from webpack configuration
          const rootDir = __webpack_require__.federation.rootOutputDir || '';
          // Use path.join to combine the paths properly while handling slashes
          // Convert Windows-style paths to URL-style paths
          const combinedPath = path
            .join(directoryPath, rootDir, chunkName)
            .replace(/\\/g, '/');
          // Create the final URL
          return new URL(combinedPath, url.origin);
        }
      };
      exports.resolveUrl = resolveUrl;
      // Hoisted utility function to load chunks based on different strategies
      const loadChunk = (strategy, chunkId, rootOutputDir, callback, args) => {
        if (strategy === 'filesystem') {
          return (0, exports.loadFromFs)(
            (0, exports.resolveFile)(rootOutputDir, chunkId),
            callback,
          );
        }
        const url = (0, exports.resolveUrl)(rootOutputDir, chunkId);
        if (!url)
          return callback(null, {
            modules: {},
            ids: [],
            runtime: null,
          });
        // Using fetchAndRun directly with args
        (0, exports.fetchAndRun)(url, chunkId, callback, args);
      };
      exports.loadChunk = loadChunk;
      // Hoisted utility function to install a chunk into webpack
      const installChunk = (chunk, installedChunks) => {
        for (const moduleId in chunk.modules) {
          __webpack_require__.m[moduleId] = chunk.modules[moduleId];
        }
        if (chunk.runtime) chunk.runtime(__webpack_require__);
        for (const chunkId of chunk.ids) {
          if (installedChunks[chunkId]) installedChunks[chunkId][0]();
          installedChunks[chunkId] = 0;
        }
      };
      exports.installChunk = installChunk;
      // Hoisted utility function to remove a chunk on fail
      const deleteChunk = (chunkId, installedChunks) => {
        delete installedChunks[chunkId];
        return true;
      };
      exports.deleteChunk = deleteChunk;
      // Hoisted function to set up webpack script loader
      const setupScriptLoader = () => {
        __webpack_require__.l = (url, done, key, chunkId) => {
          if (!key)
            throw new Error(
              `__webpack_require__.l name is required for ${url}`,
            );
          __webpack_require__.federation.runtime
            .loadScriptNode(url, {
              attrs: {
                globalName: key,
              },
            })
            .then((res) => {
              const enhancedRemote =
                __webpack_require__.federation.instance.initRawContainer(
                  key,
                  url,
                  res,
                );
              new Function('return globalThis')()[key] = enhancedRemote;
              done(enhancedRemote);
            })
            .catch(done);
        };
      };
      exports.setupScriptLoader = setupScriptLoader;
      // Hoisted function to set up chunk handler
      const setupChunkHandler = (installedChunks, args) => {
        return (chunkId, promises) => {
          let installedChunkData = installedChunks[chunkId];
          if (installedChunkData !== 0) {
            if (installedChunkData) {
              promises.push(installedChunkData[2]);
            } else {
              const matcher = __webpack_require__.federation.chunkMatcher
                ? __webpack_require__.federation.chunkMatcher(chunkId)
                : true;
              if (matcher) {
                const promise = new Promise((resolve, reject) => {
                  installedChunkData = installedChunks[chunkId] = [
                    resolve,
                    reject,
                  ];
                  const fs =
                    typeof process !== 'undefined' ? require('fs') : false;
                  const filename =
                    typeof process !== 'undefined'
                      ? (0, exports.resolveFile)(
                          __webpack_require__.federation.rootOutputDir || '',
                          chunkId,
                        )
                      : false;
                  if (fs && fs.existsSync(filename)) {
                    (0, exports.loadChunk)(
                      'filesystem',
                      chunkId,
                      __webpack_require__.federation.rootOutputDir || '',
                      (err, chunk) => {
                        if (err)
                          return (
                            (0, exports.deleteChunk)(
                              chunkId,
                              installedChunks,
                            ) && reject(err)
                          );
                        if (chunk)
                          (0, exports.installChunk)(chunk, installedChunks);
                        resolve(chunk);
                      },
                      args,
                    );
                  } else {
                    const chunkName = __webpack_require__.u(chunkId);
                    const loadingStrategy =
                      typeof process === 'undefined' ? 'http-eval' : 'http-vm';
                    (0, exports.loadChunk)(
                      loadingStrategy,
                      chunkName,
                      __webpack_require__.federation.initOptions.name,
                      (err, chunk) => {
                        if (err)
                          return (
                            (0, exports.deleteChunk)(
                              chunkId,
                              installedChunks,
                            ) && reject(err)
                          );
                        if (chunk)
                          (0, exports.installChunk)(chunk, installedChunks);
                        resolve(chunk);
                      },
                      args,
                    );
                  }
                });
                promises.push((installedChunkData[2] = promise));
              } else {
                installedChunks[chunkId] = 0;
              }
            }
          }
        };
      };
      exports.setupChunkHandler = setupChunkHandler;
      // Hoisted function to set up webpack require patching
      const setupWebpackRequirePatching = (handle) => {
        if (__webpack_require__.f) {
          if (__webpack_require__.f.require) {
            console.warn(
              '\x1b[33m%s\x1b[0m',
              'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
            );
            __webpack_require__.f.require = handle;
          }
          if (__webpack_require__.f.readFileVm) {
            __webpack_require__.f.readFileVm = handle;
          }
        }
      };
      exports.setupWebpackRequirePatching = setupWebpackRequirePatching;
      function default_1() {
        return {
          name: 'node-federation-plugin',
          beforeInit(args) {
            // Patch webpack chunk loading handlers
            (() => {
              // Create the chunk tracking object
              const installedChunks = {};
              // Set up webpack script loader
              (0, exports.setupScriptLoader)();
              // Create and set up the chunk handler
              const handle = (0, exports.setupChunkHandler)(
                installedChunks,
                args,
              );
              // Patch webpack require
              (0, exports.setupWebpackRequirePatching)(handle);
            })();
            return args;
          },
        };
      }

      /***/
    },

    /***/ '../../../packages/runtime-core/dist/index.cjs.cjs': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var sdk = __webpack_require__('../../../packages/sdk/dist/index.cjs.cjs');
      var errorCodes = __webpack_require__(
        '../../../packages/error-codes/dist/index.cjs.js',
      );

      const LOG_CATEGORY = '[ Federation Runtime ]';
      // FIXME: pre-bundle ?
      const logger = sdk.createLogger(LOG_CATEGORY);
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      function assert(condition, msg) {
        if (!condition) {
          error(msg);
        }
      }
      function error(msg) {
        if (msg instanceof Error) {
          // Check if the message already starts with the log category to avoid duplication
          if (!msg.message.startsWith(LOG_CATEGORY)) {
            msg.message = `${LOG_CATEGORY}: ${msg.message}`;
          }
          throw msg;
        }
        throw new Error(`${LOG_CATEGORY}: ${msg}`);
      }
      function warn(msg) {
        if (msg instanceof Error) {
          // Check if the message already starts with the log category to avoid duplication
          if (!msg.message.startsWith(LOG_CATEGORY)) {
            msg.message = `${LOG_CATEGORY}: ${msg.message}`;
          }
          logger.warn(msg);
        } else {
          logger.warn(msg);
        }
      }

      function addUniqueItem(arr, item) {
        if (arr.findIndex((name) => name === item) === -1) {
          arr.push(item);
        }
        return arr;
      }
      function getFMId(remoteInfo) {
        if ('version' in remoteInfo && remoteInfo.version) {
          return `${remoteInfo.name}:${remoteInfo.version}`;
        } else if ('entry' in remoteInfo && remoteInfo.entry) {
          return `${remoteInfo.name}:${remoteInfo.entry}`;
        } else {
          return `${remoteInfo.name}`;
        }
      }
      function isRemoteInfoWithEntry(remote) {
        return typeof remote.entry !== 'undefined';
      }
      function isPureRemoteEntry(remote) {
        return !remote.entry.includes('.json');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async function safeWrapper(callback, disableWarn) {
        try {
          const res = await callback();
          return res;
        } catch (e) {
          !disableWarn && warn(e);
          return;
        }
      }
      function isObject(val) {
        return val && typeof val === 'object';
      }
      const objectToString = Object.prototype.toString;
      // eslint-disable-next-line @typescript-eslint/ban-types
      function isPlainObject(val) {
        return objectToString.call(val) === '[object Object]';
      }
      function isStaticResourcesEqual(url1, url2) {
        const REG_EXP = /^(https?:)?\/\//i;
        // Transform url1 and url2 into relative paths
        const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
        const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
        // Check if the relative paths are identical
        return relativeUrl1 === relativeUrl2;
      }
      function arrayOptions(options) {
        return Array.isArray(options) ? options : [options];
      }
      function getRemoteEntryInfoFromSnapshot(snapshot) {
        const defaultRemoteEntryInfo = {
          url: '',
          type: 'global',
          globalName: '',
        };
        if (
          sdk.isBrowserEnv() ||
          sdk.isReactNativeEnv() ||
          !('ssrRemoteEntry' in snapshot)
        ) {
          return 'remoteEntry' in snapshot
            ? {
                url: snapshot.remoteEntry,
                type: snapshot.remoteEntryType,
                globalName: snapshot.globalName,
              }
            : defaultRemoteEntryInfo;
        }
        if ('ssrRemoteEntry' in snapshot && snapshot.ssrRemoteEntry) {
          return {
            url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
            type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
            globalName: snapshot.globalName,
          };
        }
        return 'remoteEntry' in snapshot
          ? {
              url: snapshot.remoteEntry,
              type: snapshot.remoteEntryType,
              globalName: snapshot.globalName,
            }
          : defaultRemoteEntryInfo;
      }
      const processModuleAlias = (name, subPath) => {
        // @host/ ./button -> @host/button
        let moduleName;
        if (name.endsWith('/')) {
          moduleName = name.slice(0, -1);
        } else {
          moduleName = name;
        }
        if (subPath.startsWith('.')) {
          subPath = subPath.slice(1);
        }
        moduleName = moduleName + subPath;
        return moduleName;
      };

      const CurrentGlobal =
        typeof globalThis === 'object' ? globalThis : window;
      const nativeGlobal = (() => {
        try {
          // get real window (incase of sandbox)
          return document.defaultView;
        } catch {
          // node env
          return CurrentGlobal;
        }
      })();
      const Global = nativeGlobal;
      function definePropertyGlobalVal(target, key, val) {
        Object.defineProperty(target, key, {
          value: val,
          configurable: false,
          writable: true,
        });
      }
      function includeOwnProperty(target, key) {
        return Object.hasOwnProperty.call(target, key);
      }
      // This section is to prevent encapsulation by certain microfrontend frameworks. Due to reuse policies, sandbox escapes.
      // The sandbox in the microfrontend does not replicate the value of 'configurable'.
      // If there is no loading content on the global object, this section defines the loading object.
      if (
        !includeOwnProperty(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__')
      ) {
        definePropertyGlobalVal(
          CurrentGlobal,
          '__GLOBAL_LOADING_REMOTE_ENTRY__',
          {},
        );
      }
      const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
      function setGlobalDefaultVal(target) {
        if (
          includeOwnProperty(target, '__VMOK__') &&
          !includeOwnProperty(target, '__FEDERATION__')
        ) {
          definePropertyGlobalVal(target, '__FEDERATION__', target.__VMOK__);
        }
        if (!includeOwnProperty(target, '__FEDERATION__')) {
          definePropertyGlobalVal(target, '__FEDERATION__', {
            __GLOBAL_PLUGIN__: [],
            __INSTANCES__: [],
            moduleInfo: {},
            __SHARE__: {},
            __MANIFEST_LOADING__: {},
            __PRELOADED_MAP__: new Map(),
          });
          definePropertyGlobalVal(target, '__VMOK__', target.__FEDERATION__);
        }
        target.__FEDERATION__.__GLOBAL_PLUGIN__ ??= [];
        target.__FEDERATION__.__INSTANCES__ ??= [];
        target.__FEDERATION__.moduleInfo ??= {};
        target.__FEDERATION__.__SHARE__ ??= {};
        target.__FEDERATION__.__MANIFEST_LOADING__ ??= {};
        target.__FEDERATION__.__PRELOADED_MAP__ ??= new Map();
      }
      setGlobalDefaultVal(CurrentGlobal);
      setGlobalDefaultVal(nativeGlobal);
      function resetFederationGlobalInfo() {
        CurrentGlobal.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
        CurrentGlobal.__FEDERATION__.__INSTANCES__ = [];
        CurrentGlobal.__FEDERATION__.moduleInfo = {};
        CurrentGlobal.__FEDERATION__.__SHARE__ = {};
        CurrentGlobal.__FEDERATION__.__MANIFEST_LOADING__ = {};
        Object.keys(globalLoading).forEach((key) => {
          delete globalLoading[key];
        });
      }
      function setGlobalFederationInstance(FederationInstance) {
        CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
      }
      function getGlobalFederationConstructor() {
        return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
      }
      function setGlobalFederationConstructor(
        FederationConstructor,
        isDebug = sdk.isDebugMode(),
      ) {
        if (isDebug) {
          CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ =
            FederationConstructor;
          CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = '0.24.1';
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-types
      function getInfoWithoutType(target, key) {
        if (typeof key === 'string') {
          const keyRes = target[key];
          if (keyRes) {
            return {
              value: target[key],
              key: key,
            };
          } else {
            const targetKeys = Object.keys(target);
            for (const targetKey of targetKeys) {
              const [targetTypeOrName, _] = targetKey.split(':');
              const nKey = `${targetTypeOrName}:${key}`;
              const typeWithKeyRes = target[nKey];
              if (typeWithKeyRes) {
                return {
                  value: typeWithKeyRes,
                  key: nKey,
                };
              }
            }
            return {
              value: undefined,
              key: key,
            };
          }
        } else {
          throw new Error('key must be string');
        }
      }
      const getGlobalSnapshot = () => nativeGlobal.__FEDERATION__.moduleInfo;
      const getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot) => {
        // Check if the remote is included in the hostSnapshot
        const moduleKey = getFMId(moduleInfo);
        const getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;
        // The remoteSnapshot might not include a version
        if (
          getModuleInfo &&
          !getModuleInfo.version &&
          'version' in moduleInfo &&
          moduleInfo['version']
        ) {
          getModuleInfo.version = moduleInfo['version'];
        }
        if (getModuleInfo) {
          return getModuleInfo;
        }
        // If the remote is not included in the hostSnapshot, deploy a micro app snapshot
        if ('version' in moduleInfo && moduleInfo['version']) {
          const { version, ...resModuleInfo } = moduleInfo;
          const moduleKeyWithoutVersion = getFMId(resModuleInfo);
          const getModuleInfoWithoutVersion = getInfoWithoutType(
            nativeGlobal.__FEDERATION__.moduleInfo,
            moduleKeyWithoutVersion,
          ).value;
          if (getModuleInfoWithoutVersion?.version === version) {
            return getModuleInfoWithoutVersion;
          }
        }
        return;
      };
      const getGlobalSnapshotInfoByModuleInfo = (moduleInfo) =>
        getTargetSnapshotInfoByModuleInfo(
          moduleInfo,
          nativeGlobal.__FEDERATION__.moduleInfo,
        );
      const setGlobalSnapshotInfoByModuleInfo = (
        remoteInfo,
        moduleDetailInfo,
      ) => {
        const moduleKey = getFMId(remoteInfo);
        nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
        return nativeGlobal.__FEDERATION__.moduleInfo;
      };
      const addGlobalSnapshot = (moduleInfos) => {
        nativeGlobal.__FEDERATION__.moduleInfo = {
          ...nativeGlobal.__FEDERATION__.moduleInfo,
          ...moduleInfos,
        };
        return () => {
          const keys = Object.keys(moduleInfos);
          for (const key of keys) {
            delete nativeGlobal.__FEDERATION__.moduleInfo[key];
          }
        };
      };
      const getRemoteEntryExports = (name, globalName) => {
        const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
        const entryExports = CurrentGlobal[remoteEntryKey];
        return {
          remoteEntryKey,
          entryExports,
        };
      };
      // This function is used to register global plugins.
      // It iterates over the provided plugins and checks if they are already registered.
      // If a plugin is not registered, it is added to the global plugins.
      // If a plugin is already registered, a warning message is logged.
      const registerGlobalPlugins = (plugins) => {
        const { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;
        plugins.forEach((plugin) => {
          if (
            __GLOBAL_PLUGIN__.findIndex((p) => p.name === plugin.name) === -1
          ) {
            __GLOBAL_PLUGIN__.push(plugin);
          } else {
            warn(`The plugin ${plugin.name} has been registered.`);
          }
        });
      };
      const getGlobalHostPlugins = () =>
        nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
      const getPreloaded = (id) =>
        CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
      const setPreloaded = (id) =>
        CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);

      const DEFAULT_SCOPE = 'default';
      const DEFAULT_REMOTE_TYPE = 'global';

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      const buildIdentifier = '[0-9A-Za-z-]+';
      const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
      const numericIdentifier = '0|[1-9]\\d*';
      const numericIdentifierLoose = '[0-9]+';
      const nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
      const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
      const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
      const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
      const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
      const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
      const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
      const hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`;
      const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`;
      const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`;
      const gtlt = '((?:<|>)?=?)';
      const comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`;
      const loneTilde = '(?:~>?)';
      const tildeTrim = `(\\s*)${loneTilde}\\s+`;
      const loneCaret = '(?:\\^)';
      const caretTrim = `(\\s*)${loneCaret}\\s+`;
      const star = '(<|>)?=?\\s*\\*';
      const caret = `^${loneCaret}${xRangePlain}$`;
      const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`;
      const fullPlain = `v?${mainVersion}${preRelease}?${build}?`;
      const tilde = `^${loneTilde}${xRangePlain}$`;
      const xRange = `^${gtlt}\\s*${xRangePlain}$`;
      const comparator = `^${gtlt}\\s*(${fullPlain})$|^$`;
      // copy from semver package
      const gte0 = '^\\s*>=\\s*0.0.0\\s*$';

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseRegex(source) {
        return new RegExp(source);
      }
      function isXVersion(version) {
        return !version || version.toLowerCase() === 'x' || version === '*';
      }
      function pipe(...fns) {
        return (x) => fns.reduce((v, f) => f(v), x);
      }
      function extractComparator(comparatorString) {
        return comparatorString.match(parseRegex(comparator));
      }
      function combineVersion(major, minor, patch, preRelease) {
        const mainVersion = `${major}.${minor}.${patch}`;
        if (preRelease) {
          return `${mainVersion}-${preRelease}`;
        }
        return mainVersion;
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseHyphen(range) {
        return range.replace(
          parseRegex(hyphenRange),
          (
            _range,
            from,
            fromMajor,
            fromMinor,
            fromPatch,
            _fromPreRelease,
            _fromBuild,
            to,
            toMajor,
            toMinor,
            toPatch,
            toPreRelease,
          ) => {
            if (isXVersion(fromMajor)) {
              from = '';
            } else if (isXVersion(fromMinor)) {
              from = `>=${fromMajor}.0.0`;
            } else if (isXVersion(fromPatch)) {
              from = `>=${fromMajor}.${fromMinor}.0`;
            } else {
              from = `>=${from}`;
            }
            if (isXVersion(toMajor)) {
              to = '';
            } else if (isXVersion(toMinor)) {
              to = `<${Number(toMajor) + 1}.0.0-0`;
            } else if (isXVersion(toPatch)) {
              to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
            } else if (toPreRelease) {
              to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
            } else {
              to = `<=${to}`;
            }
            return `${from} ${to}`.trim();
          },
        );
      }
      function parseComparatorTrim(range) {
        return range.replace(parseRegex(comparatorTrim), '$1$2$3');
      }
      function parseTildeTrim(range) {
        return range.replace(parseRegex(tildeTrim), '$1~');
      }
      function parseCaretTrim(range) {
        return range.replace(parseRegex(caretTrim), '$1^');
      }
      function parseCarets(range) {
        return range
          .trim()
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion.replace(
              parseRegex(caret),
              (_, major, minor, patch, preRelease) => {
                if (isXVersion(major)) {
                  return '';
                } else if (isXVersion(minor)) {
                  return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                } else if (isXVersion(patch)) {
                  if (major === '0') {
                    return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                  } else {
                    return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
                  }
                } else if (preRelease) {
                  if (major === '0') {
                    if (minor === '0') {
                      return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                      return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    }
                  } else {
                    return `>=${major}.${minor}.${patch}-${preRelease} <${Number(major) + 1}.0.0-0`;
                  }
                } else {
                  if (major === '0') {
                    if (minor === '0') {
                      return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                      return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
                    }
                  }
                  return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
                }
              },
            ),
          )
          .join(' ');
      }
      function parseTildes(range) {
        return range
          .trim()
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion.replace(
              parseRegex(tilde),
              (_, major, minor, patch, preRelease) => {
                if (isXVersion(major)) {
                  return '';
                } else if (isXVersion(minor)) {
                  return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                } else if (isXVersion(patch)) {
                  return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                } else if (preRelease) {
                  return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                }
                return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
              },
            ),
          )
          .join(' ');
      }
      function parseXRanges(range) {
        return range
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion
              .trim()
              .replace(
                parseRegex(xRange),
                (ret, gtlt, major, minor, patch, preRelease) => {
                  const isXMajor = isXVersion(major);
                  const isXMinor = isXMajor || isXVersion(minor);
                  const isXPatch = isXMinor || isXVersion(patch);
                  if (gtlt === '=' && isXPatch) {
                    gtlt = '';
                  }
                  preRelease = '';
                  if (isXMajor) {
                    if (gtlt === '>' || gtlt === '<') {
                      // nothing is allowed
                      return '<0.0.0-0';
                    } else {
                      // nothing is forbidden
                      return '*';
                    }
                  } else if (gtlt && isXPatch) {
                    // replace X with 0
                    if (isXMinor) {
                      minor = 0;
                    }
                    patch = 0;
                    if (gtlt === '>') {
                      // >1 => >=2.0.0
                      // >1.2 => >=1.3.0
                      gtlt = '>=';
                      if (isXMinor) {
                        major = Number(major) + 1;
                        minor = 0;
                        patch = 0;
                      } else {
                        minor = Number(minor) + 1;
                        patch = 0;
                      }
                    } else if (gtlt === '<=') {
                      // <=0.7.x is actually <0.8.0, since any 0.7.x should pass
                      // Similarly, <=7.x is actually <8.0.0, etc.
                      gtlt = '<';
                      if (isXMinor) {
                        major = Number(major) + 1;
                      } else {
                        minor = Number(minor) + 1;
                      }
                    }
                    if (gtlt === '<') {
                      preRelease = '-0';
                    }
                    return `${gtlt + major}.${minor}.${patch}${preRelease}`;
                  } else if (isXMinor) {
                    return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
                  } else if (isXPatch) {
                    return `>=${major}.${minor}.0${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                  }
                  return ret;
                },
              ),
          )
          .join(' ');
      }
      function parseStar(range) {
        return range.trim().replace(parseRegex(star), '');
      }
      function parseGTE0(comparatorString) {
        return comparatorString.trim().replace(parseRegex(gte0), '');
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function compareAtom(rangeAtom, versionAtom) {
        rangeAtom = Number(rangeAtom) || rangeAtom;
        versionAtom = Number(versionAtom) || versionAtom;
        if (rangeAtom > versionAtom) {
          return 1;
        }
        if (rangeAtom === versionAtom) {
          return 0;
        }
        return -1;
      }
      function comparePreRelease(rangeAtom, versionAtom) {
        const { preRelease: rangePreRelease } = rangeAtom;
        const { preRelease: versionPreRelease } = versionAtom;
        if (rangePreRelease === undefined && Boolean(versionPreRelease)) {
          return 1;
        }
        if (Boolean(rangePreRelease) && versionPreRelease === undefined) {
          return -1;
        }
        if (rangePreRelease === undefined && versionPreRelease === undefined) {
          return 0;
        }
        for (let i = 0, n = rangePreRelease.length; i <= n; i++) {
          const rangeElement = rangePreRelease[i];
          const versionElement = versionPreRelease[i];
          if (rangeElement === versionElement) {
            continue;
          }
          if (rangeElement === undefined && versionElement === undefined) {
            return 0;
          }
          if (!rangeElement) {
            return 1;
          }
          if (!versionElement) {
            return -1;
          }
          return compareAtom(rangeElement, versionElement);
        }
        return 0;
      }
      function compareVersion(rangeAtom, versionAtom) {
        return (
          compareAtom(rangeAtom.major, versionAtom.major) ||
          compareAtom(rangeAtom.minor, versionAtom.minor) ||
          compareAtom(rangeAtom.patch, versionAtom.patch) ||
          comparePreRelease(rangeAtom, versionAtom)
        );
      }
      function eq(rangeAtom, versionAtom) {
        return rangeAtom.version === versionAtom.version;
      }
      function compare(rangeAtom, versionAtom) {
        switch (rangeAtom.operator) {
          case '':
          case '=':
            return eq(rangeAtom, versionAtom);
          case '>':
            return compareVersion(rangeAtom, versionAtom) < 0;
          case '>=':
            return (
              eq(rangeAtom, versionAtom) ||
              compareVersion(rangeAtom, versionAtom) < 0
            );
          case '<':
            return compareVersion(rangeAtom, versionAtom) > 0;
          case '<=':
            return (
              eq(rangeAtom, versionAtom) ||
              compareVersion(rangeAtom, versionAtom) > 0
            );
          case undefined: {
            // mean * or x -> all versions
            return true;
          }
          default:
            return false;
        }
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseComparatorString(range) {
        return pipe(
          // handle caret
          // ^ --> * (any, kinda silly)
          // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
          // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
          // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
          // ^1.2.3 --> >=1.2.3 <2.0.0-0
          // ^1.2.0 --> >=1.2.0 <2.0.0-0
          parseCarets,
          // handle tilde
          // ~, ~> --> * (any, kinda silly)
          // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
          // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
          // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
          // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
          // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
          parseTildes,
          parseXRanges,
          parseStar,
        )(range);
      }
      function parseRange(range) {
        return pipe(
          // handle hyphenRange
          // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
          parseHyphen,
          // handle trim comparator
          // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
          parseComparatorTrim,
          // handle trim tilde
          // `~ 1.2.3` => `~1.2.3`
          parseTildeTrim,
          // handle trim caret
          // `^ 1.2.3` => `^1.2.3`
          parseCaretTrim,
        )(range.trim())
          .split(/\s+/)
          .join(' ');
      }
      function satisfy(version, range) {
        if (!version) {
          return false;
        }
        // Extract version details once
        const extractedVersion = extractComparator(version);
        if (!extractedVersion) {
          // If the version string is invalid, it can't satisfy any range
          return false;
        }
        const [
          ,
          versionOperator,
          ,
          versionMajor,
          versionMinor,
          versionPatch,
          versionPreRelease,
        ] = extractedVersion;
        const versionAtom = {
          operator: versionOperator,
          version: combineVersion(
            versionMajor,
            versionMinor,
            versionPatch,
            versionPreRelease,
          ), // exclude build atom
          major: versionMajor,
          minor: versionMinor,
          patch: versionPatch,
          preRelease: versionPreRelease?.split('.'),
        };
        // Split the range by || to handle OR conditions
        const orRanges = range.split('||');
        for (const orRange of orRanges) {
          const trimmedOrRange = orRange.trim();
          if (!trimmedOrRange) {
            // An empty range string signifies wildcard *, satisfy any valid version
            // (We already checked if the version itself is valid)
            return true;
          }
          // Handle simple wildcards explicitly before complex parsing
          if (trimmedOrRange === '*' || trimmedOrRange === 'x') {
            return true;
          }
          try {
            // Apply existing parsing logic to the current OR sub-range
            const parsedSubRange = parseRange(trimmedOrRange); // Handles hyphens, trims etc.
            // Check if the result of initial parsing is empty, which can happen
            // for some wildcard cases handled by parseRange/parseComparatorString.
            // E.g. `parseStar` used in `parseComparatorString` returns ''.
            if (!parsedSubRange.trim()) {
              // If parsing results in empty string, treat as wildcard match
              return true;
            }
            const parsedComparatorString = parsedSubRange
              .split(' ')
              .map((rangeVersion) => parseComparatorString(rangeVersion)) // Expands ^, ~
              .join(' ');
            // Check again if the comparator string became empty after specific parsing like ^ or ~
            if (!parsedComparatorString.trim()) {
              return true;
            }
            // Split the sub-range by space for implicit AND conditions
            const comparators = parsedComparatorString
              .split(/\s+/)
              .map((comparator) => parseGTE0(comparator))
              // Filter out empty strings that might result from multiple spaces
              .filter(Boolean);
            // If a sub-range becomes empty after parsing (e.g., invalid characters),
            // it cannot be satisfied. This check might be redundant now but kept for safety.
            if (comparators.length === 0) {
              continue;
            }
            let subRangeSatisfied = true;
            for (const comparator of comparators) {
              const extractedComparator = extractComparator(comparator);
              // If any part of the AND sub-range is invalid, the sub-range is not satisfied
              if (!extractedComparator) {
                subRangeSatisfied = false;
                break;
              }
              const [
                ,
                rangeOperator,
                ,
                rangeMajor,
                rangeMinor,
                rangePatch,
                rangePreRelease,
              ] = extractedComparator;
              const rangeAtom = {
                operator: rangeOperator,
                version: combineVersion(
                  rangeMajor,
                  rangeMinor,
                  rangePatch,
                  rangePreRelease,
                ),
                major: rangeMajor,
                minor: rangeMinor,
                patch: rangePatch,
                preRelease: rangePreRelease?.split('.'),
              };
              // Check if the version satisfies this specific comparator in the AND chain
              if (!compare(rangeAtom, versionAtom)) {
                subRangeSatisfied = false; // This part of the AND condition failed
                break; // No need to check further comparators in this sub-range
              }
            }
            // If all AND conditions within this OR sub-range were met, the overall range is satisfied
            if (subRangeSatisfied) {
              return true;
            }
          } catch (e) {
            // Log error and treat this sub-range as unsatisfied
            console.error(
              `[semver] Error processing range part "${trimmedOrRange}":`,
              e,
            );
            continue;
          }
        }
        // If none of the OR sub-ranges were satisfied
        return false;
      }

      function formatShare(shareArgs, from, name, shareStrategy) {
        let get;
        if ('get' in shareArgs) {
          // eslint-disable-next-line prefer-destructuring
          get = shareArgs.get;
        } else if ('lib' in shareArgs) {
          get = () => Promise.resolve(shareArgs.lib);
        } else {
          get = () =>
            Promise.resolve(() => {
              throw new Error(`Can not get shared '${name}'!`);
            });
        }
        if (shareArgs.shareConfig?.eager && shareArgs.treeShaking) {
          throw new Error(
            'Can not set "eager:true" and "treeShaking" at the same time!',
          );
        }
        return {
          deps: [],
          useIn: [],
          from,
          loading: null,
          ...shareArgs,
          shareConfig: {
            requiredVersion: `^${shareArgs.version}`,
            singleton: false,
            eager: false,
            strictVersion: false,
            ...shareArgs.shareConfig,
          },
          get,
          loaded: shareArgs?.loaded || 'lib' in shareArgs ? true : undefined,
          version: shareArgs.version ?? '0',
          scope: Array.isArray(shareArgs.scope)
            ? shareArgs.scope
            : [shareArgs.scope ?? 'default'],
          strategy: (shareArgs.strategy ?? shareStrategy) || 'version-first',
          treeShaking: shareArgs.treeShaking
            ? {
                ...shareArgs.treeShaking,
                mode: shareArgs.treeShaking.mode ?? 'server-calc',
                status:
                  shareArgs.treeShaking.status ??
                  1 /* TreeShakingStatus.UNKNOWN */,
                useIn: [],
              }
            : undefined,
        };
      }
      function formatShareConfigs(prevOptions, newOptions) {
        const shareArgs = newOptions.shared || {};
        const from = newOptions.name;
        const newShareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
          const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
          res[pkgName] = res[pkgName] || [];
          arrayShareArgs.forEach((shareConfig) => {
            res[pkgName].push(
              formatShare(shareConfig, from, pkgName, newOptions.shareStrategy),
            );
          });
          return res;
        }, {});
        const allShareInfos = {
          ...prevOptions.shared,
        };
        Object.keys(newShareInfos).forEach((shareKey) => {
          if (!allShareInfos[shareKey]) {
            allShareInfos[shareKey] = newShareInfos[shareKey];
          } else {
            newShareInfos[shareKey].forEach((newUserSharedOptions) => {
              const isSameVersion = allShareInfos[shareKey].find(
                (sharedVal) =>
                  sharedVal.version === newUserSharedOptions.version,
              );
              if (!isSameVersion) {
                allShareInfos[shareKey].push(newUserSharedOptions);
              }
            });
          }
        });
        return { allShareInfos, newShareInfos };
      }
      function shouldUseTreeShaking(treeShaking, usedExports) {
        if (!treeShaking) {
          return false;
        }
        const { status, mode } = treeShaking;
        if (status === 0 /* TreeShakingStatus.NO_USE */) {
          return false;
        }
        if (status === 2 /* TreeShakingStatus.CALCULATED */) {
          return true;
        }
        if (mode === 'runtime-infer') {
          if (!usedExports) {
            return true;
          }
          return isMatchUsedExports(treeShaking, usedExports);
        }
        return false;
      }
      /**
       * compare version a and b, return true if a is less than b
       */
      function versionLt(a, b) {
        const transformInvalidVersion = (version) => {
          const isNumberVersion = !Number.isNaN(Number(version));
          if (isNumberVersion) {
            const splitArr = version.split('.');
            let validVersion = version;
            for (let i = 0; i < 3 - splitArr.length; i++) {
              validVersion += '.0';
            }
            return validVersion;
          }
          return version;
        };
        if (
          satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)
        ) {
          return true;
        } else {
          return false;
        }
      }
      const findVersion = (shareVersionMap, cb) => {
        const callback =
          cb ||
          function (prev, cur) {
            return versionLt(prev, cur);
          };
        return Object.keys(shareVersionMap).reduce((prev, cur) => {
          if (!prev) {
            return cur;
          }
          if (callback(prev, cur)) {
            return cur;
          }
          // default version is '0' https://github.com/webpack/webpack/blob/main/lib/sharing/ProvideSharedModule.js#L136
          if (prev === '0') {
            return cur;
          }
          return prev;
        }, 0);
      };
      const isLoaded = (shared) => {
        return Boolean(shared.loaded) || typeof shared.lib === 'function';
      };
      const isLoading = (shared) => {
        return Boolean(shared.loading);
      };
      const isMatchUsedExports = (treeShaking, usedExports) => {
        if (!treeShaking || !usedExports) {
          return false;
        }
        const { usedExports: treeShakingUsedExports } = treeShaking;
        if (!treeShakingUsedExports) {
          return false;
        }
        if (usedExports.every((e) => treeShakingUsedExports.includes(e))) {
          return true;
        }
        return false;
      };
      function findSingletonVersionOrderByVersion(
        shareScopeMap,
        scope,
        pkgName,
        treeShaking,
      ) {
        const versions = shareScopeMap[scope][pkgName];
        let version = '';
        let useTreesShaking = shouldUseTreeShaking(treeShaking);
        // return false means use prev version
        const callback = function (prev, cur) {
          if (useTreesShaking) {
            if (!versions[prev].treeShaking) {
              return true;
            }
            if (!versions[cur].treeShaking) {
              return false;
            }
            return (
              !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur)
            );
          }
          return !isLoaded(versions[prev]) && versionLt(prev, cur);
        };
        if (useTreesShaking) {
          version = findVersion(shareScopeMap[scope][pkgName], callback);
          if (version) {
            return {
              version,
              useTreesShaking,
            };
          }
          useTreesShaking = false;
        }
        return {
          version: findVersion(shareScopeMap[scope][pkgName], callback),
          useTreesShaking,
        };
      }
      const isLoadingOrLoaded = (shared) => {
        return isLoaded(shared) || isLoading(shared);
      };
      function findSingletonVersionOrderByLoaded(
        shareScopeMap,
        scope,
        pkgName,
        treeShaking,
      ) {
        const versions = shareScopeMap[scope][pkgName];
        let version = '';
        let useTreesShaking = shouldUseTreeShaking(treeShaking);
        // return false means use prev version
        const callback = function (prev, cur) {
          if (useTreesShaking) {
            if (!versions[prev].treeShaking) {
              return true;
            }
            if (!versions[cur].treeShaking) {
              return false;
            }
            if (isLoadingOrLoaded(versions[cur].treeShaking)) {
              if (isLoadingOrLoaded(versions[prev].treeShaking)) {
                return Boolean(versionLt(prev, cur));
              } else {
                return true;
              }
            }
            if (isLoadingOrLoaded(versions[prev].treeShaking)) {
              return false;
            }
          }
          if (isLoadingOrLoaded(versions[cur])) {
            if (isLoadingOrLoaded(versions[prev])) {
              return Boolean(versionLt(prev, cur));
            } else {
              return true;
            }
          }
          if (isLoadingOrLoaded(versions[prev])) {
            return false;
          }
          return versionLt(prev, cur);
        };
        if (useTreesShaking) {
          version = findVersion(shareScopeMap[scope][pkgName], callback);
          if (version) {
            return {
              version,
              useTreesShaking,
            };
          }
          useTreesShaking = false;
        }
        return {
          version: findVersion(shareScopeMap[scope][pkgName], callback),
          useTreesShaking,
        };
      }
      function getFindShareFunction(strategy) {
        if (strategy === 'loaded-first') {
          return findSingletonVersionOrderByLoaded;
        }
        return findSingletonVersionOrderByVersion;
      }
      function getRegisteredShare(
        localShareScopeMap,
        pkgName,
        shareInfo,
        resolveShare,
      ) {
        if (!localShareScopeMap) {
          return;
        }
        const {
          shareConfig,
          scope = DEFAULT_SCOPE,
          strategy,
          treeShaking,
        } = shareInfo;
        const scopes = Array.isArray(scope) ? scope : [scope];
        for (const sc of scopes) {
          if (
            shareConfig &&
            localShareScopeMap[sc] &&
            localShareScopeMap[sc][pkgName]
          ) {
            const { requiredVersion } = shareConfig;
            const findShareFunction = getFindShareFunction(strategy);
            const { version: maxOrSingletonVersion, useTreesShaking } =
              findShareFunction(localShareScopeMap, sc, pkgName, treeShaking);
            const defaultResolver = () => {
              const shared =
                localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
              if (shareConfig.singleton) {
                if (
                  typeof requiredVersion === 'string' &&
                  !satisfy(maxOrSingletonVersion, requiredVersion)
                ) {
                  const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && shared.from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
                  if (shareConfig.strictVersion) {
                    error(msg);
                  } else {
                    warn(msg);
                  }
                }
                return {
                  shared,
                  useTreesShaking,
                };
              } else {
                if (requiredVersion === false || requiredVersion === '*') {
                  return {
                    shared,
                    useTreesShaking,
                  };
                }
                if (satisfy(maxOrSingletonVersion, requiredVersion)) {
                  return {
                    shared,
                    useTreesShaking,
                  };
                }
                const _usedTreeShaking = shouldUseTreeShaking(treeShaking);
                if (_usedTreeShaking) {
                  for (const [versionKey, versionValue] of Object.entries(
                    localShareScopeMap[sc][pkgName],
                  )) {
                    if (
                      !shouldUseTreeShaking(
                        versionValue.treeShaking,
                        treeShaking?.usedExports,
                      )
                    ) {
                      continue;
                    }
                    if (satisfy(versionKey, requiredVersion)) {
                      return {
                        shared: versionValue,
                        useTreesShaking: _usedTreeShaking,
                      };
                    }
                  }
                }
                for (const [versionKey, versionValue] of Object.entries(
                  localShareScopeMap[sc][pkgName],
                )) {
                  if (satisfy(versionKey, requiredVersion)) {
                    return {
                      shared: versionValue,
                      useTreesShaking: false,
                    };
                  }
                }
              }
              return;
            };
            const params = {
              shareScopeMap: localShareScopeMap,
              scope: sc,
              pkgName,
              version: maxOrSingletonVersion,
              GlobalFederation: Global.__FEDERATION__,
              shareInfo,
              resolver: defaultResolver,
            };
            const resolveShared = resolveShare.emit(params) || params;
            return resolveShared.resolver();
          }
        }
      }
      function getGlobalShareScope() {
        return Global.__FEDERATION__.__SHARE__;
      }
      function getTargetSharedOptions(options) {
        const { pkgName, extraOptions, shareInfos } = options;
        const defaultResolver = (sharedOptions) => {
          if (!sharedOptions) {
            return undefined;
          }
          const shareVersionMap = {};
          sharedOptions.forEach((shared) => {
            shareVersionMap[shared.version] = shared;
          });
          const callback = function (prev, cur) {
            return (
              // TODO: consider multiple treeShaking shared scenes
              !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur)
            );
          };
          const maxVersion = findVersion(shareVersionMap, callback);
          return shareVersionMap[maxVersion];
        };
        const resolver = extraOptions?.resolver ?? defaultResolver;
        const isPlainObject = (val) => {
          return val !== null && typeof val === 'object' && !Array.isArray(val);
        };
        const merge = (...sources) => {
          const out = {};
          for (const src of sources) {
            if (!src) continue;
            for (const [key, value] of Object.entries(src)) {
              const prev = out[key];
              if (isPlainObject(prev) && isPlainObject(value)) {
                out[key] = merge(prev, value);
              } else if (value !== undefined) {
                out[key] = value;
              }
            }
          }
          return out;
        };
        return merge(
          resolver(shareInfos[pkgName]),
          extraOptions?.customShareInfo,
        );
      }
      const addUseIn = (shared, from) => {
        if (!shared.useIn) {
          shared.useIn = [];
        }
        addUniqueItem(shared.useIn, from);
      };
      function directShare(shared, useTreesShaking) {
        if (useTreesShaking && shared.treeShaking) {
          return shared.treeShaking;
        }
        return shared;
      }

      function getBuilderId() {
        //@ts-ignore
        return true
          ? //@ts-ignore
            'app2:0.0.0'
          : 0;
      }

      // Function to match a remote with its name and expose
      // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
      // id: alias(app1) + expose(button) = app1/button
      // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
      function matchRemoteWithNameAndExpose(remotes, id) {
        for (const remote of remotes) {
          // match pkgName
          const isNameMatched = id.startsWith(remote.name);
          let expose = id.replace(remote.name, '');
          if (isNameMatched) {
            if (expose.startsWith('/')) {
              const pkgNameOrAlias = remote.name;
              expose = `.${expose}`;
              return {
                pkgNameOrAlias,
                expose,
                remote,
              };
            } else if (expose === '') {
              return {
                pkgNameOrAlias: remote.name,
                expose: '.',
                remote,
              };
            }
          }
          // match alias
          const isAliasMatched = remote.alias && id.startsWith(remote.alias);
          let exposeWithAlias = remote.alias && id.replace(remote.alias, '');
          if (remote.alias && isAliasMatched) {
            if (exposeWithAlias && exposeWithAlias.startsWith('/')) {
              const pkgNameOrAlias = remote.alias;
              exposeWithAlias = `.${exposeWithAlias}`;
              return {
                pkgNameOrAlias,
                expose: exposeWithAlias,
                remote,
              };
            } else if (exposeWithAlias === '') {
              return {
                pkgNameOrAlias: remote.alias,
                expose: '.',
                remote,
              };
            }
          }
        }
        return;
      }
      // Function to match a remote with its name or alias
      function matchRemote(remotes, nameOrAlias) {
        for (const remote of remotes) {
          const isNameMatched = nameOrAlias === remote.name;
          if (isNameMatched) {
            return remote;
          }
          const isAliasMatched = remote.alias && nameOrAlias === remote.alias;
          if (isAliasMatched) {
            return remote;
          }
        }
        return;
      }

      function registerPlugins(plugins, instance) {
        const globalPlugins = getGlobalHostPlugins();
        const hookInstances = [
          instance.hooks,
          instance.remoteHandler.hooks,
          instance.sharedHandler.hooks,
          instance.snapshotHandler.hooks,
          instance.loaderHook,
          instance.bridgeHook,
        ];
        // Incorporate global plugins
        if (globalPlugins.length > 0) {
          globalPlugins.forEach((plugin) => {
            if (plugins?.find((item) => item.name !== plugin.name)) {
              plugins.push(plugin);
            }
          });
        }
        if (plugins && plugins.length > 0) {
          plugins.forEach((plugin) => {
            hookInstances.forEach((hookInstance) => {
              hookInstance.applyPlugin(plugin, instance);
            });
          });
        }
        return plugins;
      }

      const importCallback = '.then(callbacks[0]).catch(callbacks[1])';
      async function loadEsmEntry({ entry, remoteEntryExports }) {
        return new Promise((resolve, reject) => {
          try {
            if (!remoteEntryExports) {
              if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== 'undefined') {
                new Function(
                  'callbacks',
                  `import("${entry}")${importCallback}`,
                )([resolve, reject]);
              } else {
                import(/* webpackIgnore: true */ /* @vite-ignore */ entry)
                  .then(resolve)
                  .catch(reject);
              }
            } else {
              resolve(remoteEntryExports);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      async function loadSystemJsEntry({ entry, remoteEntryExports }) {
        return new Promise((resolve, reject) => {
          try {
            if (!remoteEntryExports) {
              //@ts-ignore
              if (false) {
              } else {
                new Function(
                  'callbacks',
                  `System.import("${entry}")${importCallback}`,
                )([resolve, reject]);
              }
            } else {
              resolve(remoteEntryExports);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      function handleRemoteEntryLoaded(name, globalName, entry) {
        const { remoteEntryKey, entryExports } = getRemoteEntryExports(
          name,
          globalName,
        );
        assert(
          entryExports,
          errorCodes.getShortErrorMsg(
            errorCodes.RUNTIME_001,
            errorCodes.runtimeDescMap,
            {
              remoteName: name,
              remoteEntryUrl: entry,
              remoteEntryKey,
            },
          ),
        );
        return entryExports;
      }
      async function loadEntryScript({
        name,
        globalName,
        entry,
        loaderHook,
        getEntryUrl,
      }) {
        const { entryExports: remoteEntryExports } = getRemoteEntryExports(
          name,
          globalName,
        );
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        // if getEntryUrl is passed, use the getEntryUrl to get the entry url
        const url = getEntryUrl ? getEntryUrl(entry) : entry;
        return sdk
          .loadScript(url, {
            attrs: {},
            createScriptHook: (url, attrs) => {
              const res = loaderHook.lifecycle.createScript.emit({
                url,
                attrs,
              });
              if (!res) return;
              if (res instanceof HTMLScriptElement) {
                return res;
              }
              if ('script' in res || 'timeout' in res) {
                return res;
              }
              return;
            },
          })
          .then(() => {
            return handleRemoteEntryLoaded(name, globalName, entry);
          })
          .catch((e) => {
            assert(
              undefined,
              errorCodes.getShortErrorMsg(
                errorCodes.RUNTIME_008,
                errorCodes.runtimeDescMap,
                {
                  remoteName: name,
                  resourceUrl: entry,
                },
              ),
            );
            throw e;
          });
      }
      async function loadEntryDom({
        remoteInfo,
        remoteEntryExports,
        loaderHook,
        getEntryUrl,
      }) {
        const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        switch (type) {
          case 'esm':
          case 'module':
            return loadEsmEntry({ entry, remoteEntryExports });
          case 'system':
            return loadSystemJsEntry({ entry, remoteEntryExports });
          default:
            return loadEntryScript({
              entry,
              globalName,
              name,
              loaderHook,
              getEntryUrl,
            });
        }
      }
      async function loadEntryNode({ remoteInfo, loaderHook }) {
        const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        const { entryExports: remoteEntryExports } = getRemoteEntryExports(
          name,
          globalName,
        );
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        return sdk
          .loadScriptNode(entry, {
            attrs: { name, globalName, type },
            loaderHook: {
              createScriptHook: (url, attrs = {}) => {
                const res = loaderHook.lifecycle.createScript.emit({
                  url,
                  attrs,
                });
                if (!res) return;
                if ('url' in res) {
                  return res;
                }
                return;
              },
            },
          })
          .then(() => {
            return handleRemoteEntryLoaded(name, globalName, entry);
          })
          .catch((e) => {
            throw e;
          });
      }
      function getRemoteEntryUniqueKey(remoteInfo) {
        const { entry, name } = remoteInfo;
        return sdk.composeKeyWithSeparator(name, entry);
      }
      async function getRemoteEntry(params) {
        const {
          origin,
          remoteEntryExports,
          remoteInfo,
          getEntryUrl,
          _inErrorHandling = false,
        } = params;
        const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        if (!globalLoading[uniqueKey]) {
          const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
          const loaderHook = origin.loaderHook;
          globalLoading[uniqueKey] = loadEntryHook
            .emit({
              loaderHook,
              remoteInfo,
              remoteEntryExports,
            })
            .then((res) => {
              if (res) {
                return res;
              }
              // Use ENV_TARGET if defined, otherwise fallback to isBrowserEnv, must keep this
              const isWebEnvironment =
                typeof ENV_TARGET !== 'undefined'
                  ? ENV_TARGET === 'web'
                  : sdk.isBrowserEnv();
              return isWebEnvironment
                ? loadEntryDom({
                    remoteInfo,
                    remoteEntryExports,
                    loaderHook,
                    getEntryUrl,
                  })
                : loadEntryNode({ remoteInfo, loaderHook });
            })
            .catch(async (err) => {
              const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
              const isScriptLoadError =
                err instanceof Error &&
                err.message.includes(errorCodes.RUNTIME_008);
              if (isScriptLoadError && !_inErrorHandling) {
                const wrappedGetRemoteEntry = (params) => {
                  return getRemoteEntry({ ...params, _inErrorHandling: true });
                };
                const RemoteEntryExports =
                  await origin.loaderHook.lifecycle.loadEntryError.emit({
                    getRemoteEntry: wrappedGetRemoteEntry,
                    origin,
                    remoteInfo: remoteInfo,
                    remoteEntryExports,
                    globalLoading,
                    uniqueKey,
                  });
                if (RemoteEntryExports) {
                  return RemoteEntryExports;
                }
              }
              throw err;
            });
        }
        return globalLoading[uniqueKey];
      }
      function getRemoteInfo(remote) {
        return {
          ...remote,
          entry: 'entry' in remote ? remote.entry : '',
          type: remote.type || DEFAULT_REMOTE_TYPE,
          entryGlobalName: remote.entryGlobalName || remote.name,
          shareScope: remote.shareScope || DEFAULT_SCOPE,
        };
      }

      function defaultPreloadArgs(preloadConfig) {
        return {
          resourceCategory: 'sync',
          share: true,
          depsRemote: true,
          prefetchInterface: false,
          ...preloadConfig,
        };
      }
      function formatPreloadArgs(remotes, preloadArgs) {
        return preloadArgs.map((args) => {
          const remoteInfo = matchRemote(remotes, args.nameOrAlias);
          assert(
            remoteInfo,
            `Unable to preload ${args.nameOrAlias} as it is not included in ${
              !remoteInfo &&
              sdk.safeToString({
                remoteInfo,
                remotes,
              })
            }`,
          );
          return {
            remote: remoteInfo,
            preloadConfig: defaultPreloadArgs(args),
          };
        });
      }
      function normalizePreloadExposes(exposes) {
        if (!exposes) {
          return [];
        }
        return exposes.map((expose) => {
          if (expose === '.') {
            return expose;
          }
          if (expose.startsWith('./')) {
            return expose.replace('./', '');
          }
          return expose;
        });
      }
      function preloadAssets(
        remoteInfo,
        host,
        assets,
        // It is used to distinguish preload from load remote parallel loading
        useLinkPreload = true,
      ) {
        const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
        if (host.options.inBrowser) {
          entryAssets.forEach((asset) => {
            const { moduleInfo } = asset;
            const module = host.moduleCache.get(remoteInfo.name);
            if (module) {
              getRemoteEntry({
                origin: host,
                remoteInfo: moduleInfo,
                remoteEntryExports: module.remoteEntryExports,
              });
            } else {
              getRemoteEntry({
                origin: host,
                remoteInfo: moduleInfo,
                remoteEntryExports: undefined,
              });
            }
          });
          if (useLinkPreload) {
            const defaultAttrs = {
              rel: 'preload',
              as: 'style',
            };
            cssAssets.forEach((cssUrl) => {
              const { link: cssEl, needAttach } = sdk.createLink({
                url: cssUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
              });
              needAttach && document.head.appendChild(cssEl);
            });
          } else {
            const defaultAttrs = {
              rel: 'stylesheet',
              type: 'text/css',
            };
            cssAssets.forEach((cssUrl) => {
              const { link: cssEl, needAttach } = sdk.createLink({
                url: cssUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
                needDeleteLink: false,
              });
              needAttach && document.head.appendChild(cssEl);
            });
          }
          if (useLinkPreload) {
            const defaultAttrs = {
              rel: 'preload',
              as: 'script',
            };
            jsAssetsWithoutEntry.forEach((jsUrl) => {
              const { link: linkEl, needAttach } = sdk.createLink({
                url: jsUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
              });
              needAttach && document.head.appendChild(linkEl);
            });
          } else {
            const defaultAttrs = {
              fetchpriority: 'high',
              type:
                remoteInfo?.type === 'module' ? 'module' : 'text/javascript',
            };
            jsAssetsWithoutEntry.forEach((jsUrl) => {
              const { script: scriptEl, needAttach } = sdk.createScript({
                url: jsUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createScriptHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createScript.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLScriptElement) {
                    return res;
                  }
                  return;
                },
                needDeleteScript: true,
              });
              needAttach && document.head.appendChild(scriptEl);
            });
          }
        }
      }

      const ShareUtils = {
        getRegisteredShare,
        getGlobalShareScope,
      };
      const GlobalUtils = {
        Global,
        nativeGlobal,
        resetFederationGlobalInfo,
        setGlobalFederationInstance,
        getGlobalFederationConstructor,
        setGlobalFederationConstructor,
        getInfoWithoutType,
        getGlobalSnapshot,
        getTargetSnapshotInfoByModuleInfo,
        getGlobalSnapshotInfoByModuleInfo,
        setGlobalSnapshotInfoByModuleInfo,
        addGlobalSnapshot,
        getRemoteEntryExports,
        registerGlobalPlugins,
        getGlobalHostPlugins,
        getPreloaded,
        setPreloaded,
      };
      var helpers = {
        global: GlobalUtils,
        share: ShareUtils,
        utils: {
          matchRemoteWithNameAndExpose,
          preloadAssets,
          getRemoteInfo,
        },
      };

      function createRemoteEntryInitOptions(remoteInfo, hostShareScopeMap) {
        const localShareScopeMap = hostShareScopeMap;
        const shareScopeKeys = Array.isArray(remoteInfo.shareScope)
          ? remoteInfo.shareScope
          : [remoteInfo.shareScope];
        if (!shareScopeKeys.length) {
          shareScopeKeys.push('default');
        }
        shareScopeKeys.forEach((shareScopeKey) => {
          if (!localShareScopeMap[shareScopeKey]) {
            localShareScopeMap[shareScopeKey] = {};
          }
        });
        const remoteEntryInitOptions = {
          version: remoteInfo.version || '',
          shareScopeKeys: Array.isArray(remoteInfo.shareScope)
            ? shareScopeKeys
            : remoteInfo.shareScope || 'default',
        };
        // Help to find host instance
        Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
          value: localShareScopeMap,
          // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
          enumerable: false,
        });
        // TODO: compate legacy init params, should use shareScopeMap if exist
        const shareScope = localShareScopeMap[shareScopeKeys[0]];
        const initScope = [];
        return {
          remoteEntryInitOptions,
          shareScope,
          initScope,
        };
      }
      class Module {
        constructor({ remoteInfo, host }) {
          this.inited = false;
          this.initing = false;
          this.lib = undefined;
          this.remoteInfo = remoteInfo;
          this.host = host;
        }
        async getEntry() {
          if (this.remoteEntryExports) {
            return this.remoteEntryExports;
          }
          const remoteEntryExports = await getRemoteEntry({
            origin: this.host,
            remoteInfo: this.remoteInfo,
            remoteEntryExports: this.remoteEntryExports,
          });
          assert(
            remoteEntryExports,
            `remoteEntryExports is undefined \n ${sdk.safeToString(this.remoteInfo)}`,
          );
          this.remoteEntryExports = remoteEntryExports;
          return this.remoteEntryExports;
        }
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async init(id, remoteSnapshot) {
          // Get remoteEntry.js
          const remoteEntryExports = await this.getEntry();
          if (!this.inited && !this.initing) {
            this.initing = true;
            const { remoteEntryInitOptions, shareScope, initScope } =
              createRemoteEntryInitOptions(
                this.remoteInfo,
                this.host.shareScopeMap,
              );
            const initContainerOptions =
              await this.host.hooks.lifecycle.beforeInitContainer.emit({
                shareScope,
                // @ts-ignore shareScopeMap will be set by Object.defineProperty
                remoteEntryInitOptions,
                initScope,
                remoteInfo: this.remoteInfo,
                origin: this.host,
              });
            if (typeof remoteEntryExports?.init === 'undefined') {
              error(
                errorCodes.getShortErrorMsg(
                  errorCodes.RUNTIME_002,
                  errorCodes.runtimeDescMap,
                  {
                    hostName: this.host.name,
                    remoteName: this.remoteInfo.name,
                    remoteEntryUrl: this.remoteInfo.entry,
                    remoteEntryKey: this.remoteInfo.entryGlobalName,
                  },
                ),
              );
            }
            await remoteEntryExports.init(
              initContainerOptions.shareScope,
              initContainerOptions.initScope,
              initContainerOptions.remoteEntryInitOptions,
            );
            await this.host.hooks.lifecycle.initContainer.emit({
              ...initContainerOptions,
              id,
              remoteSnapshot,
              remoteEntryExports,
            });
            this.inited = true;
          }
          return remoteEntryExports;
        }
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async get(id, expose, options, remoteSnapshot) {
          const { loadFactory = true } = options || { loadFactory: true };
          const remoteEntryExports = await this.init(id, remoteSnapshot);
          this.lib = remoteEntryExports;
          let moduleFactory;
          moduleFactory =
            await this.host.loaderHook.lifecycle.getModuleFactory.emit({
              remoteEntryExports,
              expose,
              moduleInfo: this.remoteInfo,
            });
          // get exposeGetter
          if (!moduleFactory) {
            moduleFactory = await remoteEntryExports.get(expose);
          }
          assert(
            moduleFactory,
            `${getFMId(this.remoteInfo)} remote don't export ${expose}.`,
          );
          // keep symbol for module name always one format
          const symbolName = processModuleAlias(this.remoteInfo.name, expose);
          const wrapModuleFactory = this.wraperFactory(
            moduleFactory,
            symbolName,
          );
          if (!loadFactory) {
            return wrapModuleFactory;
          }
          const exposeContent = await wrapModuleFactory();
          return exposeContent;
        }
        wraperFactory(moduleFactory, id) {
          function defineModuleId(res, id) {
            if (
              res &&
              typeof res === 'object' &&
              Object.isExtensible(res) &&
              !Object.getOwnPropertyDescriptor(res, Symbol.for('mf_module_id'))
            ) {
              Object.defineProperty(res, Symbol.for('mf_module_id'), {
                value: id,
                enumerable: false,
              });
            }
          }
          if (moduleFactory instanceof Promise) {
            return async () => {
              const res = await moduleFactory();
              // This parameter is used for bridge debugging
              defineModuleId(res, id);
              return res;
            };
          } else {
            return () => {
              const res = moduleFactory();
              // This parameter is used for bridge debugging
              defineModuleId(res, id);
              return res;
            };
          }
        }
      }

      class SyncHook {
        constructor(type) {
          this.type = '';
          this.listeners = new Set();
          if (type) {
            this.type = type;
          }
        }
        on(fn) {
          if (typeof fn === 'function') {
            this.listeners.add(fn);
          }
        }
        once(fn) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          this.on(function wrapper(...args) {
            self.remove(wrapper);
            // eslint-disable-next-line prefer-spread
            return fn.apply(null, args);
          });
        }
        emit(...data) {
          let result;
          if (this.listeners.size > 0) {
            // eslint-disable-next-line prefer-spread
            this.listeners.forEach((fn) => {
              result = fn(...data);
            });
          }
          return result;
        }
        remove(fn) {
          this.listeners.delete(fn);
        }
        removeAll() {
          this.listeners.clear();
        }
      }

      class AsyncHook extends SyncHook {
        emit(...data) {
          let result;
          const ls = Array.from(this.listeners);
          if (ls.length > 0) {
            let i = 0;
            const call = (prev) => {
              if (prev === false) {
                return false; // Abort process
              } else if (i < ls.length) {
                return Promise.resolve(ls[i++].apply(null, data)).then(call);
              } else {
                return prev;
              }
            };
            result = call();
          }
          return Promise.resolve(result);
        }
      }

      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      function checkReturnData(originalData, returnedData) {
        if (!isObject(returnedData)) {
          return false;
        }
        if (originalData !== returnedData) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key in originalData) {
            if (!(key in returnedData)) {
              return false;
            }
          }
        }
        return true;
      }
      class SyncWaterfallHook extends SyncHook {
        constructor(type) {
          super();
          this.onerror = error;
          this.type = type;
        }
        emit(data) {
          if (!isObject(data)) {
            error(`The data for the "${this.type}" hook should be an object.`);
          }
          for (const fn of this.listeners) {
            try {
              const tempData = fn(data);
              if (checkReturnData(data, tempData)) {
                data = tempData;
              } else {
                this.onerror(
                  `A plugin returned an unacceptable value for the "${this.type}" type.`,
                );
                break;
              }
            } catch (e) {
              warn(e);
              this.onerror(e);
            }
          }
          return data;
        }
      }

      class AsyncWaterfallHook extends SyncHook {
        constructor(type) {
          super();
          this.onerror = error;
          this.type = type;
        }
        emit(data) {
          if (!isObject(data)) {
            error(
              `The response data for the "${this.type}" hook must be an object.`,
            );
          }
          const ls = Array.from(this.listeners);
          if (ls.length > 0) {
            let i = 0;
            const processError = (e) => {
              warn(e);
              this.onerror(e);
              return data;
            };
            const call = (prevData) => {
              if (checkReturnData(data, prevData)) {
                data = prevData;
                if (i < ls.length) {
                  try {
                    return Promise.resolve(ls[i++](data)).then(
                      call,
                      processError,
                    );
                  } catch (e) {
                    return processError(e);
                  }
                }
              } else {
                this.onerror(
                  `A plugin returned an incorrect value for the "${this.type}" type.`,
                );
              }
              return data;
            };
            return Promise.resolve(call(data));
          }
          return Promise.resolve(data);
        }
      }

      class PluginSystem {
        constructor(lifecycle) {
          this.registerPlugins = {};
          this.lifecycle = lifecycle;
          this.lifecycleKeys = Object.keys(lifecycle);
        }
        applyPlugin(plugin, instance) {
          assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
          // The plugin's name is mandatory and must be unique
          const pluginName = plugin.name;
          assert(pluginName, 'A name must be provided by the plugin.');
          if (!this.registerPlugins[pluginName]) {
            this.registerPlugins[pluginName] = plugin;
            plugin.apply?.(instance);
            Object.keys(this.lifecycle).forEach((key) => {
              const pluginLife = plugin[key];
              if (pluginLife) {
                this.lifecycle[key].on(pluginLife);
              }
            });
          }
        }
        removePlugin(pluginName) {
          assert(pluginName, 'A name is required.');
          const plugin = this.registerPlugins[pluginName];
          assert(plugin, `The plugin "${pluginName}" is not registered.`);
          Object.keys(plugin).forEach((key) => {
            if (key !== 'name') {
              this.lifecycle[key].remove(plugin[key]);
            }
          });
        }
      }

      function assignRemoteInfo(remoteInfo, remoteSnapshot) {
        const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
        if (!remoteEntryInfo.url) {
          error(
            `The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`,
          );
        }
        let entryUrl = sdk.getResourceUrl(remoteSnapshot, remoteEntryInfo.url);
        if (!sdk.isBrowserEnv() && !entryUrl.startsWith('http')) {
          entryUrl = `https:${entryUrl}`;
        }
        remoteInfo.type = remoteEntryInfo.type;
        remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
        remoteInfo.entry = entryUrl;
        remoteInfo.version = remoteSnapshot.version;
        remoteInfo.buildVersion = remoteSnapshot.buildVersion;
      }
      function snapshotPlugin() {
        return {
          name: 'snapshot-plugin',
          async afterResolve(args) {
            const { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } =
              args;
            if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
              const { remoteSnapshot, globalSnapshot } =
                await origin.snapshotHandler.loadRemoteSnapshotInfo({
                  moduleInfo: remote,
                  id,
                });
              assignRemoteInfo(remoteInfo, remoteSnapshot);
              // preloading assets
              const preloadOptions = {
                remote,
                preloadConfig: {
                  nameOrAlias: pkgNameOrAlias,
                  exposes: [expose],
                  resourceCategory: 'sync',
                  share: false,
                  depsRemote: false,
                },
              };
              const assets =
                await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit(
                  {
                    origin,
                    preloadOptions,
                    remoteInfo,
                    remote,
                    remoteSnapshot,
                    globalSnapshot,
                  },
                );
              if (assets) {
                preloadAssets(remoteInfo, origin, assets, false);
              }
              return {
                ...args,
                remoteSnapshot,
              };
            }
            return args;
          },
        };
      }

      // name
      // name:version
      function splitId(id) {
        const splitInfo = id.split(':');
        if (splitInfo.length === 1) {
          return {
            name: splitInfo[0],
            version: undefined,
          };
        } else if (splitInfo.length === 2) {
          return {
            name: splitInfo[0],
            version: splitInfo[1],
          };
        } else {
          return {
            name: splitInfo[1],
            version: splitInfo[2],
          };
        }
      }
      // Traverse all nodes in moduleInfo and traverse the entire snapshot
      function traverseModuleInfo(
        globalSnapshot,
        remoteInfo,
        traverse,
        isRoot,
        memo = {},
        remoteSnapshot,
      ) {
        const id = getFMId(remoteInfo);
        const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
        const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
        if (
          effectiveRemoteSnapshot &&
          !sdk.isManifestProvider(effectiveRemoteSnapshot)
        ) {
          traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
          if (effectiveRemoteSnapshot.remotesInfo) {
            const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
            for (const key of remoteKeys) {
              if (memo[key]) {
                continue;
              }
              memo[key] = true;
              const subRemoteInfo = splitId(key);
              const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
              traverseModuleInfo(
                globalSnapshot,
                {
                  name: subRemoteInfo.name,
                  version: remoteValue.matchedVersion,
                },
                traverse,
                false,
                memo,
                undefined,
              );
            }
          }
        }
      }
      const isExisted = (type, url) => {
        return document.querySelector(
          `${type}[${type === 'link' ? 'href' : 'src'}="${url}"]`,
        );
      };
      // eslint-disable-next-line max-lines-per-function
      function generatePreloadAssets(
        origin,
        preloadOptions,
        remote,
        globalSnapshot,
        remoteSnapshot,
      ) {
        const cssAssets = [];
        const jsAssets = [];
        const entryAssets = [];
        const loadedSharedJsAssets = new Set();
        const loadedSharedCssAssets = new Set();
        const { options } = origin;
        const { preloadConfig: rootPreloadConfig } = preloadOptions;
        const { depsRemote } = rootPreloadConfig;
        const memo = {};
        traverseModuleInfo(
          globalSnapshot,
          remote,
          (moduleInfoSnapshot, remoteInfo, isRoot) => {
            let preloadConfig;
            if (isRoot) {
              preloadConfig = rootPreloadConfig;
            } else {
              if (Array.isArray(depsRemote)) {
                // eslint-disable-next-line array-callback-return
                const findPreloadConfig = depsRemote.find((remoteConfig) => {
                  if (
                    remoteConfig.nameOrAlias === remoteInfo.name ||
                    remoteConfig.nameOrAlias === remoteInfo.alias
                  ) {
                    return true;
                  }
                  return false;
                });
                if (!findPreloadConfig) {
                  return;
                }
                preloadConfig = defaultPreloadArgs(findPreloadConfig);
              } else if (depsRemote === true) {
                preloadConfig = rootPreloadConfig;
              } else {
                return;
              }
            }
            const remoteEntryUrl = sdk.getResourceUrl(
              moduleInfoSnapshot,
              getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url,
            );
            if (remoteEntryUrl) {
              entryAssets.push({
                name: remoteInfo.name,
                moduleInfo: {
                  name: remoteInfo.name,
                  entry: remoteEntryUrl,
                  type:
                    'remoteEntryType' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.remoteEntryType
                      : 'global',
                  entryGlobalName:
                    'globalName' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.globalName
                      : remoteInfo.name,
                  shareScope: '',
                  version:
                    'version' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.version
                      : undefined,
                },
                url: remoteEntryUrl,
              });
            }
            let moduleAssetsInfo =
              'modules' in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
            const normalizedPreloadExposes = normalizePreloadExposes(
              preloadConfig.exposes,
            );
            if (
              normalizedPreloadExposes.length &&
              'modules' in moduleInfoSnapshot
            ) {
              moduleAssetsInfo = moduleInfoSnapshot?.modules?.reduce(
                (assets, moduleAssetInfo) => {
                  if (
                    normalizedPreloadExposes?.indexOf(
                      moduleAssetInfo.moduleName,
                    ) !== -1
                  ) {
                    assets.push(moduleAssetInfo);
                  }
                  return assets;
                },
                [],
              );
            }
            function handleAssets(assets) {
              const assetsRes = assets.map((asset) =>
                sdk.getResourceUrl(moduleInfoSnapshot, asset),
              );
              if (preloadConfig.filter) {
                return assetsRes.filter(preloadConfig.filter);
              }
              return assetsRes;
            }
            if (moduleAssetsInfo) {
              const assetsLength = moduleAssetsInfo.length;
              for (let index = 0; index < assetsLength; index++) {
                const assetsInfo = moduleAssetsInfo[index];
                const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
                origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
                  id:
                    assetsInfo.moduleName === '.'
                      ? remoteInfo.name
                      : exposeFullPath,
                  name: remoteInfo.name,
                  remoteSnapshot: moduleInfoSnapshot,
                  preloadConfig,
                  remote: remoteInfo,
                  origin,
                });
                const preloaded = getPreloaded(exposeFullPath);
                if (preloaded) {
                  continue;
                }
                if (preloadConfig.resourceCategory === 'all') {
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                  // eslint-disable-next-line no-constant-condition
                } else if ((preloadConfig.resourceCategory = 'sync')) {
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                }
                setPreloaded(exposeFullPath);
              }
            }
          },
          true,
          memo,
          remoteSnapshot,
        );
        if (remoteSnapshot.shared && remoteSnapshot.shared.length > 0) {
          const collectSharedAssets = (shareInfo, snapshotShared) => {
            const { shared: registeredShared } =
              getRegisteredShare(
                origin.shareScopeMap,
                snapshotShared.sharedName,
                shareInfo,
                origin.sharedHandler.hooks.lifecycle.resolveShare,
              ) || {};
            // If the global share does not exist, or the lib function does not exist, it means that the shared has not been loaded yet and can be preloaded.
            if (
              registeredShared &&
              typeof registeredShared.lib === 'function'
            ) {
              snapshotShared.assets.js.sync.forEach((asset) => {
                loadedSharedJsAssets.add(asset);
              });
              snapshotShared.assets.css.sync.forEach((asset) => {
                loadedSharedCssAssets.add(asset);
              });
            }
          };
          remoteSnapshot.shared.forEach((shared) => {
            const shareInfos = options.shared?.[shared.sharedName];
            if (!shareInfos) {
              return;
            }
            // if no version, preload all shared
            const sharedOptions = shared.version
              ? shareInfos.find((s) => s.version === shared.version)
              : shareInfos;
            if (!sharedOptions) {
              return;
            }
            const arrayShareInfo = arrayOptions(sharedOptions);
            arrayShareInfo.forEach((s) => {
              collectSharedAssets(s, shared);
            });
          });
        }
        const needPreloadJsAssets = jsAssets.filter(
          (asset) =>
            !loadedSharedJsAssets.has(asset) && !isExisted('script', asset),
        );
        const needPreloadCssAssets = cssAssets.filter(
          (asset) =>
            !loadedSharedCssAssets.has(asset) && !isExisted('link', asset),
        );
        return {
          cssAssets: needPreloadCssAssets,
          jsAssetsWithoutEntry: needPreloadJsAssets,
          entryAssets: entryAssets.filter(
            (entry) => !isExisted('script', entry.url),
          ),
        };
      }
      const generatePreloadAssetsPlugin = function () {
        return {
          name: 'generate-preload-assets-plugin',
          async generatePreloadAssets(args) {
            const {
              origin,
              preloadOptions,
              remoteInfo,
              remote,
              globalSnapshot,
              remoteSnapshot,
            } = args;
            if (!sdk.isBrowserEnv()) {
              return {
                cssAssets: [],
                jsAssetsWithoutEntry: [],
                entryAssets: [],
              };
            }
            if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) {
              return {
                cssAssets: [],
                jsAssetsWithoutEntry: [],
                entryAssets: [
                  {
                    name: remote.name,
                    url: remote.entry,
                    moduleInfo: {
                      name: remoteInfo.name,
                      entry: remote.entry,
                      type: remoteInfo.type || 'global',
                      entryGlobalName: '',
                      shareScope: '',
                    },
                  },
                ],
              };
            }
            assignRemoteInfo(remoteInfo, remoteSnapshot);
            const assets = generatePreloadAssets(
              origin,
              preloadOptions,
              remoteInfo,
              globalSnapshot,
              remoteSnapshot,
            );
            return assets;
          },
        };
      };

      function getGlobalRemoteInfo(moduleInfo, origin) {
        const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
          name: origin.name,
          version: origin.options.version,
        });
        // get remote detail info from global
        const globalRemoteInfo =
          hostGlobalSnapshot &&
          'remotesInfo' in hostGlobalSnapshot &&
          hostGlobalSnapshot.remotesInfo &&
          getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name)
            .value;
        if (globalRemoteInfo && globalRemoteInfo.matchedVersion) {
          return {
            hostGlobalSnapshot,
            globalSnapshot: getGlobalSnapshot(),
            remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
              name: moduleInfo.name,
              version: globalRemoteInfo.matchedVersion,
            }),
          };
        }
        return {
          hostGlobalSnapshot: undefined,
          globalSnapshot: getGlobalSnapshot(),
          remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
            name: moduleInfo.name,
            version: 'version' in moduleInfo ? moduleInfo.version : undefined,
          }),
        };
      }
      class SnapshotHandler {
        constructor(HostInstance) {
          this.loadingHostSnapshot = null;
          this.manifestCache = new Map();
          this.hooks = new PluginSystem({
            beforeLoadRemoteSnapshot: new AsyncHook('beforeLoadRemoteSnapshot'),
            loadSnapshot: new AsyncWaterfallHook('loadGlobalSnapshot'),
            loadRemoteSnapshot: new AsyncWaterfallHook('loadRemoteSnapshot'),
            afterLoadSnapshot: new AsyncWaterfallHook('afterLoadSnapshot'),
          });
          this.manifestLoading = Global.__FEDERATION__.__MANIFEST_LOADING__;
          this.HostInstance = HostInstance;
          this.loaderHook = HostInstance.loaderHook;
        }
        // eslint-disable-next-line max-lines-per-function
        async loadRemoteSnapshotInfo({ moduleInfo, id, expose }) {
          const { options } = this.HostInstance;
          await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
            options,
            moduleInfo,
          });
          let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
            name: this.HostInstance.options.name,
            version: this.HostInstance.options.version,
          });
          if (!hostSnapshot) {
            hostSnapshot = {
              version: this.HostInstance.options.version || '',
              remoteEntry: '',
              remotesInfo: {},
            };
            addGlobalSnapshot({
              [this.HostInstance.options.name]: hostSnapshot,
            });
          }
          // In dynamic loadRemote scenarios, incomplete remotesInfo delivery may occur. In such cases, the remotesInfo in the host needs to be completed in the snapshot at runtime.
          // This ensures the snapshot's integrity and helps the chrome plugin correctly identify all producer modules, ensuring that proxyable producer modules will not be missing.
          if (
            hostSnapshot &&
            'remotesInfo' in hostSnapshot &&
            !getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name).value
          ) {
            if ('version' in moduleInfo || 'entry' in moduleInfo) {
              hostSnapshot.remotesInfo = {
                ...hostSnapshot?.remotesInfo,
                [moduleInfo.name]: {
                  matchedVersion:
                    'version' in moduleInfo
                      ? moduleInfo.version
                      : moduleInfo.entry,
                },
              };
            }
          }
          const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } =
            this.getGlobalRemoteInfo(moduleInfo);
          const {
            remoteSnapshot: globalRemoteSnapshot,
            globalSnapshot: globalSnapshotRes,
          } = await this.hooks.lifecycle.loadSnapshot.emit({
            options,
            moduleInfo,
            hostGlobalSnapshot,
            remoteSnapshot,
            globalSnapshot,
          });
          let mSnapshot;
          let gSnapshot;
          // global snapshot includes manifest or module info includes manifest
          if (globalRemoteSnapshot) {
            if (sdk.isManifestProvider(globalRemoteSnapshot)) {
              const remoteEntry = sdk.isBrowserEnv()
                ? globalRemoteSnapshot.remoteEntry
                : globalRemoteSnapshot.ssrRemoteEntry ||
                  globalRemoteSnapshot.remoteEntry ||
                  '';
              const moduleSnapshot = await this.getManifestJson(
                remoteEntry,
                moduleInfo,
                {},
              );
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
                {
                  ...moduleInfo,
                  // The global remote may be overridden
                  // Therefore, set the snapshot key to the global address of the actual request
                  entry: remoteEntry,
                },
                moduleSnapshot,
              );
              mSnapshot = moduleSnapshot;
              gSnapshot = globalSnapshotRes;
            } else {
              const { remoteSnapshot: remoteSnapshotRes } =
                await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                  options: this.HostInstance.options,
                  moduleInfo,
                  remoteSnapshot: globalRemoteSnapshot,
                  from: 'global',
                });
              mSnapshot = remoteSnapshotRes;
              gSnapshot = globalSnapshotRes;
            }
          } else {
            if (isRemoteInfoWithEntry(moduleInfo)) {
              // get from manifest.json and merge remote info from remote server
              const moduleSnapshot = await this.getManifestJson(
                moduleInfo.entry,
                moduleInfo,
                {},
              );
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
                moduleInfo,
                moduleSnapshot,
              );
              const { remoteSnapshot: remoteSnapshotRes } =
                await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                  options: this.HostInstance.options,
                  moduleInfo,
                  remoteSnapshot: moduleSnapshot,
                  from: 'global',
                });
              mSnapshot = remoteSnapshotRes;
              gSnapshot = globalSnapshotRes;
            } else {
              error(
                errorCodes.getShortErrorMsg(
                  errorCodes.RUNTIME_007,
                  errorCodes.runtimeDescMap,
                  {
                    hostName: moduleInfo.name,
                    hostVersion: moduleInfo.version,
                    globalSnapshot: JSON.stringify(globalSnapshotRes),
                  },
                ),
              );
            }
          }
          await this.hooks.lifecycle.afterLoadSnapshot.emit({
            id,
            host: this.HostInstance,
            options,
            moduleInfo,
            remoteSnapshot: mSnapshot,
          });
          return {
            remoteSnapshot: mSnapshot,
            globalSnapshot: gSnapshot,
          };
        }
        getGlobalRemoteInfo(moduleInfo) {
          return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
        }
        async getManifestJson(manifestUrl, moduleInfo, extraOptions) {
          const getManifest = async () => {
            let manifestJson = this.manifestCache.get(manifestUrl);
            if (manifestJson) {
              return manifestJson;
            }
            try {
              let res = await this.loaderHook.lifecycle.fetch.emit(
                manifestUrl,
                {},
              );
              if (!res || !(res instanceof Response)) {
                res = await fetch(manifestUrl, {});
              }
              manifestJson = await res.json();
            } catch (err) {
              manifestJson =
                await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
                  {
                    id: manifestUrl,
                    error: err,
                    from: 'runtime',
                    lifecycle: 'afterResolve',
                    origin: this.HostInstance,
                  },
                );
              if (!manifestJson) {
                delete this.manifestLoading[manifestUrl];
                error(
                  errorCodes.getShortErrorMsg(
                    errorCodes.RUNTIME_003,
                    errorCodes.runtimeDescMap,
                    {
                      manifestUrl,
                      moduleName: moduleInfo.name,
                      hostName: this.HostInstance.options.name,
                    },
                    `${err}`,
                  ),
                );
              }
            }
            assert(
              manifestJson.metaData &&
                manifestJson.exposes &&
                manifestJson.shared,
              `${manifestUrl} is not a federation manifest`,
            );
            this.manifestCache.set(manifestUrl, manifestJson);
            return manifestJson;
          };
          const asyncLoadProcess = async () => {
            const manifestJson = await getManifest();
            const remoteSnapshot = sdk.generateSnapshotFromManifest(
              manifestJson,
              {
                version: manifestUrl,
              },
            );
            const { remoteSnapshot: remoteSnapshotRes } =
              await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                options: this.HostInstance.options,
                moduleInfo,
                manifestJson,
                remoteSnapshot,
                manifestUrl,
                from: 'manifest',
              });
            return remoteSnapshotRes;
          };
          if (!this.manifestLoading[manifestUrl]) {
            this.manifestLoading[manifestUrl] = asyncLoadProcess().then(
              (res) => res,
            );
          }
          return this.manifestLoading[manifestUrl];
        }
      }

      class SharedHandler {
        constructor(host) {
          this.hooks = new PluginSystem({
            beforeRegisterShare: new SyncWaterfallHook('beforeRegisterShare'),
            afterResolve: new AsyncWaterfallHook('afterResolve'),
            beforeLoadShare: new AsyncWaterfallHook('beforeLoadShare'),
            // not used yet
            loadShare: new AsyncHook(),
            resolveShare: new SyncWaterfallHook('resolveShare'),
            // maybe will change, temporarily for internal use only
            initContainerShareScopeMap: new SyncWaterfallHook(
              'initContainerShareScopeMap',
            ),
          });
          this.host = host;
          this.shareScopeMap = {};
          this.initTokens = {};
          this._setGlobalShareScopeMap(host.options);
        }
        // register shared in shareScopeMap
        registerShared(globalOptions, userOptions) {
          const { newShareInfos, allShareInfos } = formatShareConfigs(
            globalOptions,
            userOptions,
          );
          const sharedKeys = Object.keys(newShareInfos);
          sharedKeys.forEach((sharedKey) => {
            const sharedVals = newShareInfos[sharedKey];
            sharedVals.forEach((sharedVal) => {
              sharedVal.scope.forEach((sc) => {
                this.hooks.lifecycle.beforeRegisterShare.emit({
                  origin: this.host,
                  pkgName: sharedKey,
                  shared: sharedVal,
                });
                const registeredShared = this.shareScopeMap[sc]?.[sharedKey];
                if (!registeredShared) {
                  this.setShared({
                    pkgName: sharedKey,
                    lib: sharedVal.lib,
                    get: sharedVal.get,
                    loaded: sharedVal.loaded || Boolean(sharedVal.lib),
                    shared: sharedVal,
                    from: userOptions.name,
                  });
                }
              });
            });
          });
          return {
            newShareInfos,
            allShareInfos,
          };
        }
        async loadShare(pkgName, extraOptions) {
          const { host } = this;
          // This function performs the following steps:
          // 1. Checks if the currently loaded share already exists, if not, it throws an error
          // 2. Searches globally for a matching share, if found, it uses it directly
          // 3. If not found, it retrieves it from the current share and stores the obtained share globally.
          const shareOptions = getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared,
          });
          if (shareOptions?.scope) {
            await Promise.all(
              shareOptions.scope.map(async (shareScope) => {
                await Promise.all(
                  this.initializeSharing(shareScope, {
                    strategy: shareOptions.strategy,
                  }),
                );
                return;
              }),
            );
          }
          const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
            pkgName,
            shareInfo: shareOptions,
            shared: host.options.shared,
            origin: host,
          });
          const { shareInfo: shareOptionsRes } = loadShareRes;
          // Assert that shareInfoRes exists, if not, throw an error
          assert(
            shareOptionsRes,
            `Cannot find ${pkgName} Share in the ${host.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`,
          );
          const { shared: registeredShared, useTreesShaking } =
            getRegisteredShare(
              this.shareScopeMap,
              pkgName,
              shareOptionsRes,
              this.hooks.lifecycle.resolveShare,
            ) || {};
          if (registeredShared) {
            const targetShared = directShare(registeredShared, useTreesShaking);
            if (targetShared.lib) {
              addUseIn(targetShared, host.options.name);
              return targetShared.lib;
            } else if (targetShared.loading && !targetShared.loaded) {
              const factory = await targetShared.loading;
              targetShared.loaded = true;
              if (!targetShared.lib) {
                targetShared.lib = factory;
              }
              addUseIn(targetShared, host.options.name);
              return factory;
            } else {
              const asyncLoadProcess = async () => {
                const factory = await targetShared.get();
                addUseIn(targetShared, host.options.name);
                targetShared.loaded = true;
                targetShared.lib = factory;
                return factory;
              };
              const loading = asyncLoadProcess();
              this.setShared({
                pkgName,
                loaded: false,
                shared: registeredShared,
                from: host.options.name,
                lib: null,
                loading,
                treeShaking: useTreesShaking ? targetShared : undefined,
              });
              return loading;
            }
          } else {
            if (extraOptions?.customShareInfo) {
              return false;
            }
            const _useTreeShaking = shouldUseTreeShaking(
              shareOptionsRes.treeShaking,
            );
            const targetShared = directShare(shareOptionsRes, _useTreeShaking);
            const asyncLoadProcess = async () => {
              const factory = await targetShared.get();
              targetShared.lib = factory;
              targetShared.loaded = true;
              addUseIn(targetShared, host.options.name);
              const { shared: gShared, useTreesShaking: gUseTreeShaking } =
                getRegisteredShare(
                  this.shareScopeMap,
                  pkgName,
                  shareOptionsRes,
                  this.hooks.lifecycle.resolveShare,
                ) || {};
              if (gShared) {
                const targetGShared = directShare(gShared, gUseTreeShaking);
                targetGShared.lib = factory;
                targetGShared.loaded = true;
                gShared.from = shareOptionsRes.from;
              }
              return factory;
            };
            const loading = asyncLoadProcess();
            this.setShared({
              pkgName,
              loaded: false,
              shared: shareOptionsRes,
              from: host.options.name,
              lib: null,
              loading,
              treeShaking: _useTreeShaking ? targetShared : undefined,
            });
            return loading;
          }
        }
        /**
         * This function initializes the sharing sequence (executed only once per share scope).
         * It accepts one argument, the name of the share scope.
         * If the share scope does not exist, it creates one.
         */
        // eslint-disable-next-line @typescript-eslint/member-ordering
        initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
          const { host } = this;
          const from = extraOptions?.from;
          const strategy = extraOptions?.strategy;
          let initScope = extraOptions?.initScope;
          const promises = [];
          if (from !== 'build') {
            const { initTokens } = this;
            if (!initScope) initScope = [];
            let initToken = initTokens[shareScopeName];
            if (!initToken)
              initToken = initTokens[shareScopeName] = { from: this.host.name };
            if (initScope.indexOf(initToken) >= 0) return promises;
            initScope.push(initToken);
          }
          const shareScope = this.shareScopeMap;
          const hostName = host.options.name;
          // Creates a new share scope if necessary
          if (!shareScope[shareScopeName]) {
            shareScope[shareScopeName] = {};
          }
          // Executes all initialization snippets from all accessible modules
          const scope = shareScope[shareScopeName];
          const register = (name, shared) => {
            const { version, eager } = shared;
            scope[name] = scope[name] || {};
            const versions = scope[name];
            const activeVersion =
              versions[version] && directShare(versions[version]);
            const activeVersionEager = Boolean(
              activeVersion &&
                (('eager' in activeVersion && activeVersion.eager) ||
                  ('shareConfig' in activeVersion &&
                    activeVersion.shareConfig?.eager)),
            );
            if (
              !activeVersion ||
              (activeVersion.strategy !== 'loaded-first' &&
                !activeVersion.loaded &&
                (Boolean(!eager) !== !activeVersionEager
                  ? eager
                  : hostName > versions[version].from))
            ) {
              versions[version] = shared;
            }
          };
          const initRemoteModule = async (key) => {
            const { module } =
              await host.remoteHandler.getRemoteModuleAndOptions({
                id: key,
              });
            let remoteEntryExports = undefined;
            try {
              remoteEntryExports = await module.getEntry();
            } catch (error) {
              remoteEntryExports =
                await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                  id: key,
                  error,
                  from: 'runtime',
                  lifecycle: 'beforeLoadShare',
                  origin: host,
                });
            } finally {
              if (remoteEntryExports?.init) {
                module.remoteEntryExports = remoteEntryExports;
                await module.init();
              }
            }
          };
          Object.keys(host.options.shared).forEach((shareName) => {
            const sharedArr = host.options.shared[shareName];
            sharedArr.forEach((shared) => {
              if (shared.scope.includes(shareScopeName)) {
                register(shareName, shared);
              }
            });
          });
          // TODO: strategy==='version-first' need to be removed in the future
          if (
            host.options.shareStrategy === 'version-first' ||
            strategy === 'version-first'
          ) {
            host.options.remotes.forEach((remote) => {
              if (remote.shareScope === shareScopeName) {
                promises.push(initRemoteModule(remote.name));
              }
            });
          }
          return promises;
        }
        // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
        // 1. If the loaded shared already exists globally, then it will be reused
        // 2. If lib exists in local shared, it will be used directly
        // 3. If the local get returns something other than Promise, then it will be used directly
        loadShareSync(pkgName, extraOptions) {
          const { host } = this;
          const shareOptions = getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared,
          });
          if (shareOptions?.scope) {
            shareOptions.scope.forEach((shareScope) => {
              this.initializeSharing(shareScope, {
                strategy: shareOptions.strategy,
              });
            });
          }
          const { shared: registeredShared, useTreesShaking } =
            getRegisteredShare(
              this.shareScopeMap,
              pkgName,
              shareOptions,
              this.hooks.lifecycle.resolveShare,
            ) || {};
          if (registeredShared) {
            if (typeof registeredShared.lib === 'function') {
              addUseIn(registeredShared, host.options.name);
              if (!registeredShared.loaded) {
                registeredShared.loaded = true;
                if (registeredShared.from === host.options.name) {
                  shareOptions.loaded = true;
                }
              }
              return registeredShared.lib;
            }
            if (typeof registeredShared.get === 'function') {
              const module = registeredShared.get();
              if (!(module instanceof Promise)) {
                addUseIn(registeredShared, host.options.name);
                this.setShared({
                  pkgName,
                  loaded: true,
                  from: host.options.name,
                  lib: module,
                  shared: registeredShared,
                });
                return module;
              }
            }
          }
          if (shareOptions.lib) {
            if (!shareOptions.loaded) {
              shareOptions.loaded = true;
            }
            return shareOptions.lib;
          }
          if (shareOptions.get) {
            const module = shareOptions.get();
            if (module instanceof Promise) {
              const errorCode =
                extraOptions?.from === 'build'
                  ? errorCodes.RUNTIME_005
                  : errorCodes.RUNTIME_006;
              throw new Error(
                errorCodes.getShortErrorMsg(
                  errorCode,
                  errorCodes.runtimeDescMap,
                  {
                    hostName: host.options.name,
                    sharedPkgName: pkgName,
                  },
                ),
              );
            }
            shareOptions.lib = module;
            this.setShared({
              pkgName,
              loaded: true,
              from: host.options.name,
              lib: shareOptions.lib,
              shared: shareOptions,
            });
            return shareOptions.lib;
          }
          throw new Error(
            errorCodes.getShortErrorMsg(
              errorCodes.RUNTIME_006,
              errorCodes.runtimeDescMap,
              {
                hostName: host.options.name,
                sharedPkgName: pkgName,
              },
            ),
          );
        }
        initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
          const { host } = this;
          this.shareScopeMap[scopeName] = shareScope;
          this.hooks.lifecycle.initContainerShareScopeMap.emit({
            shareScope,
            options: host.options,
            origin: host,
            scopeName,
            hostShareScopeMap: extraOptions.hostShareScopeMap,
          });
        }
        setShared({
          pkgName,
          shared,
          from,
          lib,
          loading,
          loaded,
          get,
          treeShaking,
        }) {
          const { version, scope = 'default', ...shareInfo } = shared;
          const scopes = Array.isArray(scope) ? scope : [scope];
          const mergeAttrs = (shared) => {
            const merge = (s, key, val) => {
              if (val && !s[key]) {
                s[key] = val;
              }
            };
            const targetShared = treeShaking ? shared.treeShaking : shared;
            merge(targetShared, 'loaded', loaded);
            merge(targetShared, 'loading', loading);
            merge(targetShared, 'get', get);
          };
          scopes.forEach((sc) => {
            if (!this.shareScopeMap[sc]) {
              this.shareScopeMap[sc] = {};
            }
            if (!this.shareScopeMap[sc][pkgName]) {
              this.shareScopeMap[sc][pkgName] = {};
            }
            if (!this.shareScopeMap[sc][pkgName][version]) {
              this.shareScopeMap[sc][pkgName][version] = {
                version,
                scope: [sc],
                ...shareInfo,
                lib,
              };
            }
            const registeredShared = this.shareScopeMap[sc][pkgName][version];
            mergeAttrs(registeredShared);
            if (from && registeredShared.from !== from) {
              registeredShared.from = from;
            }
          });
        }
        _setGlobalShareScopeMap(hostOptions) {
          const globalShareScopeMap = getGlobalShareScope();
          const identifier = hostOptions.id || hostOptions.name;
          if (identifier && !globalShareScopeMap[identifier]) {
            globalShareScopeMap[identifier] = this.shareScopeMap;
          }
        }
      }

      class RemoteHandler {
        constructor(host) {
          this.hooks = new PluginSystem({
            beforeRegisterRemote: new SyncWaterfallHook('beforeRegisterRemote'),
            registerRemote: new SyncWaterfallHook('registerRemote'),
            beforeRequest: new AsyncWaterfallHook('beforeRequest'),
            onLoad: new AsyncHook('onLoad'),
            handlePreloadModule: new SyncHook('handlePreloadModule'),
            errorLoadRemote: new AsyncHook('errorLoadRemote'),
            beforePreloadRemote: new AsyncHook('beforePreloadRemote'),
            generatePreloadAssets: new AsyncHook('generatePreloadAssets'),
            // not used yet
            afterPreloadRemote: new AsyncHook(),
            // TODO: Move to loaderHook
            loadEntry: new AsyncHook(),
          });
          this.host = host;
          this.idToRemoteMap = {};
        }
        formatAndRegisterRemote(globalOptions, userOptions) {
          const userRemotes = userOptions.remotes || [];
          return userRemotes.reduce((res, remote) => {
            this.registerRemote(remote, res, { force: false });
            return res;
          }, globalOptions.remotes);
        }
        setIdToRemoteMap(id, remoteMatchInfo) {
          const { remote, expose } = remoteMatchInfo;
          const { name, alias } = remote;
          this.idToRemoteMap[id] = { name: remote.name, expose };
          if (alias && id.startsWith(name)) {
            const idWithAlias = id.replace(name, alias);
            this.idToRemoteMap[idWithAlias] = { name: remote.name, expose };
            return;
          }
          if (alias && id.startsWith(alias)) {
            const idWithName = id.replace(alias, name);
            this.idToRemoteMap[idWithName] = { name: remote.name, expose };
          }
        }
        // eslint-disable-next-line max-lines-per-function
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async loadRemote(id, options) {
          const { host } = this;
          try {
            const { loadFactory = true } = options || {
              loadFactory: true,
            };
            // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
            // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
            // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
            // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
            // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
            // id: alias(app1) + expose(button) = app1/button
            // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
            const { module, moduleOptions, remoteMatchInfo } =
              await this.getRemoteModuleAndOptions({
                id,
              });
            const {
              pkgNameOrAlias,
              remote,
              expose,
              id: idRes,
              remoteSnapshot,
            } = remoteMatchInfo;
            const moduleOrFactory = await module.get(
              idRes,
              expose,
              options,
              remoteSnapshot,
            );
            const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
              id: idRes,
              pkgNameOrAlias,
              expose,
              exposeModule: loadFactory ? moduleOrFactory : undefined,
              exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
              remote,
              options: moduleOptions,
              moduleInstance: module,
              origin: host,
            });
            this.setIdToRemoteMap(id, remoteMatchInfo);
            if (typeof moduleWrapper === 'function') {
              return moduleWrapper;
            }
            return moduleOrFactory;
          } catch (error) {
            const { from = 'runtime' } = options || { from: 'runtime' };
            const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
              id,
              error,
              from,
              lifecycle: 'onLoad',
              origin: host,
            });
            if (!failOver) {
              throw error;
            }
            return failOver;
          }
        }
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async preloadRemote(preloadOptions) {
          const { host } = this;
          await this.hooks.lifecycle.beforePreloadRemote.emit({
            preloadOps: preloadOptions,
            options: host.options,
            origin: host,
          });
          const preloadOps = formatPreloadArgs(
            host.options.remotes,
            preloadOptions,
          );
          await Promise.all(
            preloadOps.map(async (ops) => {
              const { remote } = ops;
              const remoteInfo = getRemoteInfo(remote);
              const { globalSnapshot, remoteSnapshot } =
                await host.snapshotHandler.loadRemoteSnapshotInfo({
                  moduleInfo: remote,
                });
              const assets =
                await this.hooks.lifecycle.generatePreloadAssets.emit({
                  origin: host,
                  preloadOptions: ops,
                  remote,
                  remoteInfo,
                  globalSnapshot,
                  remoteSnapshot,
                });
              if (!assets) {
                return;
              }
              preloadAssets(remoteInfo, host, assets);
            }),
          );
        }
        registerRemotes(remotes, options) {
          const { host } = this;
          remotes.forEach((remote) => {
            this.registerRemote(remote, host.options.remotes, {
              force: options?.force,
            });
          });
        }
        async getRemoteModuleAndOptions(options) {
          const { host } = this;
          const { id } = options;
          let loadRemoteArgs;
          try {
            loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
              id,
              options: host.options,
              origin: host,
            });
          } catch (error) {
            loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
              id,
              options: host.options,
              origin: host,
              from: 'runtime',
              error,
              lifecycle: 'beforeRequest',
            });
            if (!loadRemoteArgs) {
              throw error;
            }
          }
          const { id: idRes } = loadRemoteArgs;
          const remoteSplitInfo = matchRemoteWithNameAndExpose(
            host.options.remotes,
            idRes,
          );
          assert(
            remoteSplitInfo,
            errorCodes.getShortErrorMsg(
              errorCodes.RUNTIME_004,
              errorCodes.runtimeDescMap,
              {
                hostName: host.options.name,
                requestId: idRes,
              },
            ),
          );
          const { remote: rawRemote } = remoteSplitInfo;
          const remoteInfo = getRemoteInfo(rawRemote);
          const matchInfo =
            await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
              id: idRes,
              ...remoteSplitInfo,
              options: host.options,
              origin: host,
              remoteInfo,
            });
          const { remote, expose } = matchInfo;
          assert(
            remote && expose,
            `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
          );
          let module = host.moduleCache.get(remote.name);
          const moduleOptions = {
            host: host,
            remoteInfo,
          };
          if (!module) {
            module = new Module(moduleOptions);
            host.moduleCache.set(remote.name, module);
          }
          return {
            module,
            moduleOptions,
            remoteMatchInfo: matchInfo,
          };
        }
        registerRemote(remote, targetRemotes, options) {
          const { host } = this;
          const normalizeRemote = () => {
            if (remote.alias) {
              // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
              // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
              const findEqual = targetRemotes.find(
                (item) =>
                  remote.alias &&
                  (item.name.startsWith(remote.alias) ||
                    item.alias?.startsWith(remote.alias)),
              );
              assert(
                !findEqual,
                `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`,
              );
            }
            // Set the remote entry to a complete path
            if ('entry' in remote) {
              if (sdk.isBrowserEnv() && !remote.entry.startsWith('http')) {
                remote.entry = new URL(
                  remote.entry,
                  window.location.origin,
                ).href;
              }
            }
            if (!remote.shareScope) {
              remote.shareScope = DEFAULT_SCOPE;
            }
            if (!remote.type) {
              remote.type = DEFAULT_REMOTE_TYPE;
            }
          };
          this.hooks.lifecycle.beforeRegisterRemote.emit({
            remote,
            origin: host,
          });
          const registeredRemote = targetRemotes.find(
            (item) => item.name === remote.name,
          );
          if (!registeredRemote) {
            normalizeRemote();
            targetRemotes.push(remote);
            this.hooks.lifecycle.registerRemote.emit({ remote, origin: host });
          } else {
            const messages = [
              `The remote "${remote.name}" is already registered.`,
              'Please note that overriding it may cause unexpected errors.',
            ];
            if (options?.force) {
              // remove registered remote
              this.removeRemote(registeredRemote);
              normalizeRemote();
              targetRemotes.push(remote);
              this.hooks.lifecycle.registerRemote.emit({
                remote,
                origin: host,
              });
              sdk.warn(messages.join(' '));
            }
          }
        }
        removeRemote(remote) {
          try {
            const { host } = this;
            const { name } = remote;
            const remoteIndex = host.options.remotes.findIndex(
              (item) => item.name === name,
            );
            if (remoteIndex !== -1) {
              host.options.remotes.splice(remoteIndex, 1);
            }
            const loadedModule = host.moduleCache.get(remote.name);
            if (loadedModule) {
              const remoteInfo = loadedModule.remoteInfo;
              const key = remoteInfo.entryGlobalName;
              if (CurrentGlobal[key]) {
                if (
                  Object.getOwnPropertyDescriptor(CurrentGlobal, key)
                    ?.configurable
                ) {
                  delete CurrentGlobal[key];
                } else {
                  // @ts-ignore
                  CurrentGlobal[key] = undefined;
                }
              }
              const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
                loadedModule.remoteInfo,
              );
              if (globalLoading[remoteEntryUniqueKey]) {
                delete globalLoading[remoteEntryUniqueKey];
              }
              host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
              // delete unloaded shared and instance
              let remoteInsId = remoteInfo.buildVersion
                ? sdk.composeKeyWithSeparator(
                    remoteInfo.name,
                    remoteInfo.buildVersion,
                  )
                : remoteInfo.name;
              const remoteInsIndex =
                CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins) => {
                  if (remoteInfo.buildVersion) {
                    return ins.options.id === remoteInsId;
                  } else {
                    return ins.name === remoteInsId;
                  }
                });
              if (remoteInsIndex !== -1) {
                const remoteIns =
                  CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
                remoteInsId = remoteIns.options.id || remoteInsId;
                const globalShareScopeMap = getGlobalShareScope();
                let isAllSharedNotUsed = true;
                const needDeleteKeys = [];
                Object.keys(globalShareScopeMap).forEach((instId) => {
                  const shareScopeMap = globalShareScopeMap[instId];
                  shareScopeMap &&
                    Object.keys(shareScopeMap).forEach((shareScope) => {
                      const shareScopeVal = shareScopeMap[shareScope];
                      shareScopeVal &&
                        Object.keys(shareScopeVal).forEach((shareName) => {
                          const sharedPkgs = shareScopeVal[shareName];
                          sharedPkgs &&
                            Object.keys(sharedPkgs).forEach((shareVersion) => {
                              const shared = sharedPkgs[shareVersion];
                              if (
                                shared &&
                                typeof shared === 'object' &&
                                shared.from === remoteInfo.name
                              ) {
                                if (shared.loaded || shared.loading) {
                                  shared.useIn = shared.useIn.filter(
                                    (usedHostName) =>
                                      usedHostName !== remoteInfo.name,
                                  );
                                  if (shared.useIn.length) {
                                    isAllSharedNotUsed = false;
                                  } else {
                                    needDeleteKeys.push([
                                      instId,
                                      shareScope,
                                      shareName,
                                      shareVersion,
                                    ]);
                                  }
                                } else {
                                  needDeleteKeys.push([
                                    instId,
                                    shareScope,
                                    shareName,
                                    shareVersion,
                                  ]);
                                }
                              }
                            });
                        });
                    });
                });
                if (isAllSharedNotUsed) {
                  remoteIns.shareScopeMap = {};
                  delete globalShareScopeMap[remoteInsId];
                }
                needDeleteKeys.forEach(
                  ([insId, shareScope, shareName, shareVersion]) => {
                    delete globalShareScopeMap[insId]?.[shareScope]?.[
                      shareName
                    ]?.[shareVersion];
                  },
                );
                CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(
                  remoteInsIndex,
                  1,
                );
              }
              const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
              if (hostGlobalSnapshot) {
                const remoteKey =
                  hostGlobalSnapshot &&
                  'remotesInfo' in hostGlobalSnapshot &&
                  hostGlobalSnapshot.remotesInfo &&
                  getInfoWithoutType(
                    hostGlobalSnapshot.remotesInfo,
                    remote.name,
                  ).key;
                if (remoteKey) {
                  delete hostGlobalSnapshot.remotesInfo[remoteKey];
                  if (
                    //eslint-disable-next-line no-extra-boolean-cast
                    Boolean(
                      Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey],
                    )
                  ) {
                    delete Global.__FEDERATION__.__MANIFEST_LOADING__[
                      remoteKey
                    ];
                  }
                }
              }
              host.moduleCache.delete(remote.name);
            }
          } catch (err) {
            logger.log('removeRemote fail: ', err);
          }
        }
      }

      const USE_SNAPSHOT = true ? !false : 0; // Default to true (use snapshot) when not explicitly defined
      class ModuleFederation {
        constructor(userOptions) {
          this.hooks = new PluginSystem({
            beforeInit: new SyncWaterfallHook('beforeInit'),
            init: new SyncHook(),
            // maybe will change, temporarily for internal use only
            beforeInitContainer: new AsyncWaterfallHook('beforeInitContainer'),
            // maybe will change, temporarily for internal use only
            initContainer: new AsyncWaterfallHook('initContainer'),
          });
          this.version = '0.24.1';
          this.moduleCache = new Map();
          this.loaderHook = new PluginSystem({
            // FIXME: may not be suitable , not open to the public yet
            getModuleInfo: new SyncHook(),
            createScript: new SyncHook(),
            createLink: new SyncHook(),
            fetch: new AsyncHook(),
            loadEntryError: new AsyncHook(),
            getModuleFactory: new AsyncHook(),
          });
          this.bridgeHook = new PluginSystem({
            beforeBridgeRender: new SyncHook(),
            afterBridgeRender: new SyncHook(),
            beforeBridgeDestroy: new SyncHook(),
            afterBridgeDestroy: new SyncHook(),
          });
          const plugins = USE_SNAPSHOT
            ? [snapshotPlugin(), generatePreloadAssetsPlugin()]
            : [];
          // TODO: Validate the details of the options
          // Initialize options with default values
          const defaultOptions = {
            id: getBuilderId(),
            name: userOptions.name,
            plugins,
            remotes: [],
            shared: {},
            inBrowser: sdk.isBrowserEnv(),
          };
          this.name = userOptions.name;
          this.options = defaultOptions;
          this.snapshotHandler = new SnapshotHandler(this);
          this.sharedHandler = new SharedHandler(this);
          this.remoteHandler = new RemoteHandler(this);
          this.shareScopeMap = this.sharedHandler.shareScopeMap;
          this.registerPlugins([
            ...defaultOptions.plugins,
            ...(userOptions.plugins || []),
          ]);
          this.options = this.formatOptions(defaultOptions, userOptions);
        }
        initOptions(userOptions) {
          this.registerPlugins(userOptions.plugins);
          const options = this.formatOptions(this.options, userOptions);
          this.options = options;
          return options;
        }
        async loadShare(pkgName, extraOptions) {
          return this.sharedHandler.loadShare(pkgName, extraOptions);
        }
        // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
        // 1. If the loaded shared already exists globally, then it will be reused
        // 2. If lib exists in local shared, it will be used directly
        // 3. If the local get returns something other than Promise, then it will be used directly
        loadShareSync(pkgName, extraOptions) {
          return this.sharedHandler.loadShareSync(pkgName, extraOptions);
        }
        initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
          return this.sharedHandler.initializeSharing(
            shareScopeName,
            extraOptions,
          );
        }
        initRawContainer(name, url, container) {
          const remoteInfo = getRemoteInfo({ name, entry: url });
          const module = new Module({ host: this, remoteInfo });
          module.remoteEntryExports = container;
          this.moduleCache.set(name, module);
          return module;
        }
        // eslint-disable-next-line max-lines-per-function
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async loadRemote(id, options) {
          return this.remoteHandler.loadRemote(id, options);
        }
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async preloadRemote(preloadOptions) {
          return this.remoteHandler.preloadRemote(preloadOptions);
        }
        initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
          this.sharedHandler.initShareScopeMap(
            scopeName,
            shareScope,
            extraOptions,
          );
        }
        formatOptions(globalOptions, userOptions) {
          const { allShareInfos: shared } = formatShareConfigs(
            globalOptions,
            userOptions,
          );
          const { userOptions: userOptionsRes, options: globalOptionsRes } =
            this.hooks.lifecycle.beforeInit.emit({
              origin: this,
              userOptions,
              options: globalOptions,
              shareInfo: shared,
            });
          const remotes = this.remoteHandler.formatAndRegisterRemote(
            globalOptionsRes,
            userOptionsRes,
          );
          const { allShareInfos } = this.sharedHandler.registerShared(
            globalOptionsRes,
            userOptionsRes,
          );
          const plugins = [...globalOptionsRes.plugins];
          if (userOptionsRes.plugins) {
            userOptionsRes.plugins.forEach((plugin) => {
              if (!plugins.includes(plugin)) {
                plugins.push(plugin);
              }
            });
          }
          const optionsRes = {
            ...globalOptions,
            ...userOptions,
            plugins,
            remotes,
            shared: allShareInfos,
          };
          this.hooks.lifecycle.init.emit({
            origin: this,
            options: optionsRes,
          });
          return optionsRes;
        }
        registerPlugins(plugins) {
          const pluginRes = registerPlugins(plugins, this);
          // Merge plugin
          this.options.plugins = this.options.plugins.reduce((res, plugin) => {
            if (!plugin) return res;
            if (res && !res.find((item) => item.name === plugin.name)) {
              res.push(plugin);
            }
            return res;
          }, pluginRes || []);
        }
        registerRemotes(remotes, options) {
          return this.remoteHandler.registerRemotes(remotes, options);
        }
        registerShared(shared) {
          this.sharedHandler.registerShared(this.options, {
            ...this.options,
            shared,
          });
        }
      }

      var index = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      exports.loadScript = sdk.loadScript;
      exports.loadScriptNode = sdk.loadScriptNode;
      exports.CurrentGlobal = CurrentGlobal;
      exports.Global = Global;
      exports.Module = Module;
      exports.ModuleFederation = ModuleFederation;
      exports.addGlobalSnapshot = addGlobalSnapshot;
      exports.assert = assert;
      exports.getGlobalFederationConstructor = getGlobalFederationConstructor;
      exports.getGlobalSnapshot = getGlobalSnapshot;
      exports.getInfoWithoutType = getInfoWithoutType;
      exports.getRegisteredShare = getRegisteredShare;
      exports.getRemoteEntry = getRemoteEntry;
      exports.getRemoteInfo = getRemoteInfo;
      exports.helpers = helpers;
      exports.isStaticResourcesEqual = isStaticResourcesEqual;
      exports.matchRemoteWithNameAndExpose = matchRemoteWithNameAndExpose;
      exports.registerGlobalPlugins = registerGlobalPlugins;
      exports.resetFederationGlobalInfo = resetFederationGlobalInfo;
      exports.safeWrapper = safeWrapper;
      exports.satisfy = satisfy;
      exports.setGlobalFederationConstructor = setGlobalFederationConstructor;
      exports.setGlobalFederationInstance = setGlobalFederationInstance;
      exports.types = index;
      //# sourceMappingURL=index.cjs.cjs.map

      /***/
    },

    /***/ '../../../packages/runtime/dist/helpers.cjs.cjs': /***/ (
      module,
      __unused_webpack_exports,
      __webpack_require__,
    ) => {
      var runtimeCore = __webpack_require__(
        '../../../packages/runtime-core/dist/index.cjs.cjs',
      );
      var utils = __webpack_require__(
        '../../../packages/runtime/dist/utils.cjs.cjs',
      );

      var helpers = {
        ...runtimeCore.helpers,
        global: {
          ...runtimeCore.helpers.global,
          getGlobalFederationInstance: utils.getGlobalFederationInstance,
        },
      };

      module.exports = helpers;
      //# sourceMappingURL=helpers.cjs.cjs.map

      /***/
    },

    /***/ '../../../packages/runtime/dist/utils.cjs.cjs': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      var runtimeCore = __webpack_require__(
        '../../../packages/runtime-core/dist/index.cjs.cjs',
      );

      // injected by bundler, so it can not use runtime-core stuff
      function getBuilderId() {
        //@ts-ignore
        return true
          ? //@ts-ignore
            'app2:0.0.0'
          : 0;
      }
      function getGlobalFederationInstance(name, version) {
        const buildId = getBuilderId();
        return runtimeCore.CurrentGlobal.__FEDERATION__.__INSTANCES__.find(
          (GMInstance) => {
            if (buildId && GMInstance.options.id === buildId) {
              return true;
            }
            if (
              GMInstance.options.name === name &&
              !GMInstance.options.version &&
              !version
            ) {
              return true;
            }
            if (
              GMInstance.options.name === name &&
              version &&
              GMInstance.options.version === version
            ) {
              return true;
            }
            return false;
          },
        );
      }

      exports.getGlobalFederationInstance = getGlobalFederationInstance;
      //# sourceMappingURL=utils.cjs.cjs.map

      /***/
    },

    /***/ '../../../packages/sdk/dist/index.cjs.cjs': /***/ (
      __unused_webpack_module,
      exports,
    ) => {
      const FederationModuleManifest = 'federation-manifest.json';
      const MANIFEST_EXT = '.json';
      const BROWSER_LOG_KEY = 'FEDERATION_DEBUG';
      const NameTransformSymbol = {
        AT: '@',
        HYPHEN: '-',
        SLASH: '/',
      };
      const NameTransformMap = {
        [NameTransformSymbol.AT]: 'scope_',
        [NameTransformSymbol.HYPHEN]: '_',
        [NameTransformSymbol.SLASH]: '__',
      };
      const EncodedNameTransformMap = {
        [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
        [NameTransformMap[NameTransformSymbol.HYPHEN]]:
          NameTransformSymbol.HYPHEN,
        [NameTransformMap[NameTransformSymbol.SLASH]]:
          NameTransformSymbol.SLASH,
      };
      const SEPARATOR = ':';
      const ManifestFileName = 'mf-manifest.json';
      const StatsFileName = 'mf-stats.json';
      const MFModuleType = {
        NPM: 'npm',
        APP: 'app',
      };
      const MODULE_DEVTOOL_IDENTIFIER = '__MF_DEVTOOLS_MODULE_INFO__';
      const ENCODE_NAME_PREFIX = 'ENCODE_NAME_PREFIX';
      const TEMP_DIR = '.federation';
      const MFPrefetchCommon = {
        identifier: 'MFDataPrefetch',
        globalKey: '__PREFETCH__',
        library: 'mf-data-prefetch',
        exportsKey: '__PREFETCH_EXPORTS__',
        fileName: 'bootstrap.js',
      };

      var ContainerPlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var ContainerReferencePlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var ModuleFederationPlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var SharePlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      function isBrowserEnv() {
        return (
          typeof window !== 'undefined' &&
          typeof window.document !== 'undefined'
        );
      }
      function isReactNativeEnv() {
        return (
          typeof navigator !== 'undefined' &&
          navigator?.product === 'ReactNative'
        );
      }
      function isBrowserDebug() {
        try {
          if (isBrowserEnv() && window.localStorage) {
            return Boolean(localStorage.getItem(BROWSER_LOG_KEY));
          }
        } catch (error) {
          return false;
        }
        return false;
      }
      function isDebugMode() {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env['FEDERATION_DEBUG']
        ) {
          return Boolean(process.env['FEDERATION_DEBUG']);
        }
        if (
          typeof FEDERATION_DEBUG !== 'undefined' &&
          Boolean(FEDERATION_DEBUG)
        ) {
          return true;
        }
        return isBrowserDebug();
      }
      const getProcessEnv = function () {
        return typeof process !== 'undefined' && process.env ? process.env : {};
      };

      const LOG_CATEGORY = '[ Federation Runtime ]';
      // entry: name:version   version : 1.0.0 | ^1.2.3
      // entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
      const parseEntry = (str, devVerOrUrl, separator = SEPARATOR) => {
        const strSplit = str.split(separator);
        const devVersionOrUrl =
          getProcessEnv()['NODE_ENV'] === 'development' && devVerOrUrl;
        const defaultVersion = '*';
        const isEntry = (s) => s.startsWith('http') || s.includes(MANIFEST_EXT);
        // Check if the string starts with a type
        if (strSplit.length >= 2) {
          let [name, ...versionOrEntryArr] = strSplit;
          // @name@manifest-url.json
          if (str.startsWith(separator)) {
            name = strSplit.slice(0, 2).join(separator);
            versionOrEntryArr = [
              devVersionOrUrl || strSplit.slice(2).join(separator),
            ];
          }
          let versionOrEntry =
            devVersionOrUrl || versionOrEntryArr.join(separator);
          if (isEntry(versionOrEntry)) {
            return {
              name,
              entry: versionOrEntry,
            };
          } else {
            // Apply version rule
            // devVersionOrUrl => inputVersion => defaultVersion
            return {
              name,
              version: versionOrEntry || defaultVersion,
            };
          }
        } else if (strSplit.length === 1) {
          const [name] = strSplit;
          if (devVersionOrUrl && isEntry(devVersionOrUrl)) {
            return {
              name,
              entry: devVersionOrUrl,
            };
          }
          return {
            name,
            version: devVersionOrUrl || defaultVersion,
          };
        } else {
          throw `Invalid entry value: ${str}`;
        }
      };
      const composeKeyWithSeparator = function (...args) {
        if (!args.length) {
          return '';
        }
        return args.reduce((sum, cur) => {
          if (!cur) {
            return sum;
          }
          if (!sum) {
            return cur;
          }
          return `${sum}${SEPARATOR}${cur}`;
        }, '');
      };
      const encodeName = function (name, prefix = '', withExt = false) {
        try {
          const ext = withExt ? '.js' : '';
          return `${prefix}${name
            .replace(
              new RegExp(`${NameTransformSymbol.AT}`, 'g'),
              NameTransformMap[NameTransformSymbol.AT],
            )
            .replace(
              new RegExp(`${NameTransformSymbol.HYPHEN}`, 'g'),
              NameTransformMap[NameTransformSymbol.HYPHEN],
            )
            .replace(
              new RegExp(`${NameTransformSymbol.SLASH}`, 'g'),
              NameTransformMap[NameTransformSymbol.SLASH],
            )}${ext}`;
        } catch (err) {
          throw err;
        }
      };
      const decodeName = function (name, prefix, withExt) {
        try {
          let decodedName = name;
          if (prefix) {
            if (!decodedName.startsWith(prefix)) {
              return decodedName;
            }
            decodedName = decodedName.replace(new RegExp(prefix, 'g'), '');
          }
          decodedName = decodedName
            .replace(
              new RegExp(`${NameTransformMap[NameTransformSymbol.AT]}`, 'g'),
              EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]],
            )
            .replace(
              new RegExp(`${NameTransformMap[NameTransformSymbol.SLASH]}`, 'g'),
              EncodedNameTransformMap[
                NameTransformMap[NameTransformSymbol.SLASH]
              ],
            )
            .replace(
              new RegExp(
                `${NameTransformMap[NameTransformSymbol.HYPHEN]}`,
                'g',
              ),
              EncodedNameTransformMap[
                NameTransformMap[NameTransformSymbol.HYPHEN]
              ],
            );
          if (withExt) {
            decodedName = decodedName.replace('.js', '');
          }
          return decodedName;
        } catch (err) {
          throw err;
        }
      };
      const generateExposeFilename = (exposeName, withExt) => {
        if (!exposeName) {
          return '';
        }
        let expose = exposeName;
        if (expose === '.') {
          expose = 'default_export';
        }
        if (expose.startsWith('./')) {
          expose = expose.replace('./', '');
        }
        return encodeName(expose, '__federation_expose_', withExt);
      };
      const generateShareFilename = (pkgName, withExt) => {
        if (!pkgName) {
          return '';
        }
        return encodeName(pkgName, '__federation_shared_', withExt);
      };
      const getResourceUrl = (module, sourceUrl) => {
        if ('getPublicPath' in module) {
          let publicPath;
          if (!module.getPublicPath.startsWith('function')) {
            publicPath = new Function(module.getPublicPath)();
          } else {
            publicPath = new Function('return ' + module.getPublicPath)()();
          }
          return `${publicPath}${sourceUrl}`;
        } else if ('publicPath' in module) {
          if (
            !isBrowserEnv() &&
            !isReactNativeEnv() &&
            typeof module.ssrPublicPath === 'string' &&
            module.ssrPublicPath.length > 0
          ) {
            return `${module.ssrPublicPath}${sourceUrl}`;
          }
          return `${module.publicPath}${sourceUrl}`;
        } else {
          console.warn(
            'Cannot get resource URL. If in debug mode, please ignore.',
            module,
            sourceUrl,
          );
          return '';
        }
      };
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      const assert = (condition, msg) => {
        if (!condition) {
          error(msg);
        }
      };
      const error = (msg) => {
        throw new Error(`${LOG_CATEGORY}: ${msg}`);
      };
      const warn = (msg) => {
        console.warn(`${LOG_CATEGORY}: ${msg}`);
      };
      function safeToString(info) {
        try {
          return JSON.stringify(info, null, 2);
        } catch (e) {
          return '';
        }
      }
      // RegExp for version string
      const VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
      function isRequiredVersion(str) {
        return VERSION_PATTERN_REGEXP.test(str);
      }

      const simpleJoinRemoteEntry = (rPath, rName) => {
        if (!rPath) {
          return rName;
        }
        const transformPath = (str) => {
          if (str === '.') {
            return '';
          }
          if (str.startsWith('./')) {
            return str.replace('./', '');
          }
          if (str.startsWith('/')) {
            const strWithoutSlash = str.slice(1);
            if (strWithoutSlash.endsWith('/')) {
              return strWithoutSlash.slice(0, -1);
            }
            return strWithoutSlash;
          }
          return str;
        };
        const transformedPath = transformPath(rPath);
        if (!transformedPath) {
          return rName;
        }
        if (transformedPath.endsWith('/')) {
          return `${transformedPath}${rName}`;
        }
        return `${transformedPath}/${rName}`;
      };
      function inferAutoPublicPath(url) {
        return url
          .replace(/#.*$/, '')
          .replace(/\?.*$/, '')
          .replace(/\/[^\/]+$/, '/');
      }
      // Priority: overrides > remotes
      // eslint-disable-next-line max-lines-per-function
      function generateSnapshotFromManifest(manifest, options = {}) {
        const { remotes = {}, overrides = {}, version } = options;
        let remoteSnapshot;
        const getPublicPath = () => {
          if ('publicPath' in manifest.metaData) {
            if (manifest.metaData.publicPath === 'auto' && version) {
              // use same implementation as publicPath auto runtime module implements
              return inferAutoPublicPath(version);
            }
            return manifest.metaData.publicPath;
          } else {
            return manifest.metaData.getPublicPath;
          }
        };
        const overridesKeys = Object.keys(overrides);
        let remotesInfo = {};
        // If remotes are not provided, only the remotes in the manifest will be read
        if (!Object.keys(remotes).length) {
          remotesInfo =
            manifest.remotes?.reduce((res, next) => {
              let matchedVersion;
              const name = next.federationContainerName;
              // overrides have higher priority
              if (overridesKeys.includes(name)) {
                matchedVersion = overrides[name];
              } else {
                if ('version' in next) {
                  matchedVersion = next.version;
                } else {
                  matchedVersion = next.entry;
                }
              }
              res[name] = {
                matchedVersion,
              };
              return res;
            }, {}) || {};
        }
        // If remotes (deploy scenario) are specified, they need to be traversed again
        Object.keys(remotes).forEach(
          (key) =>
            (remotesInfo[key] = {
              // overrides will override dependencies
              matchedVersion: overridesKeys.includes(key)
                ? overrides[key]
                : remotes[key],
            }),
        );
        const {
          remoteEntry: {
            path: remoteEntryPath,
            name: remoteEntryName,
            type: remoteEntryType,
          },
          types: remoteTypes = { path: '', name: '', zip: '', api: '' },
          buildInfo: { buildVersion },
          globalName,
          ssrRemoteEntry,
        } = manifest.metaData;
        const { exposes } = manifest;
        let basicRemoteSnapshot = {
          version: version ? version : '',
          buildVersion,
          globalName,
          remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
          remoteEntryType,
          remoteTypes: simpleJoinRemoteEntry(
            remoteTypes.path,
            remoteTypes.name,
          ),
          remoteTypesZip: remoteTypes.zip || '',
          remoteTypesAPI: remoteTypes.api || '',
          remotesInfo,
          shared: manifest?.shared.map((item) => ({
            assets: item.assets,
            sharedName: item.name,
            version: item.version,
            // @ts-ignore
            usedExports: item.referenceExports || [],
          })),
          modules: exposes?.map((expose) => ({
            moduleName: expose.name,
            modulePath: expose.path,
            assets: expose.assets,
          })),
        };
        if (manifest.metaData?.prefetchInterface) {
          const prefetchInterface = manifest.metaData.prefetchInterface;
          basicRemoteSnapshot = {
            ...basicRemoteSnapshot,
            prefetchInterface,
          };
        }
        if (manifest.metaData?.prefetchEntry) {
          const { path, name, type } = manifest.metaData.prefetchEntry;
          basicRemoteSnapshot = {
            ...basicRemoteSnapshot,
            prefetchEntry: simpleJoinRemoteEntry(path, name),
            prefetchEntryType: type,
          };
        }
        if ('publicPath' in manifest.metaData) {
          remoteSnapshot = {
            ...basicRemoteSnapshot,
            publicPath: getPublicPath(),
            ssrPublicPath: manifest.metaData.ssrPublicPath,
          };
        } else {
          remoteSnapshot = {
            ...basicRemoteSnapshot,
            getPublicPath: getPublicPath(),
          };
        }
        if (ssrRemoteEntry) {
          const fullSSRRemoteEntry = simpleJoinRemoteEntry(
            ssrRemoteEntry.path,
            ssrRemoteEntry.name,
          );
          remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
          remoteSnapshot.ssrRemoteEntryType =
            ssrRemoteEntry.type || 'commonjs-module';
        }
        return remoteSnapshot;
      }
      function isManifestProvider(moduleInfo) {
        if (
          'remoteEntry' in moduleInfo &&
          moduleInfo.remoteEntry.includes(MANIFEST_EXT)
        ) {
          return true;
        } else {
          return false;
        }
      }
      function getManifestFileName(manifestOptions) {
        if (!manifestOptions) {
          return {
            statsFileName: StatsFileName,
            manifestFileName: ManifestFileName,
          };
        }
        let filePath =
          typeof manifestOptions === 'boolean'
            ? ''
            : manifestOptions.filePath || '';
        let fileName =
          typeof manifestOptions === 'boolean'
            ? ''
            : manifestOptions.fileName || '';
        const JSON_EXT = '.json';
        const addExt = (name) => {
          if (name.endsWith(JSON_EXT)) {
            return name;
          }
          return `${name}${JSON_EXT}`;
        };
        const insertSuffix = (name, suffix) => {
          return name.replace(JSON_EXT, `${suffix}${JSON_EXT}`);
        };
        const manifestFileName = fileName ? addExt(fileName) : ManifestFileName;
        const statsFileName = fileName
          ? insertSuffix(manifestFileName, '-stats')
          : StatsFileName;
        return {
          statsFileName: simpleJoinRemoteEntry(filePath, statsFileName),
          manifestFileName: simpleJoinRemoteEntry(filePath, manifestFileName),
        };
      }

      const PREFIX = '[ Module Federation ]';
      const DEFAULT_DELEGATE = console;
      const LOGGER_STACK_SKIP_TOKENS = [
        'logger.ts',
        'logger.js',
        'captureStackTrace',
        'Logger.emit',
        'Logger.log',
        'Logger.info',
        'Logger.warn',
        'Logger.error',
        'Logger.debug',
      ];
      function captureStackTrace() {
        try {
          const stack = new Error().stack;
          if (!stack) {
            return undefined;
          }
          const [, ...rawLines] = stack.split('\n');
          const filtered = rawLines.filter(
            (line) =>
              !LOGGER_STACK_SKIP_TOKENS.some((token) => line.includes(token)),
          );
          if (!filtered.length) {
            return undefined;
          }
          const stackPreview = filtered.slice(0, 5).join('\n');
          return `Stack trace:\n${stackPreview}`;
        } catch {
          return undefined;
        }
      }
      class Logger {
        constructor(prefix, delegate = DEFAULT_DELEGATE) {
          this.prefix = prefix;
          this.delegate = delegate ?? DEFAULT_DELEGATE;
        }
        setPrefix(prefix) {
          this.prefix = prefix;
        }
        setDelegate(delegate) {
          this.delegate = delegate ?? DEFAULT_DELEGATE;
        }
        emit(method, args) {
          const delegate = this.delegate;
          const debugMode = isDebugMode();
          const stackTrace = debugMode ? captureStackTrace() : undefined;
          const enrichedArgs = stackTrace ? [...args, stackTrace] : args;
          const order = (() => {
            switch (method) {
              case 'log':
                return ['log', 'info'];
              case 'info':
                return ['info', 'log'];
              case 'warn':
                return ['warn', 'info', 'log'];
              case 'error':
                return ['error', 'warn', 'log'];
              case 'debug':
              default:
                return ['debug', 'log'];
            }
          })();
          for (const candidate of order) {
            const handler = delegate[candidate];
            if (typeof handler === 'function') {
              handler.call(delegate, this.prefix, ...enrichedArgs);
              return;
            }
          }
          for (const candidate of order) {
            const handler = DEFAULT_DELEGATE[candidate];
            if (typeof handler === 'function') {
              handler.call(DEFAULT_DELEGATE, this.prefix, ...enrichedArgs);
              return;
            }
          }
        }
        log(...args) {
          this.emit('log', args);
        }
        warn(...args) {
          this.emit('warn', args);
        }
        error(...args) {
          this.emit('error', args);
        }
        success(...args) {
          this.emit('info', args);
        }
        info(...args) {
          this.emit('info', args);
        }
        ready(...args) {
          this.emit('info', args);
        }
        debug(...args) {
          if (isDebugMode()) {
            this.emit('debug', args);
          }
        }
      }
      function createLogger(prefix) {
        return new Logger(prefix);
      }
      function createInfrastructureLogger(prefix) {
        const infrastructureLogger = new Logger(prefix);
        Object.defineProperty(
          infrastructureLogger,
          '__mf_infrastructure_logger__',
          {
            value: true,
            enumerable: false,
            configurable: false,
          },
        );
        return infrastructureLogger;
      }
      function bindLoggerToCompiler(loggerInstance, compiler, name) {
        if (!loggerInstance.__mf_infrastructure_logger__) {
          return;
        }
        if (!compiler?.getInfrastructureLogger) {
          return;
        }
        try {
          const infrastructureLogger = compiler.getInfrastructureLogger(name);
          if (
            infrastructureLogger &&
            typeof infrastructureLogger === 'object' &&
            (typeof infrastructureLogger.log === 'function' ||
              typeof infrastructureLogger.info === 'function' ||
              typeof infrastructureLogger.warn === 'function' ||
              typeof infrastructureLogger.error === 'function')
          ) {
            loggerInstance.setDelegate(infrastructureLogger);
          }
        } catch {
          // If the bundler throws (older versions), fall back to default console logger.
          loggerInstance.setDelegate(undefined);
        }
      }
      const logger = createLogger(PREFIX);
      const infrastructureLogger = createInfrastructureLogger(PREFIX);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async function safeWrapper(callback, disableWarn) {
        try {
          const res = await callback();
          return res;
        } catch (e) {
          !disableWarn && warn(e);
          return;
        }
      }
      function isStaticResourcesEqual(url1, url2) {
        const REG_EXP = /^(https?:)?\/\//i;
        // Transform url1 and url2 into relative paths
        const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
        const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
        // Check if the relative paths are identical
        return relativeUrl1 === relativeUrl2;
      }
      function createScript(info) {
        // Retrieve the existing script element by its src attribute
        let script = null;
        let needAttach = true;
        let timeout = 20000;
        let timeoutId;
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = scripts[i];
          const scriptSrc = s.getAttribute('src');
          if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
            script = s;
            needAttach = false;
            break;
          }
        }
        if (!script) {
          const attrs = info.attrs;
          script = document.createElement('script');
          script.type =
            attrs?.['type'] === 'module' ? 'module' : 'text/javascript';
          let createScriptRes = undefined;
          if (info.createScriptHook) {
            createScriptRes = info.createScriptHook(info.url, info.attrs);
            if (createScriptRes instanceof HTMLScriptElement) {
              script = createScriptRes;
            } else if (typeof createScriptRes === 'object') {
              if ('script' in createScriptRes && createScriptRes.script) {
                script = createScriptRes.script;
              }
              if ('timeout' in createScriptRes && createScriptRes.timeout) {
                timeout = createScriptRes.timeout;
              }
            }
          }
          if (!script.src) {
            script.src = info.url;
          }
          if (attrs && !createScriptRes) {
            Object.keys(attrs).forEach((name) => {
              if (script) {
                if (name === 'async' || name === 'defer') {
                  script[name] = attrs[name];
                  // Attributes that do not exist are considered overridden
                } else if (!script.getAttribute(name)) {
                  script.setAttribute(name, attrs[name]);
                }
              }
            });
          }
        }
        const onScriptComplete = async (
          prev,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event,
        ) => {
          clearTimeout(timeoutId);
          const onScriptCompleteCallback = () => {
            if (event?.type === 'error') {
              info?.onErrorCallback && info?.onErrorCallback(event);
            } else {
              info?.cb && info?.cb();
            }
          };
          // Prevent memory leaks in IE.
          if (script) {
            script.onerror = null;
            script.onload = null;
            safeWrapper(() => {
              const { needDeleteScript = true } = info;
              if (needDeleteScript) {
                script?.parentNode && script.parentNode.removeChild(script);
              }
            });
            if (prev && typeof prev === 'function') {
              const result = prev(event);
              if (result instanceof Promise) {
                const res = await result;
                onScriptCompleteCallback();
                return res;
              }
              onScriptCompleteCallback();
              return result;
            }
          }
          onScriptCompleteCallback();
        };
        script.onerror = onScriptComplete.bind(null, script.onerror);
        script.onload = onScriptComplete.bind(null, script.onload);
        timeoutId = setTimeout(() => {
          onScriptComplete(
            null,
            new Error(`Remote script "${info.url}" time-outed.`),
          );
        }, timeout);
        return { script, needAttach };
      }
      function createLink(info) {
        // <link rel="preload" href="script.js" as="script">
        // Retrieve the existing script element by its src attribute
        let link = null;
        let needAttach = true;
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
          const l = links[i];
          const linkHref = l.getAttribute('href');
          const linkRel = l.getAttribute('rel');
          if (
            linkHref &&
            isStaticResourcesEqual(linkHref, info.url) &&
            linkRel === info.attrs['rel']
          ) {
            link = l;
            needAttach = false;
            break;
          }
        }
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('href', info.url);
          let createLinkRes = undefined;
          const attrs = info.attrs;
          if (info.createLinkHook) {
            createLinkRes = info.createLinkHook(info.url, attrs);
            if (createLinkRes instanceof HTMLLinkElement) {
              link = createLinkRes;
            }
          }
          if (attrs && !createLinkRes) {
            Object.keys(attrs).forEach((name) => {
              if (link && !link.getAttribute(name)) {
                link.setAttribute(name, attrs[name]);
              }
            });
          }
        }
        const onLinkComplete = (
          prev,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event,
        ) => {
          const onLinkCompleteCallback = () => {
            if (event?.type === 'error') {
              info?.onErrorCallback && info?.onErrorCallback(event);
            } else {
              info?.cb && info?.cb();
            }
          };
          // Prevent memory leaks in IE.
          if (link) {
            link.onerror = null;
            link.onload = null;
            safeWrapper(() => {
              const { needDeleteLink = true } = info;
              if (needDeleteLink) {
                link?.parentNode && link.parentNode.removeChild(link);
              }
            });
            if (prev) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const res = prev(event);
              onLinkCompleteCallback();
              return res;
            }
          }
          onLinkCompleteCallback();
        };
        link.onerror = onLinkComplete.bind(null, link.onerror);
        link.onload = onLinkComplete.bind(null, link.onload);
        return { link, needAttach };
      }
      function loadScript(url, info) {
        const { attrs = {}, createScriptHook } = info;
        return new Promise((resolve, reject) => {
          const { script, needAttach } = createScript({
            url,
            cb: resolve,
            onErrorCallback: reject,
            attrs: {
              fetchpriority: 'high',
              ...attrs,
            },
            createScriptHook,
            needDeleteScript: true,
          });
          needAttach && document.head.appendChild(script);
        });
      }

      const sdkImportCache = new Map();
      function importNodeModule(name) {
        if (!name) {
          throw new Error('import specifier is required');
        }
        // Check cache to prevent infinite recursion
        if (sdkImportCache.has(name)) {
          return sdkImportCache.get(name);
        }
        const importModule = new Function('name', `return import(name)`);
        const promise = importModule(name)
          .then((res) => res)
          .catch((error) => {
            console.error(`Error importing module ${name}:`, error);
            // Remove from cache on error so it can be retried
            sdkImportCache.delete(name);
            throw error;
          });
        // Cache the promise to prevent recursive calls
        sdkImportCache.set(name, promise);
        return promise;
      }
      const loadNodeFetch = async () => {
        const fetchModule = await importNodeModule('node-fetch');
        return fetchModule.default || fetchModule;
      };
      const lazyLoaderHookFetch = async (input, init, loaderHook) => {
        const hook = (url, init) => {
          return loaderHook.lifecycle.fetch.emit(url, init);
        };
        const res = await hook(input, init || {});
        if (!res || !(res instanceof Response)) {
          const fetchFunction =
            typeof fetch === 'undefined' ? await loadNodeFetch() : fetch;
          return fetchFunction(input, init || {});
        }
        return res;
      };
      const createScriptNode =
        typeof ENV_TARGET === 'undefined' || ENV_TARGET !== 'web'
          ? (url, cb, attrs, loaderHook) => {
              if (loaderHook?.createScriptHook) {
                const hookResult = loaderHook.createScriptHook(url);
                if (
                  hookResult &&
                  typeof hookResult === 'object' &&
                  'url' in hookResult
                ) {
                  url = hookResult.url;
                }
              }
              let urlObj;
              try {
                urlObj = new URL(url);
              } catch (e) {
                console.error('Error constructing URL:', e);
                cb(new Error(`Invalid URL: ${e}`));
                return;
              }
              const getFetch = async () => {
                if (loaderHook?.fetch) {
                  return (input, init) =>
                    lazyLoaderHookFetch(input, init, loaderHook);
                }
                return typeof fetch === 'undefined' ? loadNodeFetch() : fetch;
              };
              const handleScriptFetch = async (f, urlObj) => {
                try {
                  const res = await f(urlObj.href);
                  const data = await res.text();
                  const [path, vm] = await Promise.all([
                    importNodeModule('path'),
                    importNodeModule('vm'),
                  ]);
                  const scriptContext = {
                    exports: {},
                    module: { exports: {} },
                  };
                  const urlDirname = urlObj.pathname
                    .split('/')
                    .slice(0, -1)
                    .join('/');
                  const filename = path.basename(urlObj.pathname);
                  const script = new vm.Script(
                    `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
                    {
                      filename,
                      importModuleDynamically:
                        //@ts-ignore
                        vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
                        importNodeModule,
                    },
                  );
                  script.runInThisContext()(
                    scriptContext.exports,
                    scriptContext.module,
                    eval('require'),
                    urlDirname,
                    filename,
                  );
                  const exportedInterface =
                    scriptContext.module.exports || scriptContext.exports;
                  if (attrs && exportedInterface && attrs['globalName']) {
                    const container =
                      exportedInterface[attrs['globalName']] ||
                      exportedInterface;
                    cb(undefined, container);
                    return;
                  }
                  cb(undefined, exportedInterface);
                } catch (e) {
                  cb(
                    e instanceof Error
                      ? e
                      : new Error(`Script execution error: ${e}`),
                  );
                }
              };
              getFetch()
                .then(async (f) => {
                  if (
                    attrs?.['type'] === 'esm' ||
                    attrs?.['type'] === 'module'
                  ) {
                    return loadModule(urlObj.href, {
                      fetch: f,
                      vm: await importNodeModule('vm'),
                    })
                      .then(async (module) => {
                        await module.evaluate();
                        cb(undefined, module.namespace);
                      })
                      .catch((e) => {
                        cb(
                          e instanceof Error
                            ? e
                            : new Error(`Script execution error: ${e}`),
                        );
                      });
                  }
                  handleScriptFetch(f, urlObj);
                })
                .catch((err) => {
                  cb(err);
                });
            }
          : (url, cb, attrs, loaderHook) => {
              cb(
                new Error(
                  'createScriptNode is disabled in non-Node.js environment',
                ),
              );
            };
      const loadScriptNode =
        typeof ENV_TARGET === 'undefined' || ENV_TARGET !== 'web'
          ? (url, info) => {
              return new Promise((resolve, reject) => {
                createScriptNode(
                  url,
                  (error, scriptContext) => {
                    if (error) {
                      reject(error);
                    } else {
                      const remoteEntryKey =
                        info?.attrs?.['globalName'] ||
                        `__FEDERATION_${info?.attrs?.['name']}:custom__`;
                      const entryExports = (globalThis[remoteEntryKey] =
                        scriptContext);
                      resolve(entryExports);
                    }
                  },
                  info.attrs,
                  info.loaderHook,
                );
              });
            }
          : (url, info) => {
              throw new Error(
                'loadScriptNode is disabled in non-Node.js environment',
              );
            };
      const esmModuleCache = new Map();
      async function loadModule(url, options) {
        // Check cache to prevent infinite recursion in ESM loading
        if (esmModuleCache.has(url)) {
          return esmModuleCache.get(url);
        }
        const { fetch, vm } = options;
        const response = await fetch(url);
        const code = await response.text();
        const module = new vm.SourceTextModule(code, {
          // @ts-ignore
          importModuleDynamically: async (specifier, script) => {
            const resolvedUrl = new URL(specifier, url).href;
            return loadModule(resolvedUrl, options);
          },
        });
        // Cache the module before linking to prevent cycles
        esmModuleCache.set(url, module);
        await module.link(async (specifier) => {
          const resolvedUrl = new URL(specifier, url).href;
          const module = await loadModule(resolvedUrl, options);
          return module;
        });
        return module;
      }

      function normalizeOptions(enableDefault, defaultOptions, key) {
        return function (options) {
          if (options === false) {
            return false;
          }
          if (typeof options === 'undefined') {
            if (enableDefault) {
              return defaultOptions;
            } else {
              return false;
            }
          }
          if (options === true) {
            return defaultOptions;
          }
          if (options && typeof options === 'object') {
            return {
              ...defaultOptions,
              ...options,
            };
          }
          throw new Error(
            `Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`,
          );
        };
      }

      const createModuleFederationConfig = (options) => {
        return options;
      };

      exports.BROWSER_LOG_KEY = BROWSER_LOG_KEY;
      exports.ENCODE_NAME_PREFIX = ENCODE_NAME_PREFIX;
      exports.EncodedNameTransformMap = EncodedNameTransformMap;
      exports.FederationModuleManifest = FederationModuleManifest;
      exports.MANIFEST_EXT = MANIFEST_EXT;
      exports.MFModuleType = MFModuleType;
      exports.MFPrefetchCommon = MFPrefetchCommon;
      exports.MODULE_DEVTOOL_IDENTIFIER = MODULE_DEVTOOL_IDENTIFIER;
      exports.ManifestFileName = ManifestFileName;
      exports.NameTransformMap = NameTransformMap;
      exports.NameTransformSymbol = NameTransformSymbol;
      exports.SEPARATOR = SEPARATOR;
      exports.StatsFileName = StatsFileName;
      exports.TEMP_DIR = TEMP_DIR;
      exports.assert = assert;
      exports.bindLoggerToCompiler = bindLoggerToCompiler;
      exports.composeKeyWithSeparator = composeKeyWithSeparator;
      exports.containerPlugin = ContainerPlugin;
      exports.containerReferencePlugin = ContainerReferencePlugin;
      exports.createInfrastructureLogger = createInfrastructureLogger;
      exports.createLink = createLink;
      exports.createLogger = createLogger;
      exports.createModuleFederationConfig = createModuleFederationConfig;
      exports.createScript = createScript;
      exports.createScriptNode = createScriptNode;
      exports.decodeName = decodeName;
      exports.encodeName = encodeName;
      exports.error = error;
      exports.generateExposeFilename = generateExposeFilename;
      exports.generateShareFilename = generateShareFilename;
      exports.generateSnapshotFromManifest = generateSnapshotFromManifest;
      exports.getManifestFileName = getManifestFileName;
      exports.getProcessEnv = getProcessEnv;
      exports.getResourceUrl = getResourceUrl;
      exports.inferAutoPublicPath = inferAutoPublicPath;
      exports.infrastructureLogger = infrastructureLogger;
      exports.isBrowserEnv = isBrowserEnv;
      exports.isDebugMode = isDebugMode;
      exports.isManifestProvider = isManifestProvider;
      exports.isReactNativeEnv = isReactNativeEnv;
      exports.isRequiredVersion = isRequiredVersion;
      exports.isStaticResourcesEqual = isStaticResourcesEqual;
      exports.loadScript = loadScript;
      exports.loadScriptNode = loadScriptNode;
      exports.logger = logger;
      exports.moduleFederationPlugin = ModuleFederationPlugin;
      exports.normalizeOptions = normalizeOptions;
      exports.parseEntry = parseEntry;
      exports.safeToString = safeToString;
      exports.safeWrapper = safeWrapper;
      exports.sharePlugin = SharePlugin;
      exports.simpleJoinRemoteEntry = simpleJoinRemoteEntry;
      exports.warn = warn;
      //# sourceMappingURL=index.cjs.cjs.map

      /***/
    },

    /***/ '../../../packages/runtime/dist/index.esm.js': /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Module: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Module,
        /* harmony export */ ModuleFederation: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ModuleFederation,
        /* harmony export */ createInstance: () => /* binding */ createInstance,
        /* harmony export */ getInstance: () => /* binding */ getInstance,
        /* harmony export */ getRemoteEntry: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteEntry,
        /* harmony export */ getRemoteInfo: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteInfo,
        /* harmony export */ init: () => /* binding */ init,
        /* harmony export */ loadRemote: () => /* binding */ loadRemote,
        /* harmony export */ loadScript: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScript,
        /* harmony export */ loadScriptNode: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScriptNode,
        /* harmony export */ loadShare: () => /* binding */ loadShare,
        /* harmony export */ loadShareSync: () => /* binding */ loadShareSync,
        /* harmony export */ preloadRemote: () => /* binding */ preloadRemote,
        /* harmony export */ registerGlobalPlugins: () =>
          /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.registerGlobalPlugins,
        /* harmony export */ registerPlugins: () =>
          /* binding */ registerPlugins,
        /* harmony export */ registerRemotes: () =>
          /* binding */ registerRemotes,
        /* harmony export */ registerShared: () => /* binding */ registerShared,
        /* harmony export */
      });
      /* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '../../../packages/runtime-core/dist/index.cjs.cjs',
        );
      /* harmony import */ var _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__('../../../packages/error-codes/dist/index.cjs.js');
      /* harmony import */ var _utils_esm_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('../../../packages/runtime/dist/utils.esm.js');

      function createInstance(options) {
        // Retrieve debug constructor
        const ModuleFederationConstructor =
          (0,
          _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getGlobalFederationConstructor)() ||
          _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ModuleFederation;
        const instance = new ModuleFederationConstructor(options);
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setGlobalFederationInstance)(
          instance,
        );
        return instance;
      }
      let FederationInstance = null;
      /**
       * @deprecated Use createInstance or getInstance instead
       */
      function init(options) {
        // Retrieve the same instance with the same name
        const instance = (0, _utils_esm_js__WEBPACK_IMPORTED_MODULE_1__.g)(
          options.name,
          options.version,
        );
        if (!instance) {
          FederationInstance = createInstance(options);
          return FederationInstance;
        } else {
          // Merge options
          instance.initOptions(options);
          if (!FederationInstance) {
            FederationInstance = instance;
          }
          return instance;
        }
      }
      function loadRemote(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        const loadRemote = FederationInstance.loadRemote;
        // eslint-disable-next-line prefer-spread
        return loadRemote.apply(FederationInstance, args);
      }
      function loadShare(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        // eslint-disable-next-line prefer-spread
        const loadShare = FederationInstance.loadShare;
        return loadShare.apply(FederationInstance, args);
      }
      function loadShareSync(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        const loadShareSync = FederationInstance.loadShareSync;
        // eslint-disable-next-line prefer-spread
        return loadShareSync.apply(FederationInstance, args);
      }
      function preloadRemote(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        // eslint-disable-next-line prefer-spread
        return FederationInstance.preloadRemote.apply(FederationInstance, args);
      }
      function registerRemotes(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        // eslint-disable-next-line prefer-spread
        return FederationInstance.registerRemotes.apply(
          FederationInstance,
          args,
        );
      }
      function registerPlugins(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        // eslint-disable-next-line prefer-spread
        return FederationInstance.registerPlugins.apply(
          FederationInstance,
          args,
        );
      }
      function getInstance() {
        return FederationInstance;
      }
      function registerShared(...args) {
        (0,
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(
          FederationInstance,
          (0,
          _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_009,
            _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap,
          ),
        );
        // eslint-disable-next-line prefer-spread
        return FederationInstance.registerShared.apply(
          FederationInstance,
          args,
        );
      }
      // Inject for debug
      (0,
      _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setGlobalFederationConstructor)(
        _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ModuleFederation,
      );

      /***/
    },

    /***/ '../../../packages/runtime/dist/utils.esm.js': /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ g: () => /* binding */ getGlobalFederationInstance,
        /* harmony export */
      });
      /* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '../../../packages/runtime-core/dist/index.cjs.cjs',
        );

      // injected by bundler, so it can not use runtime-core stuff
      function getBuilderId() {
        //@ts-ignore
        return true
          ? //@ts-ignore
            'app2:0.0.0'
          : 0;
      }
      function getGlobalFederationInstance(name, version) {
        const buildId = getBuilderId();
        return _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.CurrentGlobal.__FEDERATION__.__INSTANCES__.find(
          (GMInstance) => {
            if (buildId && GMInstance.options.id === buildId) {
              return true;
            }
            if (
              GMInstance.options.name === name &&
              !GMInstance.options.version &&
              !version
            ) {
              return true;
            }
            if (
              GMInstance.options.name === name &&
              version &&
              GMInstance.options.version === version
            ) {
              return true;
            }
            return false;
          },
        );
      }

      /***/
    },

    /***/ '../../../packages/webpack-bundler-runtime/dist/constant.esm.js':
      /***/ (
        __unused_webpack___webpack_module__,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ FEDERATION_SUPPORTED_TYPES: () =>
            /* binding */ FEDERATION_SUPPORTED_TYPES,
          /* harmony export */
        });
        const FEDERATION_SUPPORTED_TYPES = ['script'];

        /***/
      },

    /***/ '../../../packages/webpack-bundler-runtime/dist/index.esm.js': /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ federation,
        /* harmony export */
      });
      /* harmony import */ var _module_federation_runtime__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__('../../../packages/runtime/dist/index.esm.js');
      /* harmony import */ var _constant_esm_js__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(
          '../../../packages/webpack-bundler-runtime/dist/constant.esm.js',
        );
      /* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__('../../../packages/sdk/dist/index.cjs.cjs');
      /* harmony import */ var _module_federation_runtime_helpers__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('../../../packages/runtime/dist/helpers.cjs.cjs');

      function attachShareScopeMap(webpackRequire) {
        if (
          !webpackRequire.S ||
          webpackRequire.federation.hasAttachShareScopeMap ||
          !webpackRequire.federation.instance ||
          !webpackRequire.federation.instance.shareScopeMap
        ) {
          return;
        }
        webpackRequire.S = webpackRequire.federation.instance.shareScopeMap;
        webpackRequire.federation.hasAttachShareScopeMap = true;
      }
      function updateConsumeOptions(options) {
        const { webpackRequire, moduleToHandlerMapping } = options;
        const { consumesLoadingData, initializeSharingData } = webpackRequire;
        const { sharedFallback, bundlerRuntime, libraryType } =
          webpackRequire.federation;
        if (consumesLoadingData && !consumesLoadingData._updated) {
          const {
            moduleIdToConsumeDataMapping:
              updatedModuleIdToConsumeDataMapping = {},
            initialConsumes: updatedInitialConsumes = [],
            chunkMapping: updatedChunkMapping = {},
          } = consumesLoadingData;
          Object.entries(updatedModuleIdToConsumeDataMapping).forEach(
            ([id, data]) => {
              if (!moduleToHandlerMapping[id]) {
                moduleToHandlerMapping[id] = {
                  // @ts-ignore
                  getter: sharedFallback
                    ? bundlerRuntime?.getSharedFallbackGetter({
                        shareKey: data.shareKey,
                        factory: data.fallback,
                        webpackRequire,
                        libraryType,
                      })
                    : data.fallback,
                  treeShakingGetter: sharedFallback ? data.fallback : undefined,
                  shareInfo: {
                    shareConfig: {
                      requiredVersion: data.requiredVersion,
                      strictVersion: data.strictVersion,
                      singleton: data.singleton,
                      eager: data.eager,
                      layer: data.layer,
                    },
                    scope: Array.isArray(data.shareScope)
                      ? data.shareScope
                      : [data.shareScope || 'default'],
                    treeShaking: sharedFallback
                      ? {
                          get: data.fallback,
                          mode: data.treeShakingMode,
                        }
                      : undefined,
                  },
                  shareKey: data.shareKey,
                };
              }
            },
          );
          if ('initialConsumes' in options) {
            const { initialConsumes = [] } = options;
            updatedInitialConsumes.forEach((id) => {
              if (!initialConsumes.includes(id)) {
                initialConsumes.push(id);
              }
            });
          }
          if ('chunkMapping' in options) {
            const { chunkMapping = {} } = options;
            Object.entries(updatedChunkMapping).forEach(
              ([id, chunkModules]) => {
                if (!chunkMapping[id]) {
                  chunkMapping[id] = [];
                }
                chunkModules.forEach((moduleId) => {
                  if (!chunkMapping[id].includes(moduleId)) {
                    chunkMapping[id].push(moduleId);
                  }
                });
              },
            );
          }
          consumesLoadingData._updated = 1;
        }
        if (initializeSharingData && !initializeSharingData._updated) {
          const { federation } = webpackRequire;
          if (
            !federation.instance ||
            !initializeSharingData.scopeToSharingDataMapping
          ) {
            return;
          }
          const shared = {};
          for (let [scope, stages] of Object.entries(
            initializeSharingData.scopeToSharingDataMapping,
          )) {
            for (let stage of stages) {
              if (typeof stage === 'object' && stage !== null) {
                const {
                  name,
                  version,
                  factory,
                  eager,
                  singleton,
                  requiredVersion,
                  strictVersion,
                } = stage;
                const shareConfig = {
                  requiredVersion: `^${version}`,
                };
                const isValidValue = function (val) {
                  return typeof val !== 'undefined';
                };
                if (isValidValue(singleton)) {
                  shareConfig.singleton = singleton;
                }
                if (isValidValue(requiredVersion)) {
                  shareConfig.requiredVersion = requiredVersion;
                }
                if (isValidValue(eager)) {
                  shareConfig.eager = eager;
                }
                if (isValidValue(strictVersion)) {
                  shareConfig.strictVersion = strictVersion;
                }
                const options = {
                  version,
                  scope: [scope],
                  shareConfig,
                  get: factory,
                };
                if (shared[name]) {
                  shared[name].push(options);
                } else {
                  shared[name] = [options];
                }
              }
            }
          }
          federation.instance.registerShared(shared);
          initializeSharingData._updated = 1;
        }
      }
      function updateRemoteOptions(options) {
        const {
          webpackRequire,
          idToExternalAndNameMapping = {},
          idToRemoteMap = {},
          chunkMapping = {},
        } = options;
        const { remotesLoadingData } = webpackRequire;
        const remoteInfos =
          webpackRequire.federation?.bundlerRuntimeOptions?.remotes
            ?.remoteInfos;
        if (
          !remotesLoadingData ||
          remotesLoadingData._updated ||
          !remoteInfos
        ) {
          return;
        }
        const {
          chunkMapping: updatedChunkMapping,
          moduleIdToRemoteDataMapping,
        } = remotesLoadingData;
        if (!updatedChunkMapping || !moduleIdToRemoteDataMapping) {
          return;
        }
        for (let [moduleId, data] of Object.entries(
          moduleIdToRemoteDataMapping,
        )) {
          if (!idToExternalAndNameMapping[moduleId]) {
            idToExternalAndNameMapping[moduleId] = [
              data.shareScope,
              data.name,
              data.externalModuleId,
            ];
          }
          if (!idToRemoteMap[moduleId] && remoteInfos[data.remoteName]) {
            const items = remoteInfos[data.remoteName];
            idToRemoteMap[moduleId] ||= [];
            items.forEach((item) => {
              if (!idToRemoteMap[moduleId].includes(item)) {
                idToRemoteMap[moduleId].push(item);
              }
            });
          }
        }
        if (chunkMapping) {
          Object.entries(updatedChunkMapping).forEach(([id, chunkModules]) => {
            if (!chunkMapping[id]) {
              chunkMapping[id] = [];
            }
            chunkModules.forEach((moduleId) => {
              if (!chunkMapping[id].includes(moduleId)) {
                chunkMapping[id].push(moduleId);
              }
            });
          });
        }
        remotesLoadingData._updated = 1;
      }
      function remotes(options) {
        updateRemoteOptions(options);
        const {
          chunkId,
          promises,
          webpackRequire,
          chunkMapping,
          idToExternalAndNameMapping,
          idToRemoteMap,
        } = options;
        attachShareScopeMap(webpackRequire);
        if (webpackRequire.o(chunkMapping, chunkId)) {
          chunkMapping[chunkId].forEach((id) => {
            let getScope = webpackRequire.R;
            if (!getScope) {
              getScope = [];
            }
            const data = idToExternalAndNameMapping[id];
            const remoteInfos = idToRemoteMap[id] || [];
            // @ts-ignore seems not work
            if (getScope.indexOf(data) >= 0) {
              return;
            }
            // @ts-ignore seems not work
            getScope.push(data);
            if (data.p) {
              return promises.push(data.p);
            }
            const onError = (error) => {
              if (!error) {
                error = new Error('Container missing');
              }
              if (typeof error.message === 'string') {
                error.message += `\nwhile loading "${data[1]}" from ${data[2]}`;
              }
              webpackRequire.m[id] = () => {
                throw error;
              };
              data.p = 0;
            };
            const handleFunction = (fn, arg1, arg2, d, next, first) => {
              try {
                const promise = fn(arg1, arg2);
                if (promise && promise.then) {
                  const p = promise.then((result) => next(result, d), onError);
                  if (first) {
                    promises.push((data.p = p));
                  } else {
                    return p;
                  }
                } else {
                  return next(promise, d, first);
                }
              } catch (error) {
                onError(error);
              }
            };
            const onExternal = (external, _, first) =>
              external
                ? handleFunction(
                    webpackRequire.I,
                    data[0],
                    0,
                    external,
                    onInitialized,
                    first,
                  )
                : onError();
            // eslint-disable-next-line no-var
            var onInitialized = (_, external, first) =>
              handleFunction(
                external.get,
                data[1],
                getScope,
                0,
                onFactory,
                first,
              );
            // eslint-disable-next-line no-var
            var onFactory = (factory) => {
              data.p = 1;
              webpackRequire.m[id] = (module) => {
                module.exports = factory();
              };
            };
            const onRemoteLoaded = () => {
              try {
                const remoteName = (0,
                _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.decodeName)(
                  remoteInfos[0].name,
                  _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.ENCODE_NAME_PREFIX,
                );
                const remoteModuleName = remoteName + data[1].slice(1);
                const instance = webpackRequire.federation.instance;
                const loadRemote = () =>
                  webpackRequire.federation.instance.loadRemote(
                    remoteModuleName,
                    {
                      loadFactory: false,
                      from: 'build',
                    },
                  );
                if (instance.options.shareStrategy === 'version-first') {
                  return Promise.all(
                    instance.sharedHandler.initializeSharing(data[0]),
                  ).then(() => {
                    return loadRemote();
                  });
                }
                return loadRemote();
              } catch (error) {
                onError(error);
              }
            };
            const useRuntimeLoad =
              remoteInfos.length === 1 &&
              _constant_esm_js__WEBPACK_IMPORTED_MODULE_3__.FEDERATION_SUPPORTED_TYPES.includes(
                remoteInfos[0].externalType,
              ) &&
              remoteInfos[0].name;
            if (useRuntimeLoad) {
              handleFunction(onRemoteLoaded, data[2], 0, 0, onFactory, 1);
            } else {
              handleFunction(webpackRequire, data[2], 0, 0, onExternal, 1);
            }
          });
        }
      }
      function getUsedExports(webpackRequire, sharedName) {
        const usedExports = webpackRequire.federation.usedExports;
        if (!usedExports) {
          return;
        }
        return usedExports[sharedName];
      }
      function consumes(options) {
        updateConsumeOptions(options);
        const {
          chunkId,
          promises,
          installedModules,
          webpackRequire,
          chunkMapping,
          moduleToHandlerMapping,
        } = options;
        attachShareScopeMap(webpackRequire);
        if (webpackRequire.o(chunkMapping, chunkId)) {
          chunkMapping[chunkId].forEach((id) => {
            if (webpackRequire.o(installedModules, id)) {
              return promises.push(installedModules[id]);
            }
            const onFactory = (factory) => {
              installedModules[id] = 0;
              webpackRequire.m[id] = (module) => {
                delete webpackRequire.c[id];
                const result = factory();
                // Add layer property from shareConfig if available
                const { shareInfo } = moduleToHandlerMapping[id];
                if (
                  shareInfo?.shareConfig?.layer &&
                  result &&
                  typeof result === 'object'
                ) {
                  try {
                    // Only set layer if it's not already defined or if it's undefined
                    if (
                      !result.hasOwnProperty('layer') ||
                      result.layer === undefined
                    ) {
                      result.layer = shareInfo.shareConfig.layer;
                    }
                  } catch (e) {
                    // Ignore if layer property is read-only
                  }
                }
                module.exports = result;
              };
            };
            const onError = (error) => {
              delete installedModules[id];
              webpackRequire.m[id] = (module) => {
                delete webpackRequire.c[id];
                throw error;
              };
            };
            try {
              const federationInstance = webpackRequire.federation.instance;
              if (!federationInstance) {
                throw new Error('Federation instance not found!');
              }
              const { shareKey, getter, shareInfo, treeShakingGetter } =
                moduleToHandlerMapping[id];
              const usedExports = getUsedExports(webpackRequire, shareKey);
              const customShareInfo = {
                ...shareInfo,
              };
              if (usedExports) {
                customShareInfo.treeShaking = {
                  usedExports,
                  useIn: [federationInstance.options.name],
                };
              }
              const promise = federationInstance
                .loadShare(shareKey, {
                  customShareInfo,
                })
                .then((factory) => {
                  if (factory === false) {
                    return treeShakingGetter?.() || getter();
                  }
                  return factory;
                });
              if (promise.then) {
                promises.push(
                  (installedModules[id] = promise
                    .then(onFactory)
                    .catch(onError)),
                );
              } else {
                // @ts-ignore maintain previous logic
                onFactory(promise);
              }
            } catch (e) {
              onError(e);
            }
          });
        }
      }
      function initializeSharing({
        shareScopeName,
        webpackRequire,
        initPromises,
        initTokens,
        initScope,
      }) {
        const shareScopeKeys = Array.isArray(shareScopeName)
          ? shareScopeName
          : [shareScopeName];
        var initializeSharingPromises = [];
        var _initializeSharing = function (shareScopeKey) {
          if (!initScope) initScope = [];
          const mfInstance = webpackRequire.federation.instance;
          // handling circular init calls
          var initToken = initTokens[shareScopeKey];
          if (!initToken)
            initToken = initTokens[shareScopeKey] = {
              from: mfInstance.name,
            };
          if (initScope.indexOf(initToken) >= 0) return;
          initScope.push(initToken);
          const promise = initPromises[shareScopeKey];
          if (promise) return promise;
          var warn = (msg) =>
            typeof console !== 'undefined' && console.warn && console.warn(msg);
          var initExternal = (id) => {
            var handleError = (err) =>
              warn('Initialization of sharing external failed: ' + err);
            try {
              var module = webpackRequire(id);
              if (!module) return;
              var initFn = (module) =>
                module &&
                module.init &&
                // @ts-ignore compat legacy mf shared behavior
                module.init(webpackRequire.S[shareScopeKey], initScope, {
                  shareScopeMap: webpackRequire.S || {},
                  shareScopeKeys: shareScopeName,
                });
              if (module.then)
                return promises.push(module.then(initFn, handleError));
              var initResult = initFn(module);
              // @ts-ignore
              if (
                initResult &&
                typeof initResult !== 'boolean' &&
                initResult.then
              )
                // @ts-ignore
                return promises.push(initResult['catch'](handleError));
            } catch (err) {
              handleError(err);
            }
          };
          const promises = mfInstance.initializeSharing(shareScopeKey, {
            strategy: mfInstance.options.shareStrategy,
            initScope,
            from: 'build',
          });
          attachShareScopeMap(webpackRequire);
          const bundlerRuntimeRemotesOptions =
            webpackRequire.federation.bundlerRuntimeOptions.remotes;
          if (bundlerRuntimeRemotesOptions) {
            Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach(
              (moduleId) => {
                const info =
                  bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
                const externalModuleId =
                  bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[
                    moduleId
                  ][2];
                if (info.length > 1) {
                  initExternal(externalModuleId);
                } else if (info.length === 1) {
                  const remoteInfo = info[0];
                  if (
                    !_constant_esm_js__WEBPACK_IMPORTED_MODULE_3__.FEDERATION_SUPPORTED_TYPES.includes(
                      remoteInfo.externalType,
                    )
                  ) {
                    initExternal(externalModuleId);
                  }
                }
              },
            );
          }
          if (!promises.length) {
            return (initPromises[shareScopeKey] = true);
          }
          return (initPromises[shareScopeKey] = Promise.all(promises).then(
            () => (initPromises[shareScopeKey] = true),
          ));
        };
        shareScopeKeys.forEach((key) => {
          initializeSharingPromises.push(_initializeSharing(key));
        });
        return Promise.all(initializeSharingPromises).then(() => true);
      }
      function handleInitialConsumes(options) {
        const { moduleId, moduleToHandlerMapping, webpackRequire, asyncLoad } =
          options;
        const federationInstance = webpackRequire.federation.instance;
        if (!federationInstance) {
          throw new Error('Federation instance not found!');
        }
        const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];
        try {
          const usedExports = getUsedExports(webpackRequire, shareKey);
          const customShareInfo = {
            ...shareInfo,
          };
          if (usedExports) {
            customShareInfo.treeShaking = {
              usedExports,
              useIn: [federationInstance.options.name],
            };
          }
          if (asyncLoad) {
            return federationInstance.loadShare(shareKey, {
              customShareInfo,
            });
          }
          return federationInstance.loadShareSync(shareKey, {
            customShareInfo,
          });
        } catch (err) {
          console.error(
            'loadShareSync failed! The function should not be called unless you set "eager:true". If you do not set it, and encounter this issue, you can check whether an async boundary is implemented.',
          );
          console.error('The original error message is as follows: ');
          throw err;
        }
      }
      function installInitialConsumes(options) {
        updateConsumeOptions(options);
        const {
          moduleToHandlerMapping,
          webpackRequire,
          installedModules,
          initialConsumes,
          asyncLoad,
        } = options;
        const factoryIdSets = [];
        initialConsumes.forEach((id) => {
          const factoryGetter = () =>
            handleInitialConsumes({
              moduleId: id,
              moduleToHandlerMapping,
              webpackRequire,
              asyncLoad,
            });
          factoryIdSets.push([id, factoryGetter]);
        });
        const setModule = (id, factoryGetter) => {
          webpackRequire.m[id] = (module) => {
            // Handle scenario when module is used synchronously
            installedModules[id] = 0;
            delete webpackRequire.c[id];
            const factory = factoryGetter();
            if (typeof factory !== 'function') {
              throw new Error(
                `Shared module is not available for eager consumption: ${id}`,
              );
            }
            const result = factory();
            // Add layer property from shareConfig if available
            const { shareInfo } = moduleToHandlerMapping[id];
            if (
              shareInfo?.shareConfig?.layer &&
              result &&
              typeof result === 'object'
            ) {
              try {
                // Only set layer if it's not already defined or if it's undefined
                if (
                  !result.hasOwnProperty('layer') ||
                  result.layer === undefined
                ) {
                  result.layer = shareInfo.shareConfig.layer;
                }
              } catch (e) {
                // Ignore if layer property is read-only
              }
            }
            module.exports = result;
          };
        };
        if (asyncLoad) {
          return Promise.all(
            factoryIdSets.map(async ([id, factoryGetter]) => {
              const result = await factoryGetter();
              setModule(id, () => result);
            }),
          );
        }
        factoryIdSets.forEach(([id, factoryGetter]) => {
          setModule(id, factoryGetter);
        });
      }
      function initContainerEntry(options) {
        const {
          webpackRequire,
          shareScope,
          initScope,
          shareScopeKey,
          remoteEntryInitOptions,
        } = options;
        if (!webpackRequire.S) return;
        if (
          !webpackRequire.federation ||
          !webpackRequire.federation.instance ||
          !webpackRequire.federation.initOptions
        )
          return;
        const federationInstance = webpackRequire.federation.instance;
        federationInstance.initOptions({
          name: webpackRequire.federation.initOptions.name,
          remotes: [],
          ...remoteEntryInitOptions,
        });
        const hostShareScopeKeys = remoteEntryInitOptions?.shareScopeKeys;
        const hostShareScopeMap = remoteEntryInitOptions?.shareScopeMap;
        // host: 'default' remote: 'default'  remote['default'] = hostShareScopeMap['default']
        // host: ['default', 'scope1'] remote: 'default'  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scop1']
        // host: 'default' remote: ['default','scope1']  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1'] = {}
        // host: ['scope1','default'] remote: ['scope1','scope2'] => remote['scope1'] = hostShareScopeMap['scope1']; remote['scope2'] = hostShareScopeMap['scope2'] = {};
        if (!shareScopeKey || typeof shareScopeKey === 'string') {
          const key = shareScopeKey || 'default';
          if (Array.isArray(hostShareScopeKeys)) {
            // const sc = hostShareScopeMap![key];
            // if (!sc) {
            //   throw new Error('shareScopeKey is not exist in hostShareScopeMap');
            // }
            // federationInstance.initShareScopeMap(key, sc, {
            //   hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
            // });
            hostShareScopeKeys.forEach((hostKey) => {
              if (!hostShareScopeMap[hostKey]) {
                hostShareScopeMap[hostKey] = {};
              }
              const sc = hostShareScopeMap[hostKey];
              federationInstance.initShareScopeMap(hostKey, sc, {
                hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
              });
            });
          } else {
            federationInstance.initShareScopeMap(key, shareScope, {
              hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
            });
          }
        } else {
          shareScopeKey.forEach((key) => {
            if (!hostShareScopeKeys || !hostShareScopeMap) {
              federationInstance.initShareScopeMap(key, shareScope, {
                hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
              });
              return;
            }
            if (!hostShareScopeMap[key]) {
              hostShareScopeMap[key] = {};
            }
            const sc = hostShareScopeMap[key];
            federationInstance.initShareScopeMap(key, sc, {
              hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
            });
          });
        }
        if (webpackRequire.federation.attachShareScopeMap) {
          webpackRequire.federation.attachShareScopeMap(webpackRequire);
        }
        if (typeof webpackRequire.federation.prefetch === 'function') {
          webpackRequire.federation.prefetch();
        }
        if (!Array.isArray(shareScopeKey)) {
          // @ts-ignore
          return webpackRequire.I(shareScopeKey || 'default', initScope);
        }
        var proxyInitializeSharing = Boolean(
          webpackRequire.federation.initOptions.shared,
        );
        if (proxyInitializeSharing) {
          // @ts-ignore
          return webpackRequire.I(shareScopeKey, initScope);
        }
        // @ts-ignore
        return Promise.all(
          shareScopeKey.map((key) => {
            // @ts-ignore
            return webpackRequire.I(key, initScope);
          }),
        ).then(() => true);
      }
      function init({ webpackRequire }) {
        const {
          initOptions,
          runtime,
          sharedFallback,
          bundlerRuntime,
          libraryType,
        } = webpackRequire.federation;
        if (!initOptions) {
          throw new Error('initOptions is required!');
        }
        const treeShakingSharePlugin = function () {
          return {
            name: 'tree-shake-plugin',
            beforeInit(args) {
              const { userOptions, origin, options: registeredOptions } = args;
              const version = userOptions.version || registeredOptions.version;
              if (!sharedFallback) {
                return args;
              }
              const currentShared = userOptions.shared || {};
              const shared = [];
              Object.keys(currentShared).forEach((sharedName) => {
                const sharedArgs = Array.isArray(currentShared[sharedName])
                  ? currentShared[sharedName]
                  : [currentShared[sharedName]];
                sharedArgs.forEach((sharedArg) => {
                  shared.push([sharedName, sharedArg]);
                  if ('get' in sharedArg) {
                    sharedArg.treeShaking ||= {};
                    sharedArg.treeShaking.get = sharedArg.get;
                    sharedArg.get = bundlerRuntime.getSharedFallbackGetter({
                      shareKey: sharedName,
                      factory: sharedArg.get,
                      webpackRequire,
                      libraryType,
                      version: sharedArg.version,
                    });
                  }
                });
              });
              // read snapshot to override re-shake getter
              const hostGlobalSnapshot =
                _module_federation_runtime_helpers__WEBPACK_IMPORTED_MODULE_1__.global.getGlobalSnapshotInfoByModuleInfo(
                  {
                    name: origin.name,
                    version: version,
                  },
                );
              if (!hostGlobalSnapshot || !('shared' in hostGlobalSnapshot)) {
                return args;
              }
              Object.keys(registeredOptions.shared || {}).forEach((pkgName) => {
                const sharedInfo = registeredOptions.shared[pkgName];
                sharedInfo.forEach((sharedArg) => {
                  shared.push([pkgName, sharedArg]);
                });
              });
              const patchShared = (pkgName, shared) => {
                const shareSnapshot = hostGlobalSnapshot.shared.find(
                  (item) => item.sharedName === pkgName,
                );
                if (!shareSnapshot) {
                  return;
                }
                const { treeShaking } = shared;
                if (!treeShaking) {
                  return;
                }
                const {
                  secondarySharedTreeShakingName,
                  secondarySharedTreeShakingEntry,
                  treeShakingStatus,
                } = shareSnapshot;
                if (treeShaking.status === treeShakingStatus) {
                  return;
                }
                treeShaking.status = treeShakingStatus;
                if (
                  secondarySharedTreeShakingEntry &&
                  libraryType &&
                  secondarySharedTreeShakingName
                ) {
                  treeShaking.get = async () => {
                    const shareEntry = await (0,
                    _module_federation_runtime__WEBPACK_IMPORTED_MODULE_0__.getRemoteEntry)(
                      {
                        origin,
                        remoteInfo: {
                          name: secondarySharedTreeShakingName,
                          entry: secondarySharedTreeShakingEntry,
                          type: libraryType,
                          entryGlobalName: secondarySharedTreeShakingName,
                          // current not used
                          shareScope: 'default',
                        },
                      },
                    );
                    // TODO: add errorLoad hook ?
                    // @ts-ignore
                    await shareEntry.init(
                      origin,
                      // @ts-ignore
                      __webpack_require__.federation.bundlerRuntime,
                    );
                    // @ts-ignore
                    const getter = shareEntry.get();
                    return getter;
                  };
                }
              };
              shared.forEach(([pkgName, sharedArg]) => {
                patchShared(pkgName, sharedArg);
              });
              return args;
            },
          };
        };
        initOptions.plugins ||= [];
        initOptions.plugins.push(treeShakingSharePlugin());
        return runtime.init(initOptions);
      }
      const getSharedFallbackGetter = ({
        shareKey,
        factory,
        version,
        webpackRequire,
        libraryType = 'global',
      }) => {
        const { runtime, instance, bundlerRuntime, sharedFallback } =
          webpackRequire.federation;
        if (!sharedFallback) {
          return factory;
        }
        // { react: [  [ react/19.0.0/index.js , 19.0.0, react_global_name, var ]  ] }
        const fallbackItems = sharedFallback[shareKey];
        if (!fallbackItems) {
          return factory;
        }
        const fallbackItem = version
          ? fallbackItems.find((item) => item[1] === version)
          : fallbackItems[0];
        if (!fallbackItem) {
          throw new Error(
            `No fallback item found for shareKey: ${shareKey} and version: ${version}`,
          );
        }
        return () =>
          runtime
            .getRemoteEntry({
              origin: webpackRequire.federation.instance,
              remoteInfo: {
                name: fallbackItem[2],
                entry: `${webpackRequire.p}${fallbackItem[0]}`,
                type: libraryType,
                entryGlobalName: fallbackItem[2],
                // current not used
                shareScope: 'default',
              },
            })
            // @ts-ignore
            .then((shareEntry) => {
              if (!shareEntry) {
                throw new Error(
                  `Failed to load fallback entry for shareKey: ${shareKey} and version: ${version}`,
                );
              }
              return (
                shareEntry
                  // @ts-ignore
                  .init(webpackRequire.federation.instance, bundlerRuntime)
                  // @ts-ignore
                  .then(() => shareEntry.get())
              );
            });
      };
      const federation = {
        runtime: _module_federation_runtime__WEBPACK_IMPORTED_MODULE_0__,
        instance: undefined,
        initOptions: undefined,
        bundlerRuntime: {
          remotes,
          consumes,
          I: initializeSharing,
          S: {},
          installInitialConsumes,
          initContainerEntry,
          init,
          getSharedFallbackGetter,
        },
        attachShareScopeMap,
        bundlerRuntimeOptions: {},
      };

      /***/
    },

    /***/ 'data:text/javascript;base64,X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gbmV3IEZ1bmN0aW9uKCJjb25zdCBiYXNlPSh0eXBlb2Ygd2luZG93IT09J3VuZGVmaW5lZCcmJndpbmRvdy5sb2NhdGlvbj93aW5kb3cubG9jYXRpb24ub3JpZ2luOih0eXBlb2YgcHJvY2VzcyE9PSd1bmRlZmluZWQnJiZwcm9jZXNzLmVudiYmKHByb2Nlc3MuZW52LkFQUDJfQkFTRV9VUkx8fHByb2Nlc3MuZW52LlJTQ19BUElfT1JJR0lOKSl8fCdodHRwOi8vbG9jYWxob3N0OjQwMDEnKTtyZXR1cm4gYmFzZS5lbmRzV2l0aCgnLycpP2Jhc2U6YmFzZSsnLyciKSgp':
      /***/ (
        __unused_webpack___webpack_module__,
        __unused_webpack___webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.p = new Function(
          "const base=(typeof window!=='undefined'&&window.location?window.location.origin:(typeof process!=='undefined'&&process.env&&(process.env.APP2_BASE_URL||process.env.RSC_API_ORIGIN))||'http://localhost:4001');return base.endsWith('/')?base:base+'/'",
        )();

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
  /******/ // the startup function
  /******/ __webpack_require__.x = (x) => {};
  /************************************************************************/
  /******/ /* webpack/runtime/federation runtime */
  /******/ (() => {
    /******/ if (!__webpack_require__.federation) {
      /******/ __webpack_require__.federation = {
        /******/ initOptions: {
          name: 'app2',
          remotes: [
            {
              alias: 'app1',
              name: 'app1',
              entry: 'http://localhost:4101/mf-manifest.server.json',
              shareScope: ['rsc', 'client'],
              externalType: 'script',
            },
          ],
          shareStrategy: 'version-first',
        },
        /******/ chunkMatcher: function (chunkId) {
          return (
            '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom' != chunkId
          );
        },
        /******/ rootOutputDir: '',
        /******/ bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {
              app1: [
                {
                  alias: 'app1',
                  name: 'app1',
                  entry: 'http://localhost:4101/mf-manifest.server.json',
                  shareScope: ['rsc', 'client'],
                  externalType: 'script',
                },
              ],
            },
            webpackRequire: __webpack_require__,
            idToRemoteMap: {},
            chunkMapping: {},
            idToExternalAndNameMapping: {},
          },
        },
        /******/
      };
      /******/ __webpack_require__.consumesLoadingData = {};
      /******/ __webpack_require__.remotesLoadingData = {};
      /******/
    }
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule
          ? /******/ () => module['default']
          : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/ensure chunk */
  /******/ (() => {
    /******/ __webpack_require__.f = {};
    /******/ // This file contains only the entry chunk.
    /******/ // The chunk loading function for additional chunks
    /******/ __webpack_require__.e = (chunkId) => {
      /******/ return Promise.all(
        Object.keys(__webpack_require__.f).reduce((promises, key) => {
          /******/ __webpack_require__.f[key](chunkId, promises);
          /******/ return promises;
          /******/
        }, []),
      );
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/get javascript chunk filename */
  /******/ (() => {
    /******/ // This function allow to reference async chunks
    /******/ __webpack_require__.u = (chunkId) => {
      /******/ // return url for filenames based on template
      /******/ return 'server/' + chunkId + '.js';
      /******/
    };
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
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/remotes loading */
  /******/ (() => {
    /******/ var chunkMapping = {};
    /******/ var idToExternalAndNameMapping = {};
    /******/ var idToRemoteMap = {};
    /******/ __webpack_require__.federation.bundlerRuntimeOptions.remotes.chunkMapping =
      chunkMapping;
    /******/ __webpack_require__.federation.bundlerRuntimeOptions.remotes.idToExternalAndNameMapping =
      idToExternalAndNameMapping;
    /******/ __webpack_require__.federation.bundlerRuntimeOptions.remotes.idToRemoteMap =
      idToRemoteMap;
    /******/ __webpack_require__.remotesLoadingData.moduleIdToRemoteDataMapping =
      {};
    /******/ __webpack_require__.f.remotes = (chunkId, promises) => {
      /******/ __webpack_require__.federation.bundlerRuntime.remotes({
        idToRemoteMap,
        chunkMapping,
        idToExternalAndNameMapping,
        chunkId,
        promises,
        webpackRequire: __webpack_require__,
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/sharing */
  /******/ (() => {
    /******/ __webpack_require__.S = {};
    /******/ var initPromises = {};
    /******/ var initTokens = {};
    /******/ __webpack_require__.I = (name, initScope) => {
      /******/ if (!initScope) initScope = [];
      /******/ // handling circular init calls
      /******/ var initToken = initTokens[name];
      /******/ if (!initToken) initToken = initTokens[name] = {};
      /******/ if (initScope.indexOf(initToken) >= 0) return;
      /******/ initScope.push(initToken);
      /******/ // only runs once
      /******/ if (initPromises[name]) return initPromises[name];
      /******/ // creates a new share scope if needed
      /******/ if (!__webpack_require__.o(__webpack_require__.S, name))
        __webpack_require__.S[name] = {};
      /******/ // runs all init snippets from all modules reachable
      /******/ var scope = __webpack_require__.S[name];
      /******/ var warn = (msg) =>
        typeof console !== 'undefined' && console.warn && console.warn(msg);
      /******/ var uniqueName = 'app2';
      /******/ var register = (name, version, factory, eager) => {
        /******/ var versions = (scope[name] = scope[name] || {});
        /******/ var activeVersion = versions[version];
        /******/ if (
          !activeVersion ||
          (!activeVersion.loaded &&
            (!eager != !activeVersion.eager
              ? eager
              : uniqueName > activeVersion.from))
        )
          versions[version] = {
            get: factory,
            from: uniqueName,
            eager: !!eager,
          };
        /******/
      };
      /******/ var initExternal = (id) => {
        /******/ var handleError = (err) =>
          warn('Initialization of sharing external failed: ' + err);
        /******/ try {
          /******/ var module = __webpack_require__(id);
          /******/ if (!module) return;
          /******/ var initFn = (module) =>
            module &&
            module.init &&
            module.init(__webpack_require__.S[name], initScope);
          /******/ if (module.then)
            return promises.push(module.then(initFn, handleError));
          /******/ var initResult = initFn(module);
          /******/ if (initResult && initResult.then)
            return promises.push(initResult['catch'](handleError));
          /******/
        } catch (err) {
          handleError(err);
        }
        /******/
      };
      /******/ var promises = [];
      /******/ switch (name) {
        /******/ case 'client':
          {
            /******/ register('react-dom', '19.2.0', () =>
              __webpack_require__
                .e(
                  '_ssr_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-b1e41c0',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(ssr)/../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/index.js',
                    ),
                ),
            );
            /******/ register('react', '19.2.0', () =>
              __webpack_require__
                .e(
                  '_ssr_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-80c87f',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(ssr)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js',
                    ),
                ),
            );
            /******/
          }
          /******/ break;
        /******/ case 'rsc':
          {
            /******/ register(
              '@module-federation/react-server-dom-webpack/server.node.unbundled',
              '0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom',
                  ),
                  __webpack_require__.e(
                    '_rsc_packages_react-server-dom-webpack_server_node_unbundled_js',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../packages/react-server-dom-webpack/server.node.unbundled.js',
                    ),
                ),
            );
            /******/ register(
              '@module-federation/react-server-dom-webpack/server.node',
              '0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom',
                  ),
                  __webpack_require__.e(
                    '_rsc_packages_react-server-dom-webpack_server_node_js',
                  ),
                  __webpack_require__.e(
                    '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-23d6f40',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../packages/react-server-dom-webpack/server.node.js',
                    ),
                ),
            );
            /******/ register('@rsc-demo/shared', '0', () =>
              __webpack_require__
                .e('_rsc_shared_src_index_js-_d3710')
                .then(
                  () => () =>
                    __webpack_require__('(rsc)/../shared/src/index.js'),
                ),
            );
            /******/ register('react-dom', '19.2.0', () =>
              __webpack_require__
                .e(
                  '_rsc_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-a727751',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/index.js',
                    ),
                ),
            );
            /******/ register('react/jsx-dev-runtime', '0', () =>
              __webpack_require__
                .e(
                  '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-f17e77',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-dev-runtime.react-server.js',
                    ),
                ),
            );
            /******/ register('react/jsx-runtime', '0', () =>
              __webpack_require__
                .e(
                  '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-776ed9',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.react-server.js',
                    ),
                ),
            );
            /******/ register('react', '0', () =>
              __webpack_require__
                .e(
                  '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-23d6f41',
                )
                .then(
                  () => () =>
                    __webpack_require__(
                      '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
                    ),
                ),
            );
            /******/
          }
          /******/ break;
        /******/
      }
      /******/ if (!promises.length) return (initPromises[name] = 1);
      /******/ return (initPromises[name] = Promise.all(promises).then(
        () => (initPromises[name] = 1),
      ));
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/sharing */
  /******/ (() => {
    /******/ __webpack_require__.federation.initOptions.shared = {
      'react-dom': [
        {
          version: '19.2.0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_ssr_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-b1e41c0',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(ssr)/../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/index.js',
                  ),
              ),
          /******/ scope: ['client'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'ssr',
          },
          /******/
        },
        {
          version: '19.2.0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_rsc_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-a727751',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/index.js',
                  ),
              ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      react: [
        {
          version: '19.2.0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_ssr_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-80c87f',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(ssr)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js',
                  ),
              ),
          /******/ scope: ['client'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'ssr',
          },
          /******/
        },
        {
          version: '0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-23d6f41',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/react.react-server.js',
                  ),
              ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      '@module-federation/react-server-dom-webpack/server.node.unbundled': [
        {
          version: '0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom',
              ),
              __webpack_require__.e(
                '_rsc_packages_react-server-dom-webpack_server_node_unbundled_js',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  '(rsc)/../../../packages/react-server-dom-webpack/server.node.unbundled.js',
                ),
            ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      '@module-federation/react-server-dom-webpack/server.node': [
        {
          version: '0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom',
              ),
              __webpack_require__.e(
                '_rsc_packages_react-server-dom-webpack_server_node_js',
              ),
              __webpack_require__.e(
                '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-23d6f40',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  '(rsc)/../../../packages/react-server-dom-webpack/server.node.js',
                ),
            ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      '@rsc-demo/shared': [
        {
          version: '0',
          /******/ get: () =>
            __webpack_require__
              .e('_rsc_shared_src_index_js-_d3710')
              .then(
                () => () => __webpack_require__('(rsc)/../shared/src/index.js'),
              ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      'react/jsx-dev-runtime': [
        {
          version: '0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-f17e77',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-dev-runtime.react-server.js',
                  ),
              ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
      'react/jsx-runtime': [
        {
          version: '0',
          /******/ get: () =>
            __webpack_require__
              .e(
                '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-776ed9',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.react-server.js',
                  ),
              ),
          /******/ scope: ['rsc'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            singleton: true,
            layer: 'rsc',
          },
          /******/
        },
      ],
    };
    /******/ __webpack_require__.S = {};
    /******/ var initPromises = {};
    /******/ var initTokens = {};
    /******/ __webpack_require__.I = (name, initScope) => {
      /******/ return __webpack_require__.federation.bundlerRuntime.I({
        shareScopeName: name,
        /******/ webpackRequire: __webpack_require__,
        /******/ initPromises: initPromises,
        /******/ initTokens: initTokens,
        /******/ initScope: initScope,
        /******/
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/consumes */
  /******/ (() => {
    /******/ var installedModules = {};
    /******/ __webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping =
      {
        /******/ '(ssr)/webpack/sharing/consume/client/react/react': {
          /******/ fallback: () =>
            __webpack_require__
              .e(
                '_ssr_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-80c87f',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(ssr)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js',
                  ),
              ),
          /******/ shareScope: ['client'],
          /******/ singleton: true,
          /******/ requiredVersion: false,
          /******/ strictVersion: false,
          /******/ eager: false,
          /******/ layer: 'ssr',
          /******/ shareKey: 'react',
          /******/
          /******/
        },
        /******/ '(rsc)/webpack/sharing/consume/rsc/react-dom/react-dom': {
          /******/ fallback: () =>
            __webpack_require__
              .e(
                '_rsc_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-a727750',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../../../Library/pnpm/store/v10/links/@/react-dom/19.2.0/09f8862f9cadb2790b70b94ddb646e94427b7be0ff242c2c964e8bf83ca4dd56/node_modules/react-dom/index.js',
                  ),
              ),
          /******/ shareScope: ['rsc'],
          /******/ singleton: true,
          /******/ requiredVersion: false,
          /******/ strictVersion: false,
          /******/ eager: false,
          /******/ layer: 'rsc',
          /******/ shareKey: 'react-dom',
          /******/
          /******/
        },
        /******/ '(rsc)/webpack/sharing/consume/rsc/@module-federation/react-server-dom-webpack/server.node//Users/bytedance/dev/core/packages/react-server-dom-webpack/server.node.js':
          {
            /******/ fallback: () =>
              Promise.all([
                __webpack_require__.e(
                  '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom',
                ),
                __webpack_require__.e(
                  '_rsc_packages_react-server-dom-webpack_server_node_js',
                ),
                __webpack_require__.e(
                  '_rsc_Library_pnpm_store_v10_links_react_19_2_0_a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2-23d6f40',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    '(rsc)/../../../packages/react-server-dom-webpack/server.node.js',
                  ),
              ),
            /******/ shareScope: ['rsc'],
            /******/ singleton: true,
            /******/ requiredVersion: false,
            /******/ strictVersion: false,
            /******/ eager: false,
            /******/ layer: 'rsc',
            /******/ shareKey:
              '@module-federation/react-server-dom-webpack/server.node',
            /******/
            /******/
          },
        /******/
      };
    /******/ var moduleToHandlerMapping = {};
    /******/ // no consumes in initial chunks
    /******/ __webpack_require__.consumesLoadingData.chunkMapping = {
      /******/ '_ssr_Library_pnpm_store_v10_links_react-dom_19_2_0_09f8862f9cadb2790b70b94ddb646e94427b7be0ff-b1e41c0':
        [
          /******/ '(ssr)/webpack/sharing/consume/client/react/react',
          /******/
        ],
      /******/ '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom': [
        /******/ '(rsc)/webpack/sharing/consume/rsc/react-dom/react-dom',
        /******/
      ],
      /******/ '_rsc_shared_src_index_js-_d3710': [
        /******/ '(rsc)/webpack/sharing/consume/rsc/@module-federation/react-server-dom-webpack/server.node//Users/bytedance/dev/core/packages/react-server-dom-webpack/server.node.js',
        /******/
      ],
      /******/
    };
    /******/ __webpack_require__.f.consumes = (chunkId, promises) => {
      /******/ __webpack_require__.federation.bundlerRuntime.consumes({
        /******/ chunkMapping:
          __webpack_require__.consumesLoadingData.chunkMapping,
        /******/ installedModules: installedModules,
        /******/ chunkId: chunkId,
        /******/ moduleToHandlerMapping,
        /******/ promises: promises,
        /******/ webpackRequire: __webpack_require__,
        /******/
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/embed/federation */
  /******/ (() => {
    /******/ var prevStartup = __webpack_require__.x;
    /******/ var hasRun = false;
    /******/ __webpack_require__.x = () => {
      /******/ if (!hasRun) {
        /******/ hasRun = true;
        /******/ __webpack_require__(
          './node_modules/.federation/entry.ba72a59b5942274d001a6b4522111f1c.js',
        );
        /******/
      }
      /******/ if (typeof prevStartup === 'function') {
        /******/ return prevStartup();
        /******/
      } else {
        /******/ console.warn(
          '[Module Federation] prevStartup is not a function, skipping startup execution',
        );
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/readFile chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded chunks
    /******/ // "0" means "already loaded", Promise means loading
    /******/ var installedChunks = {
      /******/ app2: 0,
      /******/
    };
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ var installChunk = (chunk) => {
      /******/ var moreModules = chunk.modules,
        chunkIds = chunk.ids,
        runtime = chunk.runtime;
      /******/ for (var moduleId in moreModules) {
        /******/ if (__webpack_require__.o(moreModules, moduleId)) {
          /******/ __webpack_require__.m[moduleId] = moreModules[moduleId];
          /******/
        }
        /******/
      }
      /******/ if (runtime) runtime(__webpack_require__);
      /******/ for (var i = 0; i < chunkIds.length; i++) {
        /******/ if (installedChunks[chunkIds[i]]) {
          /******/ installedChunks[chunkIds[i]][0]();
          /******/
        }
        /******/ installedChunks[chunkIds[i]] = 0;
        /******/
      }
      /******/
      /******/
    };
    /******/
    /******/ // ReadFile + VM.run chunk loading for javascript
    /******/ __webpack_require__.f.readFileVm = function (chunkId, promises) {
      /******/
      /******/ var installedChunkData = installedChunks[chunkId];
      /******/ if (installedChunkData !== 0) {
        // 0 means "already installed".
        /******/ // array of [resolve, reject, promise] means "currently loading"
        /******/ if (installedChunkData) {
          /******/ promises.push(installedChunkData[2]);
          /******/
        } else {
          /******/ if (
            '_rsc_webpack_sharing_consume_rsc_react-dom_react-dom' != chunkId
          ) {
            /******/ // load the chunk and return promise to it
            /******/ var promise = new Promise(function (resolve, reject) {
              /******/ installedChunkData = installedChunks[chunkId] = [
                resolve,
                reject,
              ];
              /******/ var filename = require('path').join(
                __dirname,
                '' + __webpack_require__.u(chunkId),
              );
              /******/ require('fs').readFile(
                filename,
                'utf-8',
                function (err, content) {
                  /******/ if (err) return reject(err);
                  /******/ var chunk = {};
                  /******/ require('vm').runInThisContext(
                    '(function(exports, require, __dirname, __filename) {' +
                      content +
                      '\n})',
                    filename,
                  )(
                    chunk,
                    require,
                    require('path').dirname(filename),
                    filename,
                  );
                  /******/ installChunk(chunk);
                  /******/
                },
              );
              /******/
            });
            /******/ promises.push((installedChunkData[2] = promise));
            /******/
          } else installedChunks[chunkId] = 0;
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
    /******/ // no external install chunk
    /******/
    /******/ // no HMR
    /******/
    /******/ // no HMR manifest
    /******/
  })();
  /******/
  /************************************************************************/
  /******/ // run runtime startup
  /******/ __webpack_require__.x();
  /******/ // module cache are used so entry inlining is disabled
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ __webpack_require__(
    'data:text/javascript;base64,X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gbmV3IEZ1bmN0aW9uKCJjb25zdCBiYXNlPSh0eXBlb2Ygd2luZG93IT09J3VuZGVmaW5lZCcmJndpbmRvdy5sb2NhdGlvbj93aW5kb3cubG9jYXRpb24ub3JpZ2luOih0eXBlb2YgcHJvY2VzcyE9PSd1bmRlZmluZWQnJiZwcm9jZXNzLmVudiYmKHByb2Nlc3MuZW52LkFQUDJfQkFTRV9VUkx8fHByb2Nlc3MuZW52LlJTQ19BUElfT1JJR0lOKSl8fCdodHRwOi8vbG9jYWxob3N0OjQwMDEnKTtyZXR1cm4gYmFzZS5lbmRzV2l0aCgnLycpP2Jhc2U6YmFzZSsnLyciKSgp',
  );
  /******/ var __webpack_exports__ = __webpack_require__(
    'webpack/container/entry/app2',
  );
  /******/ module.exports.app2 = __webpack_exports__;
  /******/
  /******/
})();
//# sourceMappingURL=remoteEntry.server.js.map
