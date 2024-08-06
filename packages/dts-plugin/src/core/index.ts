export { retrieveRemoteConfig } from './configurations/remotePlugin';
export { retrieveHostConfig } from './configurations/hostPlugin';
export {
  getDTSManagerConstructor,
  validateOptions,
  retrieveTypesAssetsInfo,
  isTSProject,
} from './lib/utils';
export {
  retrieveOriginalOutDir,
  retrieveMfTypesPath,
} from './lib/typeScriptCompiler';
export { retrieveTypesZipPath } from './lib/archiveHandler';
export { generateTypes } from './lib/generateTypes';
export { generateTypesInChildProcess } from './lib/generateTypesInChildProcess';
export { DtsWorker } from './lib/DtsWorker';
export { consumeTypes } from './lib/consumeTypes';
export { DTSManager } from './lib/DTSManager';
export {
  HOST_API_TYPES_FILE_NAME,
  REMOTE_ALIAS_IDENTIFIER,
  REMOTE_API_TYPES_FILE_NAME,
} from './constant';

export type { DTSManagerOptions } from './interfaces/DTSManagerOptions';
export type { HostOptions } from './interfaces/HostOptions';
export type { RemoteOptions } from './interfaces/RemoteOptions';
export * as rpc from './rpc/index';
