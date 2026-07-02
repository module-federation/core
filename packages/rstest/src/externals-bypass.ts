import type { Rspack } from '@rsbuild/core';

import { NODE_RUNTIME_PLUGIN } from './runtime-plugin';

const DATA_JAVASCRIPT_REQUEST = /!=!data:text\/javascript(?:;|,)/i;

const isFederationRemoteRequest = (
  request: string,
  remoteNames: Set<string>,
): boolean => {
  if (!remoteNames.size) {
    return false;
  }

  for (const remoteName of remoteNames) {
    if (request === remoteName) {
      return true;
    }

    if (!request.startsWith(remoteName)) {
      continue;
    }

    const separator = request[remoteName.length];
    if (separator === '/' || separator === '@') {
      return true;
    }
  }

  return false;
};

export const shouldKeepBundledForFederation = (
  request: string,
  remoteNames?: Set<string>,
): boolean => {
  if (DATA_JAVASCRIPT_REQUEST.test(request)) {
    return true;
  }

  if (request === NODE_RUNTIME_PLUGIN) {
    return true;
  }

  if (request.startsWith('@module-federation/')) {
    return true;
  }

  if (request.startsWith('webpack/container/reference/')) {
    return true;
  }

  return remoteNames ? isFederationRemoteRequest(request, remoteNames) : false;
};

export const createFederationExternalBypass = (
  remoteNames: Set<string>,
): ((
  data: Rspack.ExternalItemFunctionData,
  callback: (
    err?: Error,
    result?: Rspack.ExternalItemValue,
    type?: Rspack.ExternalsType,
  ) => void,
) => void) => {
  return function federationExternalBypass({ request }, callback) {
    if (!request || !shouldKeepBundledForFederation(request, remoteNames)) {
      return callback();
    }

    return callback(undefined, false);
  };
};
