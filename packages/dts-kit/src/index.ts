export { retrieveRemoteConfig } from './configurations/remotePlugin';
export { retrieveHostConfig } from './configurations/hostPlugin';
export { getDTSManagerConstructor, validateOptions } from './lib/utils';
export { retrieveOriginalOutDir } from './lib/typeScriptCompiler';
export {
  generateTypes,
  generateTypesInChildProcess,
} from './lib/generateTypes';
export { consumeTypes } from './lib/consumeTypes';
export { DTSManager } from './lib/DTSManager';

export { DTSManagerOptions } from './interfaces/DTSManagerOptions';
export { HostOptions } from './interfaces/HostOptions';
export { RemoteOptions } from './interfaces/RemoteOptions';
