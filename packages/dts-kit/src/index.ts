export { retrieveRemoteConfig } from './configurations/remotePlugin';
export { retrieveHostConfig } from './configurations/hostPlugin';
export {
  getDTSManagerConstructor,
  validateOptions,
  retrieveTypesAssetsInfo,
} from './lib/utils';
export {
  retrieveOriginalOutDir,
  retrieveMfTypesPath,
} from './lib/typeScriptCompiler';
export { retrieveTypesZipPath } from './lib/archiveHandler';
export { generateTypes } from './lib/generateTypes';
export { generateTypesInChildProcess } from './lib/generateTypesInChildProcess';
export { consumeTypes } from './lib/consumeTypes';
export { DTSManager } from './lib/DTSManager';
export {
  HOST_API_TYPES_FILE_NAME,
  REMOTE_ALIAS_IDENTIFIER,
  REMOTE_API_TYPES_FILE_NAME,
} from './constant';

export { DTSManagerOptions } from './interfaces/DTSManagerOptions';
export { HostOptions } from './interfaces/HostOptions';
export { RemoteOptions } from './interfaces/RemoteOptions';
