/**
 * @license React
 * react-server-dom-turbopack-client.node.unbundled.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var util = require('util');
var ReactDOM = require('react-dom');

// -----------------------------------------------------------------------------
const enableBinaryFlight = false;

function createStringDecoder() {
  return new util.TextDecoder();
}
const decoderOptions = {
  stream: true
};
function readPartialStringChunk(decoder, buffer) {
  return decoder.decode(buffer, decoderOptions);
}
function readFinalStringChunk(decoder, buffer) {
  return decoder.decode(buffer);
}

// This is the parsed shape of the wire format which is why it is
// condensed to only the essentialy information
const ID = 0;
const CHUNKS = 1;
const NAME = 2; // export const ASYNC = 3;
// This logic is correct because currently only include the 4th tuple member
// when the module is async. If that changes we will need to actually assert
// the value is true. We don't index into the 4th slot because flow does not
// like the potential out of bounds access

function isAsyncImport(metadata) {
  return metadata.length === 4;
}

// The reason this function needs to defined here in this file instead of just
// being exported directly from the WebpackDestination... file is because the
// ClientReferenceMetadata is opaque and we can't unwrap it there.
// This should get inlined and we could also just implement an unwrapping function
// though that risks it getting used in places it shouldn't be. This is unfortunate
// but currently it seems to be the best option we have.

function prepareDestinationForModule(moduleLoading, nonce, metadata) {
  prepareDestinationWithChunks(moduleLoading, metadata[CHUNKS], nonce);
}
function resolveClientReference(bundlerConfig, metadata) {
  const moduleExports = bundlerConfig[metadata[ID]];
  let resolvedModuleData = moduleExports[metadata[NAME]];
  let name;

  if (resolvedModuleData) {
    // The potentially aliased name.
    name = resolvedModuleData.name;
  } else {
    // If we don't have this specific name, we might have the full module.
    resolvedModuleData = moduleExports['*'];

    if (!resolvedModuleData) {
      throw new Error('Could not find the module "' + metadata[ID] + '" in the React SSR Manifest. ' + 'This is probably a bug in the React Server Components bundler.');
    }

    name = metadata[NAME];
  }

  return {
    specifier: resolvedModuleData.specifier,
    name: name,
    async: isAsyncImport(metadata)
  };
}
const asyncModuleCache = new Map();
function preloadModule(metadata) {
  const existingPromise = asyncModuleCache.get(metadata.specifier);

  if (existingPromise) {
    if (existingPromise.status === 'fulfilled') {
      return null;
    }

    return existingPromise;
  } else {
    // $FlowFixMe[unsupported-syntax]
    let modulePromise = import(metadata.specifier);

    if (metadata.async) {
      // If the module is async, it must have been a CJS module.
      // CJS modules are accessed through the default export in
      // Node.js so we have to get the default export to get the
      // full module exports.
      modulePromise = modulePromise.then(function (value) {
        return value.default;
      });
    }

    modulePromise.then(value => {
      const fulfilledThenable = modulePromise;
      fulfilledThenable.status = 'fulfilled';
      fulfilledThenable.value = value;
    }, reason => {
      const rejectedThenable = modulePromise;
      rejectedThenable.status = 'rejected';
      rejectedThenable.reason = reason;
    });
    asyncModuleCache.set(metadata.specifier, modulePromise);
    return modulePromise;
  }
}
function requireModule(metadata) {
  let moduleExports; // We assume that preloadModule has been called before, which
  // should have added something to the module cache.

  const promise = asyncModuleCache.get(metadata.specifier);

  if (promise.status === 'fulfilled') {
    moduleExports = promise.value;
  } else {
    throw promise.reason;
  }

  if (metadata.name === '*') {
    // This is a placeholder value that represents that the caller imported this
    // as a CommonJS module as is.
    return moduleExports;
  }

  if (metadata.name === '') {
    // This is a placeholder value that represents that the caller accessed the
    // default property of this if it was an ESM interop module.
    return moduleExports.default;
  }

  return moduleExports[metadata.name];
}

function prepareDestinationWithChunks(moduleLoading, // Chunks are single-indexed filenames
chunks, nonce) {
  if (moduleLoading !== null) {
    for (let i = 0; i < chunks.length; i++) {
      preinitScriptForSSR(moduleLoading.prefix + chunks[i], nonce, moduleLoading.crossOrigin);
    }
  }
}

const ReactDOMSharedInternals = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function getCrossOriginString(input) {
  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }

  return undefined;
}

// This client file is in the shared folder because it applies to both SSR and browser contexts.
const ReactDOMCurrentDispatcher = ReactDOMSharedInternals.Dispatcher;
function dispatchHint(code, model) {
  const dispatcher = ReactDOMCurrentDispatcher.current;

  if (dispatcher) {
    switch (code) {
      case 'D':
        {
          const refined = refineModel(code, model);
          const href = refined;
          dispatcher.prefetchDNS(href);
          return;
        }

      case 'C':
        {
          const refined = refineModel(code, model);

          if (typeof refined === 'string') {
            const href = refined;
            dispatcher.preconnect(href);
          } else {
            const href = refined[0];
            const crossOrigin = refined[1];
            dispatcher.preconnect(href, crossOrigin);
          }

          return;
        }

      case 'L':
        {
          const refined = refineModel(code, model);
          const href = refined[0];
          const as = refined[1];

          if (refined.length === 3) {
            const options = refined[2];
            dispatcher.preload(href, as, options);
          } else {
            dispatcher.preload(href, as);
          }

          return;
        }

      case 'm':
        {
          const refined = refineModel(code, model);

          if (typeof refined === 'string') {
            const href = refined;
            dispatcher.preloadModule(href);
          } else {
            const href = refined[0];
            const options = refined[1];
            dispatcher.preloadModule(href, options);
          }

          return;
        }

      case 'S':
        {
          const refined = refineModel(code, model);

          if (typeof refined === 'string') {
            const href = refined;
            dispatcher.preinitStyle(href);
          } else {
            const href = refined[0];
            const precedence = refined[1] === 0 ? undefined : refined[1];
            const options = refined.length === 3 ? refined[2] : undefined;
            dispatcher.preinitStyle(href, precedence, options);
          }

          return;
        }

      case 'X':
        {
          const refined = refineModel(code, model);

          if (typeof refined === 'string') {
            const href = refined;
            dispatcher.preinitScript(href);
          } else {
            const href = refined[0];
            const options = refined[1];
            dispatcher.preinitScript(href, options);
          }

          return;
        }

      case 'M':
        {
          const refined = refineModel(code, model);

          if (typeof refined === 'string') {
            const href = refined;
            dispatcher.preinitModuleScript(href);
          } else {
            const href = refined[0];
            const options = refined[1];
            dispatcher.preinitModuleScript(href, options);
          }

          return;
        }
    }
  }
} // Flow is having trouble refining the HintModels so we help it a bit.
// This should be compiled out in the production build.

function refineModel(code, model) {
  return model;
}
function preinitScriptForSSR(href, nonce, crossOrigin) {
  const dispatcher = ReactDOMCurrentDispatcher.current;

  if (dispatcher) {
    dispatcher.preinitScript(href, {
      crossOrigin: getCrossOriginString(crossOrigin),
      nonce
    });
  }
}

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const REACT_LAZY_TYPE = Symbol.for('react.lazy');
const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  const maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

const isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

function isArray(a) {
  return isArrayImpl(a);
}

const getPrototypeOf = Object.getPrototypeOf;

const ObjectPrototype = Object.prototype;
const knownServerReferences = new WeakMap(); // Serializable values
// Thenable<ReactServerValue>
// function serializeByValueID(id: number): string {
//   return '$' + id.toString(16);
// }

function serializePromiseID(id) {
  return '$@' + id.toString(16);
}

function serializeServerReferenceID(id) {
  return '$F' + id.toString(16);
}

function serializeSymbolReference(name) {
  return '$S' + name;
}

function serializeFormDataReference(id) {
  // Why K? F is "Function". D is "Date". What else?
  return '$K' + id.toString(16);
}

function serializeNumber(number) {
  if (Number.isFinite(number)) {
    if (number === 0 && 1 / number === -Infinity) {
      return '$-0';
    } else {
      return number;
    }
  } else {
    if (number === Infinity) {
      return '$Infinity';
    } else if (number === -Infinity) {
      return '$-Infinity';
    } else {
      return '$NaN';
    }
  }
}

function serializeUndefined() {
  return '$undefined';
}

function serializeDateFromDateJSON(dateJSON) {
  // JSON.stringify automatically calls Date.prototype.toJSON which calls toISOString.
  // We need only tack on a $D prefix.
  return '$D' + dateJSON;
}

function serializeBigInt(n) {
  return '$n' + n.toString(10);
}

function serializeMapID(id) {
  return '$Q' + id.toString(16);
}

function serializeSetID(id) {
  return '$W' + id.toString(16);
}

function escapeStringValue(value) {
  if (value[0] === '$') {
    // We need to escape $ prefixed strings since we use those to encode
    // references to IDs and as special symbol values.
    return '$' + value;
  } else {
    return value;
  }
}

function processReply(root, formFieldPrefix, resolve, reject) {
  let nextPartId = 1;
  let pendingParts = 0;
  let formData = null;

  function resolveToJSON(key, value) {
    const parent = this; // Make sure that `parent[key]` wasn't JSONified before `value` was passed to us

    if (value === null) {
      return null;
    }

    if (typeof value === 'object') {
      // $FlowFixMe[method-unbinding]
      if (typeof value.then === 'function') {
        // We assume that any object with a .then property is a "Thenable" type,
        // or a Promise type. Either of which can be represented by a Promise.
        if (formData === null) {
          // Upgrade to use FormData to allow us to stream this value.
          formData = new FormData();
        }

        pendingParts++;
        const promiseId = nextPartId++;
        const thenable = value;
        thenable.then(partValue => {
          const partJSON = JSON.stringify(partValue, resolveToJSON); // $FlowFixMe[incompatible-type] We know it's not null because we assigned it above.

          const data = formData; // eslint-disable-next-line react-internal/safe-string-coercion

          data.append(formFieldPrefix + promiseId, partJSON);
          pendingParts--;

          if (pendingParts === 0) {
            resolve(data);
          }
        }, reason => {
          // In the future we could consider serializing this as an error
          // that throws on the server instead.
          reject(reason);
        });
        return serializePromiseID(promiseId);
      }

      if (isArray(value)) {
        // $FlowFixMe[incompatible-return]
        return value;
      } // TODO: Should we the Object.prototype.toString.call() to test for cross-realm objects?


      if (value instanceof FormData) {
        if (formData === null) {
          // Upgrade to use FormData to allow us to use rich objects as its values.
          formData = new FormData();
        }

        const data = formData;
        const refId = nextPartId++; // Copy all the form fields with a prefix for this reference.
        // These must come first in the form order because we assume that all the
        // fields are available before this is referenced.

        const prefix = formFieldPrefix + refId + '_'; // $FlowFixMe[prop-missing]: FormData has forEach.

        value.forEach((originalValue, originalKey) => {
          data.append(prefix + originalKey, originalValue);
        });
        return serializeFormDataReference(refId);
      }

      if (value instanceof Map) {
        const partJSON = JSON.stringify(Array.from(value), resolveToJSON);

        if (formData === null) {
          formData = new FormData();
        }

        const mapId = nextPartId++;
        formData.append(formFieldPrefix + mapId, partJSON);
        return serializeMapID(mapId);
      }

      if (value instanceof Set) {
        const partJSON = JSON.stringify(Array.from(value), resolveToJSON);

        if (formData === null) {
          formData = new FormData();
        }

        const setId = nextPartId++;
        formData.append(formFieldPrefix + setId, partJSON);
        return serializeSetID(setId);
      }

      const iteratorFn = getIteratorFn(value);

      if (iteratorFn) {
        return Array.from(value);
      } // Verify that this is a simple plain object.


      const proto = getPrototypeOf(value);

      if (proto !== ObjectPrototype && (proto === null || getPrototypeOf(proto) !== null)) {
        throw new Error('Only plain objects, and a few built-ins, can be passed to Server Actions. ' + 'Classes or null prototypes are not supported.');
      }


      return value;
    }

    if (typeof value === 'string') {
      // TODO: Maybe too clever. If we support URL there's no similar trick.
      if (value[value.length - 1] === 'Z') {
        // Possibly a Date, whose toJSON automatically calls toISOString
        // $FlowFixMe[incompatible-use]
        const originalValue = parent[key];

        if (originalValue instanceof Date) {
          return serializeDateFromDateJSON(value);
        }
      }

      return escapeStringValue(value);
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return serializeNumber(value);
    }

    if (typeof value === 'undefined') {
      return serializeUndefined();
    }

    if (typeof value === 'function') {
      const metaData = knownServerReferences.get(value);

      if (metaData !== undefined) {
        const metaDataJSON = JSON.stringify(metaData, resolveToJSON);

        if (formData === null) {
          // Upgrade to use FormData to allow us to stream this value.
          formData = new FormData();
        } // The reference to this function came from the same client so we can pass it back.


        const refId = nextPartId++; // eslint-disable-next-line react-internal/safe-string-coercion

        formData.set(formFieldPrefix + refId, metaDataJSON);
        return serializeServerReferenceID(refId);
      }

      throw new Error('Client Functions cannot be passed directly to Server Functions. ' + 'Only Functions passed from the Server can be passed back again.');
    }

    if (typeof value === 'symbol') {
      // $FlowFixMe[incompatible-type] `description` might be undefined
      const name = value.description;

      if (Symbol.for(name) !== value) {
        throw new Error('Only global symbols received from Symbol.for(...) can be passed to Server Functions. ' + ("The symbol Symbol.for(" + // $FlowFixMe[incompatible-type] `description` might be undefined
        value.description + ") cannot be found among global symbols."));
      }

      return serializeSymbolReference(name);
    }

    if (typeof value === 'bigint') {
      return serializeBigInt(value);
    }

    throw new Error("Type " + typeof value + " is not supported as an argument to a Server Function.");
  } // $FlowFixMe[incompatible-type] it's not going to be undefined because we'll encode it.


  const json = JSON.stringify(root, resolveToJSON);

  if (formData === null) {
    // If it's a simple data structure, we just use plain JSON.
    resolve(json);
  } else {
    // Otherwise, we use FormData to let us stream in the result.
    formData.set(formFieldPrefix + '0', json);

    if (pendingParts === 0) {
      // $FlowFixMe[incompatible-call] this has already been refined.
      resolve(formData);
    }
  }
}
const boundCache = new WeakMap();

function encodeFormData(reference) {
  let resolve, reject; // We need to have a handle on the thenable so that we can synchronously set
  // its status from processReply, when it can complete synchronously.

  const thenable = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  processReply(reference, '', body => {
    if (typeof body === 'string') {
      const data = new FormData();
      data.append('0', body);
      body = data;
    }

    const fulfilled = thenable;
    fulfilled.status = 'fulfilled';
    fulfilled.value = body;
    resolve(body);
  }, e => {
    const rejected = thenable;
    rejected.status = 'rejected';
    rejected.reason = e;
    reject(e);
  });
  return thenable;
}

function defaultEncodeFormAction(identifierPrefix) {
  const reference = knownServerReferences.get(this);

  if (!reference) {
    throw new Error('Tried to encode a Server Action from a different instance than the encoder is from. ' + 'This is a bug in React.');
  }

  let data = null;
  let name;
  const boundPromise = reference.bound;

  if (boundPromise !== null) {
    let thenable = boundCache.get(reference);

    if (!thenable) {
      thenable = encodeFormData(reference);
      boundCache.set(reference, thenable);
    }

    if (thenable.status === 'rejected') {
      throw thenable.reason;
    } else if (thenable.status !== 'fulfilled') {
      throw thenable;
    }

    const encodedFormData = thenable.value; // This is hacky but we need the identifier prefix to be added to
    // all fields but the suspense cache would break since we might get
    // a new identifier each time. So we just append it at the end instead.

    const prefixedData = new FormData(); // $FlowFixMe[prop-missing]

    encodedFormData.forEach((value, key) => {
      prefixedData.append('$ACTION_' + identifierPrefix + ':' + key, value);
    });
    data = prefixedData; // We encode the name of the prefix containing the data.

    name = '$ACTION_REF_' + identifierPrefix;
  } else {
    // This is the simple case so we can just encode the ID.
    name = '$ACTION_ID_' + reference.id;
  }

  return {
    name: name,
    method: 'POST',
    encType: 'multipart/form-data',
    data: data
  };
}

function customEncodeFormAction(proxy, identifierPrefix, encodeFormAction) {
  const reference = knownServerReferences.get(proxy);

  if (!reference) {
    throw new Error('Tried to encode a Server Action from a different instance than the encoder is from. ' + 'This is a bug in React.');
  }

  let boundPromise = reference.bound;

  if (boundPromise === null) {
    boundPromise = Promise.resolve([]);
  }

  return encodeFormAction(reference.id, boundPromise);
}

function isSignatureEqual(referenceId, numberOfBoundArgs) {
  const reference = knownServerReferences.get(this);

  if (!reference) {
    throw new Error('Tried to encode a Server Action from a different instance than the encoder is from. ' + 'This is a bug in React.');
  }

  if (reference.id !== referenceId) {
    // These are different functions.
    return false;
  } // Now check if the number of bound arguments is the same.


  const boundPromise = reference.bound;

  if (boundPromise === null) {
    // No bound arguments.
    return numberOfBoundArgs === 0;
  } // Unwrap the bound arguments array by suspending, if necessary. As with
  // encodeFormData, this means isSignatureEqual can only be called while React
  // is rendering.


  switch (boundPromise.status) {
    case 'fulfilled':
      {
        const boundArgs = boundPromise.value;
        return boundArgs.length === numberOfBoundArgs;
      }

    case 'pending':
      {
        throw boundPromise;
      }

    case 'rejected':
      {
        throw boundPromise.reason;
      }

    default:
      {
        if (typeof boundPromise.status === 'string') ; else {
          const pendingThenable = boundPromise;
          pendingThenable.status = 'pending';
          pendingThenable.then(boundArgs => {
            const fulfilledThenable = boundPromise;
            fulfilledThenable.status = 'fulfilled';
            fulfilledThenable.value = boundArgs;
          }, error => {
            const rejectedThenable = boundPromise;
            rejectedThenable.status = 'rejected';
            rejectedThenable.reason = error;
          });
        }

        throw boundPromise;
      }
  }
}

function registerServerReference(proxy, reference, encodeFormAction) {
  // Expose encoder for use by SSR, as well as a special bind that can be used to
  // keep server capabilities.
  {
    // Only expose this in builds that would actually use it. Not needed on the client.
    const $$FORM_ACTION = encodeFormAction === undefined ? defaultEncodeFormAction : function (identifierPrefix) {
      return customEncodeFormAction(this, identifierPrefix, encodeFormAction);
    };
    Object.defineProperties(proxy, {
      $$FORM_ACTION: {
        value: $$FORM_ACTION
      },
      $$IS_SIGNATURE_EQUAL: {
        value: isSignatureEqual
      },
      bind: {
        value: bind
      }
    });
  }

  knownServerReferences.set(proxy, reference);
} // $FlowFixMe[method-unbinding]

const FunctionBind = Function.prototype.bind; // $FlowFixMe[method-unbinding]

const ArraySlice = Array.prototype.slice;

function bind() {
  // $FlowFixMe[unsupported-syntax]
  const newFn = FunctionBind.apply(this, arguments);
  const reference = knownServerReferences.get(this);

  if (reference) {

    const args = ArraySlice.call(arguments, 1);
    let boundPromise = null;

    if (reference.bound !== null) {
      boundPromise = Promise.resolve(reference.bound).then(boundArgs => boundArgs.concat(args));
    } else {
      boundPromise = Promise.resolve(args);
    } // Expose encoder for use by SSR, as well as a special bind that can be used to
    // keep server capabilities.


    {
      // Only expose this in builds that would actually use it. Not needed on the client.
      Object.defineProperties(newFn, {
        $$FORM_ACTION: {
          value: this.$$FORM_ACTION
        },
        $$IS_SIGNATURE_EQUAL: {
          value: isSignatureEqual
        },
        bind: {
          value: bind
        }
      });
    }

    knownServerReferences.set(newFn, {
      id: reference.id,
      bound: boundPromise
    });
  }

  return newFn;
}

function createServerReference$1(id, callServer, encodeFormAction) {
  const proxy = function () {
    // $FlowFixMe[method-unbinding]
    const args = Array.prototype.slice.call(arguments);
    return callServer(id, args);
  };

  registerServerReference(proxy, {
    id,
    bound: null
  }, encodeFormAction);
  return proxy;
}

const ROW_ID = 0;
const ROW_TAG = 1;
const ROW_LENGTH = 2;
const ROW_CHUNK_BY_NEWLINE = 3;
const ROW_CHUNK_BY_LENGTH = 4;
const PENDING = 'pending';
const BLOCKED = 'blocked';
const CYCLIC = 'cyclic';
const RESOLVED_MODEL = 'resolved_model';
const RESOLVED_MODULE = 'resolved_module';
const INITIALIZED = 'fulfilled';
const ERRORED = 'rejected'; // $FlowFixMe[missing-this-annot]

function Chunk(status, value, reason, response) {
  this.status = status;
  this.value = value;
  this.reason = reason;
  this._response = response;
} // We subclass Promise.prototype so that we get other methods like .catch


Chunk.prototype = Object.create(Promise.prototype); // TODO: This doesn't return a new Promise chain unlike the real .then

Chunk.prototype.then = function (resolve, reject) {
  const chunk = this; // If we have resolved content, we try to initialize it first which
  // might put us back into one of the other states.

  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;

    case RESOLVED_MODULE:
      initializeModuleChunk(chunk);
      break;
  } // The status might have changed after initialization.


  switch (chunk.status) {
    case INITIALIZED:
      resolve(chunk.value);
      break;

    case PENDING:
    case BLOCKED:
    case CYCLIC:
      if (resolve) {
        if (chunk.value === null) {
          chunk.value = [];
        }

        chunk.value.push(resolve);
      }

      if (reject) {
        if (chunk.reason === null) {
          chunk.reason = [];
        }

        chunk.reason.push(reject);
      }

      break;

    default:
      reject(chunk.reason);
      break;
  }
};

function readChunk(chunk) {
  // If we have resolved content, we try to initialize it first which
  // might put us back into one of the other states.
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;

    case RESOLVED_MODULE:
      initializeModuleChunk(chunk);
      break;
  } // The status might have changed after initialization.


  switch (chunk.status) {
    case INITIALIZED:
      return chunk.value;

    case PENDING:
    case BLOCKED:
    case CYCLIC:
      // eslint-disable-next-line no-throw-literal
      throw chunk;

    default:
      throw chunk.reason;
  }
}

function getRoot(response) {
  const chunk = getChunk(response, 0);
  return chunk;
}

function createPendingChunk(response) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(PENDING, null, null, response);
}

function createBlockedChunk(response) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(BLOCKED, null, null, response);
}

function createErrorChunk(response, error) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(ERRORED, null, error, response);
}

function wakeChunk(listeners, value) {
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener(value);
  }
}

function wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners) {
  switch (chunk.status) {
    case INITIALIZED:
      wakeChunk(resolveListeners, chunk.value);
      break;

    case PENDING:
    case BLOCKED:
    case CYCLIC:
      chunk.value = resolveListeners;
      chunk.reason = rejectListeners;
      break;

    case ERRORED:
      if (rejectListeners) {
        wakeChunk(rejectListeners, chunk.reason);
      }

      break;
  }
}

function triggerErrorOnChunk(chunk, error) {
  if (chunk.status !== PENDING && chunk.status !== BLOCKED) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  const listeners = chunk.reason;
  const erroredChunk = chunk;
  erroredChunk.status = ERRORED;
  erroredChunk.reason = error;

  if (listeners !== null) {
    wakeChunk(listeners, error);
  }
}

function createResolvedModelChunk(response, value) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(RESOLVED_MODEL, value, null, response);
}

function createResolvedModuleChunk(response, value) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(RESOLVED_MODULE, value, null, response);
}

function createInitializedTextChunk(response, value) {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(INITIALIZED, value, null, response);
}

function resolveModelChunk(chunk, value) {
  if (chunk.status !== PENDING) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  const resolveListeners = chunk.value;
  const rejectListeners = chunk.reason;
  const resolvedChunk = chunk;
  resolvedChunk.status = RESOLVED_MODEL;
  resolvedChunk.value = value;

  if (resolveListeners !== null) {
    // This is unfortunate that we're reading this eagerly if
    // we already have listeners attached since they might no
    // longer be rendered or might not be the highest pri.
    initializeModelChunk(resolvedChunk); // The status might have changed after initialization.

    wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
  }
}

function resolveModuleChunk(chunk, value) {
  if (chunk.status !== PENDING && chunk.status !== BLOCKED) {
    // We already resolved. We didn't expect to see this.
    return;
  }

  const resolveListeners = chunk.value;
  const rejectListeners = chunk.reason;
  const resolvedChunk = chunk;
  resolvedChunk.status = RESOLVED_MODULE;
  resolvedChunk.value = value;

  if (resolveListeners !== null) {
    initializeModuleChunk(resolvedChunk);
    wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
  }
}

let initializingChunk = null;
let initializingChunkBlockedModel = null;

function initializeModelChunk(chunk) {
  const prevChunk = initializingChunk;
  const prevBlocked = initializingChunkBlockedModel;
  initializingChunk = chunk;
  initializingChunkBlockedModel = null;
  const resolvedModel = chunk.value; // We go to the CYCLIC state until we've fully resolved this.
  // We do this before parsing in case we try to initialize the same chunk
  // while parsing the model. Such as in a cyclic reference.

  const cyclicChunk = chunk;
  cyclicChunk.status = CYCLIC;
  cyclicChunk.value = null;
  cyclicChunk.reason = null;

  try {
    const value = parseModel(chunk._response, resolvedModel);

    if (initializingChunkBlockedModel !== null && initializingChunkBlockedModel.deps > 0) {
      initializingChunkBlockedModel.value = value; // We discovered new dependencies on modules that are not yet resolved.
      // We have to go the BLOCKED state until they're resolved.

      const blockedChunk = chunk;
      blockedChunk.status = BLOCKED;
      blockedChunk.value = null;
      blockedChunk.reason = null;
    } else {
      const resolveListeners = cyclicChunk.value;
      const initializedChunk = chunk;
      initializedChunk.status = INITIALIZED;
      initializedChunk.value = value;

      if (resolveListeners !== null) {
        wakeChunk(resolveListeners, value);
      }
    }
  } catch (error) {
    const erroredChunk = chunk;
    erroredChunk.status = ERRORED;
    erroredChunk.reason = error;
  } finally {
    initializingChunk = prevChunk;
    initializingChunkBlockedModel = prevBlocked;
  }
}

function initializeModuleChunk(chunk) {
  try {
    const value = requireModule(chunk.value);
    const initializedChunk = chunk;
    initializedChunk.status = INITIALIZED;
    initializedChunk.value = value;
  } catch (error) {
    const erroredChunk = chunk;
    erroredChunk.status = ERRORED;
    erroredChunk.reason = error;
  }
} // Report that any missing chunks in the model is now going to throw this
// error upon read. Also notify any pending promises.


function reportGlobalError(response, error) {
  response._chunks.forEach(chunk => {
    // If this chunk was already resolved or errored, it won't
    // trigger an error but if it wasn't then we need to
    // because we won't be getting any new data to resolve it.
    if (chunk.status === PENDING) {
      triggerErrorOnChunk(chunk, error);
    }
  });
}

function createElement(type, key, props) {
  let element;

  {
    element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: null,
      props,
      // Record the component responsible for creating this element.
      _owner: null
    };
  }

  return element;
}

function createLazyChunkWrapper(chunk) {
  const lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: chunk,
    _init: readChunk
  };

  return lazyType;
}

function getChunk(response, id) {
  const chunks = response._chunks;
  let chunk = chunks.get(id);

  if (!chunk) {
    chunk = createPendingChunk(response);
    chunks.set(id, chunk);
  }

  return chunk;
}

function createModelResolver(chunk, parentObject, key, cyclic) {
  let blocked;

  if (initializingChunkBlockedModel) {
    blocked = initializingChunkBlockedModel;

    if (!cyclic) {
      blocked.deps++;
    }
  } else {
    blocked = initializingChunkBlockedModel = {
      deps: cyclic ? 0 : 1,
      value: null
    };
  }

  return value => {
    parentObject[key] = value;
    blocked.deps--;

    if (blocked.deps === 0) {
      if (chunk.status !== BLOCKED) {
        return;
      }

      const resolveListeners = chunk.value;
      const initializedChunk = chunk;
      initializedChunk.status = INITIALIZED;
      initializedChunk.value = blocked.value;

      if (resolveListeners !== null) {
        wakeChunk(resolveListeners, blocked.value);
      }
    }
  };
}

function createModelReject(chunk) {
  return error => triggerErrorOnChunk(chunk, error);
}

function createServerReferenceProxy(response, metaData) {
  const callServer = response._callServer;

  const proxy = function () {
    // $FlowFixMe[method-unbinding]
    const args = Array.prototype.slice.call(arguments);
    const p = metaData.bound;

    if (!p) {
      return callServer(metaData.id, args);
    }

    if (p.status === INITIALIZED) {
      const bound = p.value;
      return callServer(metaData.id, bound.concat(args));
    } // Since this is a fake Promise whose .then doesn't chain, we have to wrap it.
    // TODO: Remove the wrapper once that's fixed.


    return Promise.resolve(p).then(function (bound) {
      return callServer(metaData.id, bound.concat(args));
    });
  };

  registerServerReference(proxy, metaData, response._encodeFormAction);
  return proxy;
}

function getOutlinedModel(response, id) {
  const chunk = getChunk(response, id);

  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;
  } // The status might have changed after initialization.


  switch (chunk.status) {
    case INITIALIZED:
      {
        return chunk.value;
      }
    // We always encode it first in the stream so it won't be pending.

    default:
      throw chunk.reason;
  }
}

function parseModelString(response, parentObject, key, value) {
  if (value[0] === '$') {
    if (value === '$') {
      // A very common symbol.
      return REACT_ELEMENT_TYPE;
    }

    switch (value[1]) {
      case '$':
        {
          // This was an escaped string value.
          return value.slice(1);
        }

      case 'L':
        {
          // Lazy node
          const id = parseInt(value.slice(2), 16);
          const chunk = getChunk(response, id); // We create a React.lazy wrapper around any lazy values.
          // When passed into React, we'll know how to suspend on this.

          return createLazyChunkWrapper(chunk);
        }

      case '@':
        {
          // Promise
          if (value.length === 2) {
            // Infinite promise that never resolves.
            return new Promise(() => {});
          }

          const id = parseInt(value.slice(2), 16);
          const chunk = getChunk(response, id);
          return chunk;
        }

      case 'S':
        {
          // Symbol
          return Symbol.for(value.slice(2));
        }

      case 'F':
        {
          // Server Reference
          const id = parseInt(value.slice(2), 16);
          const metadata = getOutlinedModel(response, id);
          return createServerReferenceProxy(response, metadata);
        }

      case 'Q':
        {
          // Map
          const id = parseInt(value.slice(2), 16);
          const data = getOutlinedModel(response, id);
          return new Map(data);
        }

      case 'W':
        {
          // Set
          const id = parseInt(value.slice(2), 16);
          const data = getOutlinedModel(response, id);
          return new Set(data);
        }

      case 'I':
        {
          // $Infinity
          return Infinity;
        }

      case '-':
        {
          // $-0 or $-Infinity
          if (value === '$-0') {
            return -0;
          } else {
            return -Infinity;
          }
        }

      case 'N':
        {
          // $NaN
          return NaN;
        }

      case 'u':
        {
          // matches "$undefined"
          // Special encoding for `undefined` which can't be serialized as JSON otherwise.
          return undefined;
        }

      case 'D':
        {
          // Date
          return new Date(Date.parse(value.slice(2)));
        }

      case 'n':
        {
          // BigInt
          return BigInt(value.slice(2));
        }

      case 'E':

      default:
        {
          // We assume that anything else is a reference ID.
          const id = parseInt(value.slice(1), 16);
          const chunk = getChunk(response, id);

          switch (chunk.status) {
            case RESOLVED_MODEL:
              initializeModelChunk(chunk);
              break;

            case RESOLVED_MODULE:
              initializeModuleChunk(chunk);
              break;
          } // The status might have changed after initialization.


          switch (chunk.status) {
            case INITIALIZED:
              const chunkValue = chunk.value;

              return chunkValue;

            case PENDING:
            case BLOCKED:
            case CYCLIC:
              const parentChunk = initializingChunk;
              chunk.then(createModelResolver(parentChunk, parentObject, key, chunk.status === CYCLIC), createModelReject(parentChunk));
              return null;

            default:
              throw chunk.reason;
          }
        }
    }
  }

  return value;
}

function parseModelTuple(response, value) {
  const tuple = value;

  if (tuple[0] === REACT_ELEMENT_TYPE) {
    // TODO: Consider having React just directly accept these arrays as elements.
    // Or even change the ReactElement type to be an array.
    return createElement(tuple[1], tuple[2], tuple[3]);
  }

  return value;
}

function missingCall() {
  throw new Error('Trying to call a function from "use server" but the callServer option ' + 'was not implemented in your router runtime.');
}

function createResponse(bundlerConfig, moduleLoading, callServer, encodeFormAction, nonce) {
  const chunks = new Map();
  const response = {
    _bundlerConfig: bundlerConfig,
    _moduleLoading: moduleLoading,
    _callServer: callServer !== undefined ? callServer : missingCall,
    _encodeFormAction: encodeFormAction,
    _nonce: nonce,
    _chunks: chunks,
    _stringDecoder: createStringDecoder(),
    _fromJSON: null,
    _rowState: 0,
    _rowID: 0,
    _rowTag: 0,
    _rowLength: 0,
    _buffer: []
  }; // Don't inline this call because it causes closure to outline the call above.

  response._fromJSON = createFromJSONCallback(response);
  return response;
}

function resolveModel(response, id, model) {
  const chunks = response._chunks;
  const chunk = chunks.get(id);

  if (!chunk) {
    chunks.set(id, createResolvedModelChunk(response, model));
  } else {
    resolveModelChunk(chunk, model);
  }
}

function resolveText(response, id, text) {
  const chunks = response._chunks; // We assume that we always reference large strings after they've been
  // emitted.

  chunks.set(id, createInitializedTextChunk(response, text));
}

function resolveModule(response, id, model) {
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  const clientReferenceMetadata = parseModel(response, model);
  const clientReference = resolveClientReference(response._bundlerConfig, clientReferenceMetadata);
  prepareDestinationForModule(response._moduleLoading, response._nonce, clientReferenceMetadata); // TODO: Add an option to encode modules that are lazy loaded.
  // For now we preload all modules as early as possible since it's likely
  // that we'll need them.

  const promise = preloadModule(clientReference);

  if (promise) {
    let blockedChunk;

    if (!chunk) {
      // Technically, we should just treat promise as the chunk in this
      // case. Because it'll just behave as any other promise.
      blockedChunk = createBlockedChunk(response);
      chunks.set(id, blockedChunk);
    } else {
      // This can't actually happen because we don't have any forward
      // references to modules.
      blockedChunk = chunk;
      blockedChunk.status = BLOCKED;
    }

    promise.then(() => resolveModuleChunk(blockedChunk, clientReference), error => triggerErrorOnChunk(blockedChunk, error));
  } else {
    if (!chunk) {
      chunks.set(id, createResolvedModuleChunk(response, clientReference));
    } else {
      // This can't actually happen because we don't have any forward
      // references to modules.
      resolveModuleChunk(chunk, clientReference);
    }
  }
}

function resolveErrorProd(response, id, digest) {

  const error = new Error('An error occurred in the Server Components render. The specific message is omitted in production' + ' builds to avoid leaking sensitive details. A digest property is included on this error instance which' + ' may provide additional details about the nature of the error.');
  error.stack = 'Error: ' + error.message;
  error.digest = digest;
  const errorWithDigest = error;
  const chunks = response._chunks;
  const chunk = chunks.get(id);

  if (!chunk) {
    chunks.set(id, createErrorChunk(response, errorWithDigest));
  } else {
    triggerErrorOnChunk(chunk, errorWithDigest);
  }
}

function resolveHint(response, code, model) {
  const hintModel = parseModel(response, model);
  dispatchHint(code, hintModel);
}

function processFullRow(response, id, tag, buffer, chunk) {

  const stringDecoder = response._stringDecoder;
  let row = '';

  for (let i = 0; i < buffer.length; i++) {
    row += readPartialStringChunk(stringDecoder, buffer[i]);
  }

  row += readFinalStringChunk(stringDecoder, chunk);

  switch (tag) {
    case 73
    /* "I" */
    :
      {
        resolveModule(response, id, row);
        return;
      }

    case 72
    /* "H" */
    :
      {
        const code = row[0];
        resolveHint(response, code, row.slice(1));
        return;
      }

    case 69
    /* "E" */
    :
      {
        const errorInfo = JSON.parse(row);

        {
          resolveErrorProd(response, id, errorInfo.digest);
        }

        return;
      }

    case 84
    /* "T" */
    :
      {
        resolveText(response, id, row);
        return;
      }

    case 68
    /* "D" */
    :

    case 87
    /* "W" */
    :
      {

        throw new Error('Failed to read a RSC payload created by a development version of React ' + 'on the server while using a production version on the client. Always use ' + 'matching versions on the server and the client.');
      }

    case 80
    /* "P" */
    :
    // Fallthrough

    default:
      /* """ "{" "[" "t" "f" "n" "0" - "9" */
      {
        // We assume anything else is JSON.
        resolveModel(response, id, row);
        return;
      }
  }
}

function processBinaryChunk(response, chunk) {
  let i = 0;
  let rowState = response._rowState;
  let rowID = response._rowID;
  let rowTag = response._rowTag;
  let rowLength = response._rowLength;
  const buffer = response._buffer;
  const chunkLength = chunk.length;

  while (i < chunkLength) {
    let lastIdx = -1;

    switch (rowState) {
      case ROW_ID:
        {
          const byte = chunk[i++];

          if (byte === 58
          /* ":" */
          ) {
              // Finished the rowID, next we'll parse the tag.
              rowState = ROW_TAG;
            } else {
            rowID = rowID << 4 | (byte > 96 ? byte - 87 : byte - 48);
          }

          continue;
        }

      case ROW_TAG:
        {
          const resolvedRowTag = chunk[i];

          if (resolvedRowTag === 84
          /* "T" */
          || enableBinaryFlight 
          /* "V" */
          ) {
              rowTag = resolvedRowTag;
              rowState = ROW_LENGTH;
              i++;
            } else if (resolvedRowTag > 64 && resolvedRowTag < 91
          /* "A"-"Z" */
          ) {
              rowTag = resolvedRowTag;
              rowState = ROW_CHUNK_BY_NEWLINE;
              i++;
            } else {
            rowTag = 0;
            rowState = ROW_CHUNK_BY_NEWLINE; // This was an unknown tag so it was probably part of the data.
          }

          continue;
        }

      case ROW_LENGTH:
        {
          const byte = chunk[i++];

          if (byte === 44
          /* "," */
          ) {
              // Finished the rowLength, next we'll buffer up to that length.
              rowState = ROW_CHUNK_BY_LENGTH;
            } else {
            rowLength = rowLength << 4 | (byte > 96 ? byte - 87 : byte - 48);
          }

          continue;
        }

      case ROW_CHUNK_BY_NEWLINE:
        {
          // We're looking for a newline
          lastIdx = chunk.indexOf(10
          /* "\n" */
          , i);
          break;
        }

      case ROW_CHUNK_BY_LENGTH:
        {
          // We're looking for the remaining byte length
          lastIdx = i + rowLength;

          if (lastIdx > chunk.length) {
            lastIdx = -1;
          }

          break;
        }
    }

    const offset = chunk.byteOffset + i;

    if (lastIdx > -1) {
      // We found the last chunk of the row
      const length = lastIdx - i;
      const lastChunk = new Uint8Array(chunk.buffer, offset, length);
      processFullRow(response, rowID, rowTag, buffer, lastChunk); // Reset state machine for a new row

      i = lastIdx;

      if (rowState === ROW_CHUNK_BY_NEWLINE) {
        // If we're trailing by a newline we need to skip it.
        i++;
      }

      rowState = ROW_ID;
      rowTag = 0;
      rowID = 0;
      rowLength = 0;
      buffer.length = 0;
    } else {
      // The rest of this row is in a future chunk. We stash the rest of the
      // current chunk until we can process the full row.
      const length = chunk.byteLength - i;
      const remainingSlice = new Uint8Array(chunk.buffer, offset, length);
      buffer.push(remainingSlice); // Update how many bytes we're still waiting for. If we're looking for
      // a newline, this doesn't hurt since we'll just ignore it.

      rowLength -= remainingSlice.byteLength;
      break;
    }
  }

  response._rowState = rowState;
  response._rowID = rowID;
  response._rowTag = rowTag;
  response._rowLength = rowLength;
}

function parseModel(response, json) {
  return JSON.parse(json, response._fromJSON);
}

function createFromJSONCallback(response) {
  // $FlowFixMe[missing-this-annot]
  return function (key, value) {
    if (typeof value === 'string') {
      // We can't use .bind here because we need the "this" value.
      return parseModelString(response, this, key, value);
    }

    if (typeof value === 'object' && value !== null) {
      return parseModelTuple(response, value);
    }

    return value;
  };
}

function close(response) {
  // In case there are any remaining unresolved chunks, they won't
  // be resolved now. So we need to issue an error to those.
  // Ideally we should be able to early bail out if we kept a
  // ref count of pending chunks.
  reportGlobalError(response, new Error('Connection closed.'));
}

function noServerCall() {
  throw new Error('Server Functions cannot be called during initial render. ' + 'This would create a fetch waterfall. Try to use a Server Component ' + 'to pass data to Client Components instead.');
}

function createServerReference(id, callServer) {
  return createServerReference$1(id, noServerCall);
}

function createFromNodeStream(stream, ssrManifest, options) {
  const response = createResponse(ssrManifest.moduleMap, ssrManifest.moduleLoading, noServerCall, options ? options.encodeFormAction : undefined, options && typeof options.nonce === 'string' ? options.nonce : undefined);
  stream.on('data', chunk => {
    processBinaryChunk(response, chunk);
  });
  stream.on('error', error => {
    reportGlobalError(response, error);
  });
  stream.on('end', () => close(response));
  return getRoot(response);
}

exports.createFromNodeStream = createFromNodeStream;
exports.createServerReference = createServerReference;