import {
  getShortErrorMsg,
  RUNTIME_009,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { assert, type ModuleFederation } from '@module-federation/runtime-core';
import { getInstance } from './index';

export function unloadRemoteFromInstance(
  instance: ModuleFederation,
  nameOrAlias: string,
): boolean {
  return instance.unloadRemote(nameOrAlias);
}

export function unloadRemote(nameOrAlias: string): boolean {
  const instance = getInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  return unloadRemoteFromInstance(instance, nameOrAlias);
}
